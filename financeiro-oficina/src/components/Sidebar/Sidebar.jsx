import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusSquare,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Barcode,
  Building,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  const [isFinanceiroOpen, setIsFinanceiroOpen] = useState(false);
  const navigate = useNavigate();

  const closeSubmenus = () => {
    setIsFinanceiroOpen(false);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Deseja realmente sair do sistema?");
    if (confirmLogout) {
      // Se houver lógica de autenticação no Supabase, você pode chamar supabase.auth.signOut() aqui
      alert("Sessão encerrada com sucesso!");
      navigate("/"); // Ou redirecionar para a tela de login se houver
    }
  };

  return (
    <div className="sidebar-container">
      <div>
        {/* Logotipo */}
        <div className="sidebar-logo-container">
          <h2 className="logo-text">
            AUTOCAR<span className="logo-highlight">BS</span>
          </h2>
        </div>

        <Link to="/" className="menu-item" onClick={closeSubmenus}>
          <LayoutDashboard size={18} />
          Painel Geral
        </Link>

        <Link
          to="/novo-lancamento"
          className="menu-item"
          onClick={closeSubmenus}
        >
          <PlusSquare size={18} />
          Novo Lançamento
        </Link>

        <div
          className="menu-item menu-item-accordion"
          onClick={() => setIsFinanceiroOpen(!isFinanceiroOpen)}
        >
          <div className="accordion-title">
            <DollarSign size={18} />
            Despesas
          </div>
          {isFinanceiroOpen ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </div>

        {isFinanceiroOpen && (
          <div className="submenu-container">
            <Link
              to="/boletos"
              className="menu-item submenu-item"
              onClick={(e) => e.stopPropagation()}
            >
              <Barcode size={16} color="#d97706" />
              Boletos
            </Link>
            <Link
              to="/contas-oficina"
              className="menu-item submenu-item"
              onClick={(e) => e.stopPropagation()}
            >
              <Building size={16} color="#dc2626" />
              Contas da Oficina
            </Link>
          </div>
        )}
      </div>

      {/* Botão Sair fixado na base do menu lateral */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="menu-item logout-btn">
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
}
