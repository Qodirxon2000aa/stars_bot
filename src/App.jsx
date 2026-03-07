import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/pages/Dashboard";
import Off from "./components/pages/Off/Off"; // Yangi Off.jsx komponentini yarating
import { TelegramProvider } from "../context/TelegramContext";

function App() {
  const [botStatus, setBotStatus] = useState(null); // null = yuklanmoqda, "on" yoki "off"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://tezpremium.uz/webapp/settings.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.settings?.bot_status) {
          setBotStatus(data.settings.bot_status);
        } else {
          // Agar xato bo'lsa, default "on" qilib qo'yamiz yoki off
          setBotStatus("on");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Settings yuklashda xato:", err);
        setBotStatus("on"); // Internet yo'q bo'lsa ham ishlasin
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div></div>; // Yoki chiroyli loader qo'ying
  }

  const MainComponent = botStatus === "on" ? Dashboard : Off;

  return (
    <TelegramProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<MainComponent />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </TelegramProvider>
  );
}

export default App;