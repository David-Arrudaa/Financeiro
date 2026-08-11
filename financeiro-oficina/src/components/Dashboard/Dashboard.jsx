import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertOctagon,
  PlusCircle,
  FileText,
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMes: 0,
    totalPago: 0,
    totalPendente: 0,
    totalAtrasado: 0,
  });
  const [loading, setLoading] = useState(true);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Pega o primeiro e o último dia do mês atual
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const startOfMonth = `${year}-${month}-01`;
      const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
      const endOfMonth = `${year}-${month}-${lastDay}`;
      const todayStr = today.toISOString().split("T")[0];

      // Busca todas as transações do mês
      const { data, error } = await supabase
        .from("fin_transactions")
        .select("*")
        .gte("due_date", startOfMonth)
        .lte("due_date", endOfMonth);

      if (error) throw error;

      let mes = 0;
      let pago = 0;
      let pendente = 0;
      let atrasado = 0;

      data.forEach((t) => {
        mes += t.amount;
        if (t.status === "pago") {
          pago += t.amount;
        } else {
          pendente += t.amount;
          // Se o vencimento é anterior a hoje e continua pendente, conta como atrasado
          if (t.due_date < todayStr) {
            atrasado += t.amount;
          }
        }
      });

      setStats({
        totalMes: mes,
        totalPago: pago,
        totalPendente: pendente,
        totalAtrasado: atrasado,
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Painel Geral - Autocar BS</h2>
        <p className="dashboard-subtitle">
          Visão consolidada da saúde financeira e operacional do mês.
        </p>
      </div>

      {/* CARDS DE INDICADORES (KPIs) */}
      <div className="kpi-grid">
        <div className="kpi-card total">
          <div className="kpi-header">
            <span>Total do Mês</span>
            <DollarSign size={20} color="#3b82f6" />
          </div>
          <p className="kpi-value">
            R${" "}
            {stats.totalMes.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="kpi-card pago">
          <div className="kpi-header">
            <span>Total Pago</span>
            <CheckCircle size={20} color="#059669" />
          </div>
          <p className="kpi-value">
            R${" "}
            {stats.totalPago.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="kpi-card pendente">
          <div className="kpi-header">
            <span>A Pagar (Pendente)</span>
            <Clock size={20} color="#d97706" />
          </div>
          <p className="kpi-value">
            R${" "}
            {stats.totalPendente.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="kpi-card atrasado">
          <div className="kpi-header">
            <span>Em Atraso</span>
            <AlertOctagon size={20} color="#dc2626" />
          </div>
          <p className="kpi-value">
            R${" "}
            {stats.totalAtrasado.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* ATALHOS RÁPIDOS */}
      <div className="dashboard-section">
        <h3 className="section-title">Ações Rápidas</h3>
        <div className="quick-actions">
          <Link to="/novo-lancamento" className="action-btn">
            <PlusCircle size={18} color="#059669" />
            Novo Lançamento
          </Link>
          <Link to="/boletos" className="action-btn">
            <FileText size={18} color="#3b82f6" />
            Gerenciar Boletos
          </Link>
          <Link to="/contas-oficina" className="action-btn">
            <FileText size={18} color="#d97706" />
            Contas da Oficina
          </Link>
        </div>
      </div>
    </div>
  );
}
