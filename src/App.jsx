import { useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NewLoan from "./pages/NewLoan.jsx";
import History from "./pages/History.jsx";
import ServiceCalls from "./pages/ServiceCalls.jsx";
import Inventory from "./pages/Inventory.jsx";
import Tasks from "./pages/Tasks.jsx";
import { initDatabase } from "./lib/database.js";

const queryClient = new QueryClient();

function App() {
  // Inicializar banco de dados ao carregar a app
  useEffect(() => {
    const setupDB = async () => {
      try {
        await initDatabase();
        console.log("✅ Banco de dados SQLite inicializado!");
      } catch (error) {
        console.error("❌ Erro ao inicializar banco de dados:", error);
      }
    };
    setupDB();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/novo-emprestimo" element={<NewLoan />} />
            <Route path="/historico" element={<History />} />
            <Route path="/chamados" element={<ServiceCalls />} />
            <Route path="/estoque" element={<Inventory />} />
            <Route path="/tarefas" element={<Tasks />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
