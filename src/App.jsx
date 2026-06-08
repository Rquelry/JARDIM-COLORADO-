import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import NewLoan from "./pages/NewLoan.jsx";
import History from "./pages/History.jsx";
import ServiceCalls from "./pages/ServiceCalls.jsx";
import Inventory from "./pages/Inventory.jsx";
import Notebooks from "./pages/Notebooks.jsx";
import Tasks from "./pages/Tasks.jsx";
import { isAuthenticated } from "./lib/auth.js";

const queryClient = new QueryClient();

function App() {
  const authenticated = isAuthenticated();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          {authenticated ? (
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/novo-emprestimo" element={<NewLoan />} />
              <Route path="/historico" element={<History />} />
              <Route path="/chamados" element={<ServiceCalls />} />
              <Route path="/estoque" element={<Inventory />} />
              <Route path="/notebooks" element={<Notebooks />} />
              <Route path="/tarefas" element={<Tasks />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>
          ) : (
            <Route path="*" element={<Login />} />
          )}
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
