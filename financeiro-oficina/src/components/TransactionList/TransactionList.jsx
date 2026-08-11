import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import {
  CheckCircle2,
  Trash2,
  Undo2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  Calendar,
  Layers,
  X,
  AlertCircle,
} from "lucide-react";
import "./TransactionList.css";

export default function TransactionList({ filterGroup, title }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("semana");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSpecificDate, setSelectedSpecificDate] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [installmentGroup, setInstallmentGroup] = useState([]);
  const [currentParcelTitle, setCurrentParcelTitle] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // Estado para exclusão em lote de todas as parcelas do grupo
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const handlePrevMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    setCurrentDate(newDate);
    setActiveFilter("mes");
  };

  const handleNextMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    setCurrentDate(newDate);
    setActiveFilter("mes");
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
    setActiveFilter("hoje");
  };

  const handleSpecificDateChange = (e) => {
    const dateValue = e.target.value;
    if (dateValue) {
      setSelectedSpecificDate(dateValue);
      setActiveFilter("especifico");
    }
  };

  async function fetchTransactions() {
    setLoading(true);
    try {
      let query = supabase
        .from("fin_transactions")
        .select("*")
        .order("due_date", { ascending: true });

      if (filterGroup) {
        query = query.eq("expense_group", filterGroup);
      }

      const today = new Date();
      const formatDate = (date) => date.toISOString().split("T")[0];

      if (activeFilter === "atrasados") {
        query = query
          .lt("due_date", formatDate(today))
          .eq("status", "pendente");
      } else if (activeFilter === "hoje") {
        query = query.eq("due_date", formatDate(today));
      } else if (activeFilter === "semana") {
        const startOfWeek = formatDate(today);
        const endOfWeekDate = new Date();
        endOfWeekDate.setDate(today.getDate() + 7);
        query = query
          .gte("due_date", startOfWeek)
          .lte("due_date", formatDate(endOfWeekDate));
      } else if (activeFilter === "mes") {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const startOfMonth = `${year}-${month}-01`;
        const lastDay = new Date(year, currentDate.getMonth() + 1, 0).getDate();
        const endOfMonth = `${year}-${month}-${lastDay}`;

        query = query.gte("due_date", startOfMonth).lte("due_date", endOfMonth);
      } else if (activeFilter === "especifico" && selectedSpecificDate) {
        query = query.eq("due_date", selectedSpecificDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setTransactions(data);
    } catch (error) {
      console.error("Erro ao buscar:", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, [filterGroup, activeFilter, currentDate, selectedSpecificDate]);

  const handleOpenInstallmentHistory = async (description) => {
    const baseName = description.split(" (Parcela")[0].trim();
    setCurrentParcelTitle(baseName);

    try {
      const { data, error } = await supabase
        .from("fin_transactions")
        .select("*")
        .ilike("description", `${baseName} (Parcela%`)
        .order("due_date", { ascending: true });

      if (error) throw error;
      if (data) {
        setInstallmentGroup(data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico.");
    }
  };

  const handlePay = async (id) => {
    const exactTime = new Date().toISOString();
    try {
      const { error } = await supabase
        .from("fin_transactions")
        .update({ status: "pago", payment_date: exactTime })
        .eq("id", id);

      if (error) throw error;
      fetchTransactions();
      if (isModalOpen) {
        handleOpenInstallmentHistory(currentParcelTitle + " (Parcela 1");
      }
    } catch (error) {
      console.error("Erro ao dar baixa.");
    }
  };

  const handleUndo = async (id) => {
    try {
      const { error } = await supabase
        .from("fin_transactions")
        .update({ status: "pendente", payment_date: null })
        .eq("id", id);

      if (error) throw error;
      fetchTransactions();
      if (isModalOpen) {
        handleOpenInstallmentHistory(currentParcelTitle + " (Parcela 1");
      }
    } catch (error) {
      console.error("Erro ao desfazer pagamento.");
    }
  };

  const confirmDelete = (id) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteExecution = async () => {
    if (!transactionToDelete) return;

    try {
      const { error } = await supabase
        .from("fin_transactions")
        .delete()
        .eq("id", transactionToDelete);

      if (error) throw error;

      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
      fetchTransactions();

      if (isModalOpen) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao excluir.");
    }
  };

  // Função para excluir todas as parcelas do grupo atual de uma vez
  const handleDeleteAllInstallmentsExecution = async () => {
    try {
      const { error } = await supabase
        .from("fin_transactions")
        .delete()
        .ilike("description", `${currentParcelTitle} (Parcela%`);

      if (error) throw error;

      setIsDeleteAllModalOpen(false);
      setIsModalOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error("Erro ao excluir todas as parcelas:", error.message);
    }
  };

  return (
    <div className="transaction-list-container">
      <div className="transaction-header-box">
        <h3 className="transaction-title">{title}</h3>
      </div>

      <div className="filters-container">
        <div className="filters-bar">
          <button
            className={`filter-btn ${activeFilter === "atrasados" ? "active" : ""}`}
            onClick={() => setActiveFilter("atrasados")}
            style={{
              color: activeFilter === "atrasados" ? "#fff" : "#dc2626",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertTriangle size={15} />
            Atrasados
          </button>

          <button
            className={`filter-btn ${activeFilter === "hoje" ? "active" : ""}`}
            onClick={handleTodayClick}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <CalendarDays size={15} />
            Hoje
          </button>

          <button
            className={`filter-btn ${activeFilter === "semana" ? "active" : ""}`}
            onClick={() => setActiveFilter("semana")}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <CalendarRange size={15} />
            Semana
          </button>

          <button
            className={`filter-btn ${activeFilter === "mes" ? "active" : ""}`}
            onClick={() => setActiveFilter("mes")}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Calendar size={15} />
            Mês Inteiro
          </button>
        </div>

        <div className="date-controls-wrapper">
          <div className="month-navigator">
            <button
              onClick={handlePrevMonth}
              className="nav-month-btn"
              title="Mês Anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              {monthNames[currentDate.getMonth()]} / {currentDate.getFullYear()}
            </span>
            <button
              onClick={handleNextMonth}
              className="nav-month-btn"
              title="Próximo Mês"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <input
            type="date"
            value={selectedSpecificDate}
            onChange={handleSpecificDateChange}
            className="specific-date-input"
            title="Ir para um dia específico"
          />
        </div>
      </div>

      {loading ? (
        <p className="empty-message">Carregando lançamentos...</p>
      ) : transactions.length === 0 ? (
        <p className="empty-message">
          Nenhum lançamento encontrado para este período.
        </p>
      ) : (
        <ul className="transaction-ul">
          {transactions.map((t) => {
            const isInstallment = t.description.includes("(Parcela");

            return (
              <li key={t.id} className={`transaction-li ${t.status}`}>
                <div className="info-container">
                  <strong className="desc">{t.description}</strong>

                  {t.observation && (
                    <div
                      className="details"
                      style={{
                        fontStyle: "italic",
                        color: "#64748b",
                        fontSize: "0.85rem",
                        marginTop: "4px",
                      }}
                    >
                      📝 {t.observation}
                    </div>
                  )}

                  <div className="details">
                    <span>
                      Vencimento:{" "}
                      {new Date(t.due_date).toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      Status: <span className="status-badge">{t.status}</span>
                    </span>
                  </div>

                  {t.status === "pago" && t.payment_date && (
                    <div className="payment-date">
                      ✔ Pago em{" "}
                      {new Date(t.payment_date).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                  )}
                </div>

                <div className="actions-container">
                  <span className="amount">
                    R${" "}
                    {t.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>

                  <div className="buttons-wrapper">
                    {isInstallment && (
                      <button
                        onClick={() =>
                          handleOpenInstallmentHistory(t.description)
                        }
                        title="Ver Histórico de Parcelas"
                        className="btn-action btn-history"
                        style={{
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          padding: "6px 10px",
                        }}
                      >
                        <Layers size={14} /> Histórico
                      </button>
                    )}

                    {t.status === "pendente" ? (
                      <button
                        onClick={() => handlePay(t.id)}
                        title="Dar Baixa"
                        className="btn-action btn-pay"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUndo(t.id)}
                        title="Desfazer Pagamento"
                        className="btn-action btn-undo"
                      >
                        <Undo2 size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => confirmDelete(t.id)}
                      title="Excluir Lançamento"
                      className="btn-action btn-delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* MODAL DE HISTÓRICO DE PARCELAS COM BOTÃO DE EXCLUIR TODAS */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Histórico de Parcelas: {currentParcelTitle}</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <ul className="transaction-ul">
                {installmentGroup.map((parcel) => (
                  <li
                    key={parcel.id}
                    className={`transaction-li ${parcel.status}`}
                    style={{ padding: "12px 16px" }}
                  >
                    <div className="info-container">
                      <strong className="desc" style={{ fontSize: "0.95rem" }}>
                        {parcel.description}
                      </strong>
                      <div className="details">
                        <span>
                          Vencimento:{" "}
                          {new Date(parcel.due_date).toLocaleDateString(
                            "pt-BR",
                            { timeZone: "UTC" },
                          )}
                        </span>
                        <span>•</span>
                        <span>
                          Status:{" "}
                          <span className="status-badge">{parcel.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="actions-container">
                      <span className="amount" style={{ fontSize: "1rem" }}>
                        R${" "}
                        {parcel.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <div className="buttons-wrapper">
                        {parcel.status === "pendente" ? (
                          <button
                            onClick={() => handlePay(parcel.id)}
                            title="Dar Baixa"
                            className="btn-action btn-pay"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUndo(parcel.id)}
                            title="Desfazer"
                            className="btn-action btn-undo"
                          >
                            <Undo2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => confirmDelete(parcel.id)}
                          title="Excluir Parcela"
                          className="btn-action btn-delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rodapé do Modal de Histórico com opção de apagar todas */}
            <div
              style={{
                marginTop: "20px",
                paddingTop: "15px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setIsDeleteAllModalOpen(true)}
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Trash2 size={15} /> Excluir Todas as Parcelas deste Grupo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ÚNICA */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "380px" }}>
            <div className="modal-icon-wrapper">
              <AlertCircle size={40} className="modal-icon error" />
            </div>

            <h3 className="modal-title">Excluir Lançamento</h3>
            <p className="modal-message">
              Tem certeza que deseja apagar este lançamento permanentemente?
            </p>

            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteExecution}
                style={{
                  flex: 1,
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE TODAS AS PARCELAS */}
      {isDeleteAllModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "400px" }}>
            <div className="modal-icon-wrapper">
              <AlertCircle size={40} className="modal-icon error" />
            </div>

            <h3 className="modal-title">Excluir Grupo de Parcelas</h3>
            <p className="modal-message">
              Deseja realmente apagar <b>todas</b> as parcelas associadas a "
              {currentParcelTitle}" de uma só vez?
            </p>

            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <button
                onClick={() => setIsDeleteAllModalOpen(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAllInstallmentsExecution}
                style={{
                  flex: 1,
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Sim, Excluir Todas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
