import { useState } from "react";
import { supabase } from "../../services/supabase";
import {
  FileText,
  DollarSign,
  Tags,
  Calendar,
  DivideCircle,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";
import "./TransactionForm.css";

export default function TransactionForm() {
  const [description, setDescription] = useState("");
  const [observation, setObservation] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [rawAmount, setRawAmount] = useState(0);
  const [expenseGroup, setExpenseGroup] = useState("boleto");

  const [dueDate, setDueDate] = useState("");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState("");
  const [installmentDates, setInstallmentDates] = useState([]);

  // Estado para controlar o carregamento e evitar cliques duplos
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showModal = (title, message, type = "success") => {
    setModalConfig({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (!value) {
      setDisplayAmount("");
      setRawAmount(0);
      return;
    }

    const numericValue = Number(value) / 100;
    setRawAmount(numericValue);

    const formatted = numericValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setDisplayAmount(formatted);
  };

  const handleInstallmentsChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    setInstallmentsCount(e.target.value);

    const newDates = [...installmentDates];
    while (newDates.length < count) {
      newDates.push("");
    }
    setInstallmentDates(newDates.slice(0, count));
  };

  const handleDateChange = (index, value) => {
    const newDates = [...installmentDates];
    newDates[index] = value;
    setInstallmentDates(newDates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Ativa o estado de carregamento

    try {
      const totalAmount = rawAmount;
      const transactionsToInsert = [];

      if (isInstallment && installmentsCount > 1) {
        const parcels = parseInt(installmentsCount);
        const parcelValue = totalAmount / parcels;

        for (let i = 0; i < parcels; i++) {
          if (!installmentDates[i]) {
            showModal(
              "Atenção",
              `Por favor, selecione a data de vencimento da Parcela ${i + 1}.`,
              "error",
            );
            setIsSubmitting(false);
            return;
          }
          transactionsToInsert.push({
            description: `${description} (Parcela ${i + 1}/${parcels})`,
            amount: parcelValue,
            type: "saida",
            due_date: installmentDates[i],
            payment_date: null,
            status: "pendente",
            expense_group: expenseGroup,
            observation: observation || null,
          });
        }
      } else {
        transactionsToInsert.push({
          description: description,
          amount: totalAmount,
          type: "saida",
          due_date: dueDate,
          payment_date: null,
          status: "pendente",
          expense_group: expenseGroup,
          observation: observation || null,
        });
      }

      const { error } = await supabase
        .from("fin_transactions")
        .insert(transactionsToInsert);
      if (error) throw error;

      showModal(
        "Sucesso!",
        "Lançamento registrado com sucesso no sistema.",
        "success",
      );

      setDescription("");
      setObservation("");
      setDisplayAmount("");
      setRawAmount(0);
      setDueDate("");
      setIsInstallment(false);
      setInstallmentsCount("");
      setInstallmentDates([]);
    } catch (error) {
      console.error("Erro ao salvar:", error.message);
      showModal(
        "Erro",
        "Ocorreu um erro ao salvar o lançamento. Tente novamente.",
        "error",
      );
    } finally {
      setIsSubmitting(false); // Desativa o carregamento ao terminar (com sucesso ou erro)
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h3 className="form-title">Novo Lançamento</h3>
        <p className="form-subtitle">
          Registre uma nova despesa ou documento a pagar no sistema.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Descrição da Despesa</label>
            <div className="input-wrapper">
              <FileText size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Ex: Nota Fiscal Rolemar"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isSubmitting}
                className="input-default"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Observação (Opcional)</label>
            <div className="input-wrapper">
              <MessageSquare size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Ex: Nota 12345 / Peças p/ suspensão"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                disabled={isSubmitting}
                className="input-default"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Valor Total (R$)</label>
            <div className="input-wrapper">
              <DollarSign size={18} className="input-icon" />
              <input
                type="text"
                placeholder="0,00"
                value={displayAmount}
                onChange={handleAmountChange}
                required
                disabled={isSubmitting}
                className="input-default"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Categoria de Despesa</label>
            <div className="input-wrapper">
              <Tags size={18} className="input-icon" />
              <select
                value={expenseGroup}
                onChange={(e) => setExpenseGroup(e.target.value)}
                disabled={isSubmitting}
                className="input-default"
                style={{ cursor: "pointer" }}
              >
                <option value="boleto">Boletos (Fornecedores / Peças)</option>
                <option value="oficina">
                  Contas da Oficina (Água, Luz, Folha)
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="checkbox-card">
          <input
            type="checkbox"
            id="parcelado"
            checked={isInstallment}
            onChange={(e) => setIsInstallment(e.target.checked)}
            disabled={isSubmitting}
            className="checkbox-input"
          />
          <label htmlFor="parcelado" className="checkbox-label">
            Dividir esta conta em múltiplas parcelas?
          </label>
        </div>

        {isInstallment && (
          <div className="input-group">
            <label className="input-label">Quantidade de Parcelas</label>
            <div className="input-wrapper">
              <DivideCircle size={18} className="input-icon" />
              <input
                type="number"
                placeholder="Ex: 3"
                min="2"
                max="120"
                value={installmentsCount}
                onChange={handleInstallmentsChange}
                required={isInstallment}
                disabled={isSubmitting}
                className="input-default"
              />
            </div>
          </div>
        )}

        {!isInstallment ? (
          <div className="input-group">
            <label className="input-label">Data de Vencimento</label>
            <div className="input-wrapper">
              <Calendar size={18} className="input-icon" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                disabled={isSubmitting}
                className="input-default"
              />
            </div>
          </div>
        ) : (
          <div className="dynamic-dates-grid">
            {installmentDates.map((date, index) => (
              <div key={index} className="input-group">
                <label className="input-label" style={{ color: "#059669" }}>
                  Vencimento {index + 1}ª Parcela
                </label>
                <div className="input-wrapper">
                  <Calendar
                    size={16}
                    className="input-icon"
                    style={{ left: "10px" }}
                  />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(index, e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="input-default"
                    style={{ paddingLeft: "34px" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="btn-submit"
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="spinner-animation" />
              Salvando dados...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              {isInstallment
                ? "Gerar Parcelas e Salvar"
                : "Registrar Lançamento"}
            </>
          )}
        </button>
      </form>

      {modalConfig.isOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon-wrapper">
              {modalConfig.type === "success" ? (
                <CheckCircle2 size={40} className="modal-icon success" />
              ) : (
                <AlertCircle size={40} className="modal-icon error" />
              )}
            </div>

            <h3 className="modal-title">{modalConfig.title}</h3>
            <p className="modal-message">{modalConfig.message}</p>

            <button onClick={closeModal} className="modal-btn">
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
