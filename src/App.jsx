import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/pages/Dashboard";
import Off from "./components/pages/Off/Off";
import WelcomeAnimation from "./components/WelcomeAnimation";
import OpenBudgetModal from "./Openbudgetmodal";
import { TelegramProvider } from "../context/TelegramContext";

const ADMIN_IDS = ["7521806735", "6834662342"];

function App() {
  const [botStatus, setBotStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  const [showModal, setShowModal] = useState(false);         // ← yangi

  const tgUserId = String(
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "7521806735"
  );
  const isAdmin = ADMIN_IDS.includes(tgUserId);

  useEffect(() => {
    fetch("https://tezpremium.uz/webapp/settings.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.settings?.bot_status) {
          setBotStatus(data.settings.bot_status);
        } else {
          setBotStatus("on");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Settings yuklashda xato:", err);
        setBotStatus("on");
        setLoading(false);
      });
  }, []);

  // Animatsiya tugagach → modal ochamiz
  const handleAnimationFinish = () => {
    setShowAnimation(false);
    setShowModal(true);   // ← animatsiya tugagach modal
  };

  if (loading) return <div></div>;

  if (showAnimation) {
    return <WelcomeAnimation onFinish={handleAnimationFinish} />;
  }

  const MainComponent = isAdmin || botStatus === "on" ? Dashboard : Off;

  return (
    <TelegramProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<MainComponent />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      {/* Modal — dashboard ustida */}
      <OpenBudgetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </TelegramProvider>
  );
}

export default App;