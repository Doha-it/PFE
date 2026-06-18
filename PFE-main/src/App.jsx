import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./Login";
import Layout from "./components/Layout";
import Accueil from "./pages/Accueil";
import Stock from "./pages/Stock";
import Fournisseur from "./pages/Fournisseur";
import GestionCaissier from "./pages/GestionCaissier";
import Vente from "./pages/Vente";
import Historique from "./pages/Historique";
import Parametres from "./pages/Parametres";
import CaissierApp from "./Caissier";

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (nom, role, id, email, telephone) => {
    setSession({ nom, role, id, email, telephone });
    if (role === "admin") {
      navigate("/admin/accueil");
    } else {
      navigate("/caissier");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setSession(null);
    navigate("/login");
  };

  // ❌ Pas connecté → Login
  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  // ✅ Caissier → interface caissier
  if (session.role === "caissier") {
    return (
      <CaissierApp
        nom={session.nom}
        userId={session.id}
        onLogout={handleLogout}
      />
    );
  }

  // ✅ Admin → interface admin avec router
  return (
    <Layout
      adminName={session.nom}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/admin/accueil" element={<Accueil adminName={session.nom} />} />
        <Route path="/admin/stock" element={<Stock />} />
        <Route path="/admin/fournisseurs" element={<Fournisseur />} />
        <Route path="/admin/caissiers" element={<GestionCaissier />} />
        <Route path="/admin/ventes" element={<Vente />} />
        <Route path="/admin/historique" element={<Historique />} />
        <Route path="/admin/parametres" element={
          <Parametres
            adminName={session.nom}
            adminEmail={session.email}
            adminTelephone={session.telephone}
            onLogout={handleLogout}
          />
        } />
        <Route path="/admin/*" element={<Navigate to="/admin/accueil" />} />
        <Route path="/" element={<Navigate to="/admin/accueil" />} />
        <Route path="/login" element={<Navigate to="/admin/accueil" />} />
      </Routes>
    </Layout>
  );
}