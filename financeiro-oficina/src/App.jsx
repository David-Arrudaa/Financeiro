import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard"; // Importando o Dashboard
import TransactionForm from "./components/TransactionForm/TransactionForm";
import TransactionList from "./components/TransactionList/TransactionList";

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: "#f1f5f9",
          color: "#1e293b",
        }}
      >
        <Sidebar />

        <div
          style={{
            marginLeft: "250px",
            padding: "30px",
            flex: 1,
            fontFamily: "sans-serif",
          }}
        >
          <Routes>
            {/* Rota raiz agora carrega o Painel Geral */}
            <Route path="/" element={<Dashboard />} />

            <Route path="/novo-lancamento" element={<TransactionForm />} />

            <Route
              path="/boletos"
              element={
                <TransactionList
                  key="tela-boletos"
                  filterGroup="boleto"
                  title="Boletos (Fornecedores e Peças)"
                />
              }
            />

            <Route
              path="/contas-oficina"
              element={
                <TransactionList
                  key="tela-oficina"
                  filterGroup="oficina"
                  title="Contas da Oficina (Operacional)"
                />
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
