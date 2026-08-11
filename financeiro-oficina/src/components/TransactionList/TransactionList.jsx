import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        // Busca as transações no banco, ordenadas da mais antiga para a mais nova pelo vencimento
        const { data, error } = await supabase
          .from("fin_transactions")
          .select("*")
          .order("due_date", { ascending: true });

        if (error) throw error;
        if (data) setTransactions(data);
      } catch (error) {
        console.error("Erro ao buscar lançamentos:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []); // A lista vazia faz buscar os dados apenas quando o componente carrega

  if (loading) return <p>Carregando lançamentos...</p>;

  return (
    <div
      style={{
        marginTop: "40px",
        borderTop: "2px solid #333",
        paddingTop: "20px",
      }}
    >
      <h3>Contas a Pagar e Receber</h3>

      {transactions.length === 0 ? (
        <p>Nenhum lançamento encontrado.</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {transactions.map((t) => (
            <li
              key={t.id}
              style={{
                padding: "15px",
                marginBottom: "10px",
                backgroundColor: "#1e1e1e", // Cor de fundo escura para combinar com seu layout
                borderRadius: "8px",
                // Linha lateral verde para entrada e vermelha para saída
                borderLeft:
                  t.type === "saida"
                    ? "5px solid #ff4d4d"
                    : "5px solid #4CAF50",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <strong>{t.description}</strong>
                <span
                  style={{
                    color: t.type === "saida" ? "#ff4d4d" : "#4CAF50",
                    fontWeight: "bold",
                  }}
                >
                  R$ {t.amount.toFixed(2)}
                </span>
              </div>
              <div style={{ fontSize: "0.9em", color: "#aaa" }}>
                Vencimento: {new Date(t.due_date).toLocaleDateString("pt-BR")} |
                Status:{" "}
                <span style={{ textTransform: "uppercase" }}>{t.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
