import { useState } from "react";
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
  const [session, setSession] = useState(null);
  const [page, setPage] = useState("Accueil");

  const handleLogin = (nom, role, id, email, telephone) => {
  setSession({ nom, role, id, email, telephone });
  };

  const handleLogout = () => {
    localStorage.clear();
    setSession(null);
    setPage("Accueil");
  };

  // Pas connecté → Login
  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  // Caissier → interface caissier dédiée
  if (session.role === "caissier") {
    return (
      <CaissierApp
        nom={session.nom}
        userId={session.id}
        onLogout={handleLogout}
      />
    );
  }

  // Admin → interface admin avec sidebar
  const renderPage = () => {
    switch (page) {
      case "Accueil":
        return <Accueil adminName={session.nom} />;
      case "Stock/Produit":
        return <Stock />;
      case "Fournisseur":
        return <Fournisseur />;
      case "Caissier":
        return <GestionCaissier />;
      case "Vente":
        return <Vente />;
      case "Historique":
        return <Historique />;
      case "Paramètre":
        return (
          <Parametres
              adminName={session.nom}
              adminEmail={session.email}
              adminTelephone={session.telephone}
              onLogout={handleLogout}
                  />
        );
      default:
        return <Accueil adminName={session.nom} />;
    }
  };

  return (
    <Layout
      activeNav={page}
      onNav={setPage}
      adminName={session.nom}
      onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}