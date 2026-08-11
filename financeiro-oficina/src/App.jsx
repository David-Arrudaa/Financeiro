import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import TransactionForm from "./components/TransactionForm/TransactionForm";
import TransactionList from "./components/TransactionList/TransactionList";

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "#fff",
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
            <Route
              path="/"
              element={
                <h2 style={{ color: "#38bdf8" }}>
                  Bem-vindo ao Sistema Autocar BS.
                </h2>
              }
            />

            {/* O formulário agora é renderizado puro, sem receber props */}
            <Route path="/novo-lancamento" element={<TransactionForm />} />

            <Route
              path="/boletos"
              element={
                <TransactionList
                  filterGroup="boleto"
                  title="Boletos (Fornecedores e Peças)"
                />
              }
            />

            <Route
              path="/contas-oficina"
              element={
                <TransactionList
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
