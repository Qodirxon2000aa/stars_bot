// src/pages/events/Events.jsx
import React, { useEffect, useState } from "react";
import { useTelegram } from "../../../../context/TelegramContext";
import "./Events.css";

const Events = () => {
  const { user } = useTelegram();

  const [eventData, setEventData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState({
    today: [],
    week: [],
    month: [],
  });

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const loading = loadingEvents || loadingLeaderboard;

  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("today");

  /* ========================= EVENT API ========================= */
  useEffect(() => {
    if (!user?.id) {
      setLoadingEvents(false);
      return;
    }

    const uid = user.isTelegram ? user.id : "7521806735";
    const username = user?.username ? user.username.replace("@", "") : "";

    (async () => {
      try {
        setLoadingEvents(true);
        const res = await fetch(
          `https://tezpremium.uz/webapp/events.php?user_id=${uid}&sent=${username}`
        );
        const data = await res.json();
        if (data.ok && data.data) {
          setEventData(data.data);
        }
      } catch (e) {
        console.error("Events fetch error:", e);
      } finally {
        setLoadingEvents(false);
      }
    })();
  }, [user]);

  /* ========================= LEADERBOARD API ========================= */
  useEffect(() => {
    (async () => {
      try {
        setLoadingLeaderboard(true);
        const res = await fetch("https://tezpremium.uz/webapp/week.php");
        const data = await res.json();

        if (data.ok && data.top10) {
          const formattedData = data.top10.map((item) => ({
            rank: item.rank,
            username: item.name,
            amount: item.summa,
            harid: item.harid,
            trophy:
              item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : null,
          }));

          setLeaderboardData({
            today: formattedData,
            week: formattedData,
            month: formattedData,
          });
        }
      } catch (e) {
        console.error("Leaderboard fetch error:", e);
      } finally {
        setLoadingLeaderboard(false);
      }
    })();
  }, []);

  /* ========================= MODAL ========================= */
  const openModal = () => {
    setShowModal(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setShowModal(false), 250);
  };

  /* ========================= LOADING ========================= */
  if (loading) {
    return (
      <div className="events-page-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  /* ========================= RENDER ========================= */
  const target = eventData ? Number(eventData.event) : 0;
  const paid = eventData ? Number(eventData.payments) : 0;
  const left = eventData ? Number(eventData.left) : 0;
  const percent = target > 0 ? Math.min((paid / target) * 100, 100) : 0;

  return (
    <div className="events-page">

      {/* ================== EVENT CARD ================== */}
      {eventData ? (
        <div className="event-card" onClick={openModal}>
          <div className="event-header">
            <span className="gift-icon">🎁</span>
            <h2 className="event-title">Umumiy savdo maqsadi</h2>
          </div>
          <p className="event-description">
            NFT olish uchun {target.toLocaleString()} so'm
          </p>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <div className="progress-labels">
              <span>{paid.toLocaleString()} so'm</span>
              <span>{target.toLocaleString()} so'm</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="event-card">
          <div className="event-header">
            <span className="gift-icon">🎁</span>
            <h2 className="event-title">Umumiy savdo maqsadi</h2>
          </div>
          <p style={{ opacity: 0.6, textAlign: "center" }}>
            Ma'lumot topilmadi
          </p>
        </div>
      )}

      {/* ================== LEADERBOARD ================== */}
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <span className="stats-icon">📊</span>
          <h2 className="leaderboard-title">Savdo statistikasi</h2>
        </div>
        <p className="leaderboard-subtitle">Kunlik, haftalik va oylik reyting</p>

        <div className="tabs">
          {["today", "week", "month"].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "today" ? "Bugun" : tab === "week" ? "Bu hafta" : "Bu oy"}
            </button>
          ))}
        </div>

        <div className="leaderboard-list">
          {leaderboardData[activeTab].length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.6, padding: "16px" }}>
              Ma'lumot yo'q
            </p>
          ) : (
            leaderboardData[activeTab].map((item) => (
              <div key={item.rank} className="leaderboard-item">
                <div className="rank-section">
                  {item.trophy ? (
                    <span className="trophy">{item.trophy}</span>
                  ) : (
                    <span className="rank-number">{item.rank}.</span>
                  )}
                </div>
                <span className="username">{item.username}</span>
                <span className="amount">{item.amount.toLocaleString()} so'm</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================== MODAL ================== */}
      {eventData && showModal && (
        <div
          className={`event-modal-overlay ${modalVisible ? "show" : ""}`}
          onClick={closeModal}
        >
          <div
            className={`event-modal ${modalVisible ? "open" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="event-close" onClick={closeModal}>✕</button>
            <h2 className="event-modal-title">Savdo maqsadi haqida</h2>
            <div className="event-modal-text">
              <p><b>Maqsad:</b> {target.toLocaleString()} so'm umumiy savdo</p>
              <p><b>Sovg'a:</b> Eksklyuziv NFT (avtomatik yuboriladi)</p>
              <p><b>Hozirgi holat:</b> {paid.toLocaleString()} so'm</p>
              <p><b>Qolgan:</b> {left.toLocaleString()} so'm</p>
            </div>
            <div className="event-gift">🎁</div>
            <button className="event-ok-btn" onClick={closeModal}>Tushundim</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;