import { useState } from "react";
import { Link } from "react-router-dom";
// Trocamos os ícones para combinar com a nova regra de negócio
import {
  LayoutDashboard,
  PlusSquare,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Barcode,
  Building,
} from "lucide-react";

export default function Sidebar() {
  const [isFinanceiroOpen, setIsFinanceiroOpen] = useState(false);

  const closeSubmenus = () => {
    setIsFinanceiroOpen(false);
  };

  const sidebarStyle = {
    width: "250px",
    height: "100vh",
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: "20px 0",
    position: "fixed",
    left: 0,
    top: 0,
    display: "flex",
    flexDirection: "column",
  };

  const menuItemStyle = {
    padding: "15px 20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#cbd5e1",
    textDecoration: "none",
    borderBottom: "1px solid #334155",
    fontWeight: "500",
    fontSize: "15px",
    transition: "background-color 0.2s",
  };

  const subMenuItemStyle = {
    ...menuItemStyle,
    padding: "12px 20px 12px 50px",
    fontSize: "14px",
    backgroundColor: "#0f172a",
    borderBottom: "none",
    color: "#94a3b8",
  };

  return (
    <div style={sidebarStyle}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "30px",
          color: "#38bdf8",
          fontSize: "24px",
        }}
      >
        Autocar BS
      </h2>

      <Link to="/" style={menuItemStyle} onClick={closeSubmenus}>
        <LayoutDashboard size={20} />
        Painel Geral
      </Link>

      <Link to="/novo-lancamento" style={menuItemStyle} onClick={closeSubmenus}>
        <PlusSquare size={20} />
        Novo Lançamento
      </Link>

      <div
        style={{ ...menuItemStyle, justifyContent: "space-between" }}
        onClick={() => setIsFinanceiroOpen(!isFinanceiroOpen)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <DollarSign size={20} />
          Despesas
        </div>
        {isFinanceiroOpen ? (
          <ChevronDown size={18} />
        ) : (
          <ChevronRight size={18} />
        )}
      </div>

      {isFinanceiroOpen && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Novas abas definidas por você */}
          <Link to="/boletos" style={subMenuItemStyle}>
            <Barcode size={18} color="#facc15" />
            Boletos (Fornecedores)
          </Link>
          <Link to="/contas-oficina" style={subMenuItemStyle}>
            <Building size={18} color="#ef4444" />
            Contas da Oficina
          </Link>
        </div>
      )}
    </div>
  );
}
