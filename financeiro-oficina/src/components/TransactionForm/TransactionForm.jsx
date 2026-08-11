import { useState } from "react";
import { supabase } from "../../services/supabase";

export default function TransactionForm() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseGroup, setExpenseGroup] = useState("boleto");

  // Data única (usada quando NÃO é parcelado)
  const [dueDate, setDueDate] = useState("");

  // Controles de parcelamento
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState("");
  // Novo estado: um array (lista) para guardar a data de CADA parcela separadamente
  const [installmentDates, setInstallmentDates] = useState([]);

  // Função inteligente que cria as "caixinhas" de data conforme você digita o número de parcelas
  const handleInstallmentsChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    setInstallmentsCount(e.target.value);

    const newDates = [...installmentDates];
    // Se você aumentou o número, ele cria mais campos vazios
    while (newDates.length < count) {
      newDates.push("");
    }
    // Salva exatamente a quantidade de datas que você pediu
    setInstallmentDates(newDates.slice(0, count));
  };

  // Função que atualiza a data de uma parcela específica
  const handleDateChange = (index, value) => {
    const newDates = [...installmentDates];
    newDates[index] = value;
    setInstallmentDates(newDates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const totalAmount = parseFloat(amount);
      const transactionsToInsert = [];

      if (isInstallment && installmentsCount > 1) {
        // LÓGICA PARA COMPRA PARCELADA
        const parcels = parseInt(installmentsCount);
        const parcelValue = totalAmount / parcels;

        for (let i = 0; i < parcels; i++) {
          // Trava de segurança: impede salvar se esquecer de preencher alguma data
          if (!installmentDates[i]) {
            alert(
              `Por favor, selecione a data de vencimento da Parcela ${i + 1}.`,
            );
            return;
          }

          transactionsToInsert.push({
            description: `${description} (Parcela ${i + 1}/${parcels})`,
            amount: parcelValue,
            type: "saida",
            due_date: installmentDates[i], // Pega a data exata que você escolheu para esta parcela
            payment_date: null,
            status: "pendente",
            expense_group: expenseGroup,
          });
        }
      } else {
        // LÓGICA PARA COMPRA ÚNICA (Sem parcelamento)
        transactionsToInsert.push({
          description: description,
          amount: totalAmount,
          type: "saida",
          due_date: dueDate,
          payment_date: null,
          status: "pendente",
          expense_group: expenseGroup,
        });
      }

      // Manda tudo para o Supabase (seja 1 ou 30 registros, ele salva de uma vez)
      const { error } = await supabase
        .from("fin_transactions")
        .insert(transactionsToInsert);

      if (error) throw error;

      alert("Lançamento registrado com sucesso!");

      // Limpa os campos após o sucesso
      setDescription("");
      setAmount("");
      setDueDate("");
      setIsInstallment(false);
      setInstallmentsCount("");
      setInstallmentDates([]);
    } catch (error) {
      console.error("Erro ao salvar:", error.message);
      alert("Erro ao salvar o lançamento.");
    }
  };

  return (
    <div
      style={{
        border: "1px solid #334155",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: "#1e293b",
        color: "#fff",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#38bdf8" }}>
        Novo Lançamento de Despesa
      </h3>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="text"
          placeholder="Descrição (ex: Nota Fiscal Rolemar)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ padding: "10px", borderRadius: "5px", border: "none" }}
        />

        <input
          type="number"
          placeholder="Valor Total da Compra (R$)"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ padding: "10px", borderRadius: "5px", border: "none" }}
        />

        <select
          value={expenseGroup}
          onChange={(e) => setExpenseGroup(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "2px solid #ef4444",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            fontWeight: "bold",
          }}
        >
          <option value="boleto">Destino: Boleto (Fornecedores / Peças)</option>
          <option value="oficina">
            Destino: Conta da Oficina (Água, Luz, Aluguel, Funcionários)
          </option>
        </select>

        {/* --- ÁREA DE PARCELAMENTO --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#334155",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <input
            type="checkbox"
            id="parcelado"
            checked={isInstallment}
            onChange={(e) => setIsInstallment(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <label
            htmlFor="parcelado"
            style={{ cursor: "pointer", fontWeight: "bold" }}
          >
            Compra Parcelada?
          </label>
        </div>

        {isInstallment && (
          <input
            type="number"
            placeholder="Em quantas vezes?"
            min="2"
            max="120"
            value={installmentsCount}
            onChange={handleInstallmentsChange} // Chama nossa nova função aqui
            required={isInstallment}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "2px solid #38bdf8",
              backgroundColor: "#0f172a",
              color: "#fff",
            }}
          />
        )}

        {/* --- EXIBIÇÃO DINÂMICA DAS DATAS --- */}
        {!isInstallment ? (
          // Se NÃO for parcelado, mostra apenas 1 campo de data comum
          <>
            <label style={{ fontSize: "14px", color: "#94a3b8" }}>
              Data de Vencimento:
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              style={{ padding: "10px", borderRadius: "5px", border: "none" }}
            />
          </>
        ) : (
          // Se FOR parcelado, desenha um campo de data para cada parcela!
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {installmentDates.map((date, index) => (
              <div
                key={index}
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label
                  style={{
                    fontSize: "14px",
                    color: "#38bdf8",
                    fontWeight: "bold",
                  }}
                >
                  Data da Parcela {index + 1}:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(index, e.target.value)}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #334155",
                    backgroundColor: "#0f172a",
                    color: "#fff",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          style={{
            padding: "12px",
            cursor: "pointer",
            backgroundColor: "#38bdf8",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          {isInstallment ? "Salvar Todas as Parcelas" : "Salvar Lançamento"}
        </button>
      </form>
    </div>
  );
}
