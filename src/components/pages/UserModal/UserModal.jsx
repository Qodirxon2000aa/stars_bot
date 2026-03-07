import React, { useState, useEffect } from "react";
import "./UserModal.css";
import { useTelegram } from "../../../../context/TelegramContext";

const UserModal = ({ onClose }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeHistory, setActiveHistory] = useState("orders");
  const [timers, setTimers] = useState({});
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  
  // ✅ Context dan orders va payments
  const { 
    user, 
    apiUser, 
    orders, 
    payments,
    loading: telegramLoading, 
    refreshUser 
  } = useTelegram();
  
  const tg = window.Telegram?.WebApp;
  const profilePhotoUrl = user?.photo_url || apiUser?.profile || null;
  const balance = apiUser?.balance || "0";

  // ✅ Taymer hisoblash funksiyasi
  const calculateTimeRemaining = (dateString) => {
    if (!dateString) return null;
    
    try {
      // "📆 04.01.2026 | ⏰ 15:47" formatidan vaqtni ajratib olish
      const timeMatch = dateString.match(/⏰\s*(\d{2}):(\d{2})/);
      const dateMatch = dateString.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      
      if (!timeMatch || !dateMatch) return null;
      
      const [, hours, minutes] = timeMatch;
      const [, day, month, year] = dateMatch;
      
      // To'lov vaqtini yaratish
      const paymentDate = new Date(year, month - 1, day, hours, minutes);
      
      // 10 daqiqa qo'shish
      const expiryDate = new Date(paymentDate.getTime() + 10 * 60 * 1000);
      
      // Hozirgi vaqt
      const now = new Date();
      
      // Qolgan vaqt (millisekundlarda)
      const remaining = expiryDate - now;
      
      if (remaining <= 0) return null;
      
      // Daqiqa va sekundlarga ajratish
      const remainingMinutes = Math.floor(remaining / 60000);
      const remainingSeconds = Math.floor((remaining % 60000) / 1000);
      
      return {
        minutes: remainingMinutes,
        seconds: remainingSeconds,
        total: remaining
      };
    } catch (error) {
      console.error("Taymer hisoblashda xatolik:", error);
      return null;
    }
  };

  // ✅ Orders tarixini formatlash
  const ordersHistory = (orders || []).map((o, index) => ({
    id: `order-${o.order_id || o.id || index}`,
    type: "🛒 Order",
    amount: `${o.amount || 0} ⭐️`,
    summa: `${(o.summa || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} UZS`,
    date: o.date || o.created_at || "Noma'lum",
    status: o.status || "pending",
    sent: o.sent || o.recipient || "N/A",
  }));

  // ✅ Payments tarixini formatlash
  const paymentsHistory = (payments || []).map((p, index) => {
    const timeRemaining = p.status === "pending" ? calculateTimeRemaining(p.date) : null;
    
    return {
      id: `payment-${p.payment_id || p.id || index}`,
      type: "💳 Payment",
      amount: `+${(p.amount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} UZS`,
      date: p.date || p.created_at || "Noma'lum",
      method: p.method || p.payment_method || "Unknown",
      status: p.status || "completed",
      timeRemaining: timeRemaining,
      rawType: p.type || "💳 Karta orqali"
    };
  });

  const historyData = activeHistory === "orders" ? ordersHistory : paymentsHistory;

  console.log("🔍 UserModal - activeHistory:", activeHistory);
  console.log("🔍 UserModal - orders:", orders);
  console.log("🔍 UserModal - payments:", payments);
  console.log("🔍 UserModal - historyData:", historyData);

  // ✅ Taymer yangilanishi
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = {};
        paymentsHistory.forEach(payment => {
          if (payment.status === "pending" && payment.timeRemaining) {
            const remaining = calculateTimeRemaining(payment.date);
            newTimers[payment.id] = remaining;
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [payments]);

  useEffect(() => {
    if (tg?.BackButton?.isSupported !== false) {
      try {
        tg.BackButton.show();
        tg.BackButton.onClick(onClose);
      } catch {}
    }
    refreshUser && refreshUser();
    
    return () => {
      if (tg?.BackButton?.isSupported !== false) {
        try {
          tg.BackButton.hide();
          tg.BackButton.offClick(onClose);
        } catch {}
      }
    };
  }, []);

  const toggleRow = (id) => {
    tg?.HapticFeedback?.impactOccurred?.("light");
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatBalance = (bal) =>
    bal?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || "0";

  const handleClose = () => {
    tg?.HapticFeedback?.impactOccurred?.("medium");
    onClose();
  };

  // ✅ Status rangini aniqlash
  const getStatusColor = (status) => {
    const colors = {
      completed: "#4CAF50",
      pending: "#FF9800",
      cancelled: "#F44336",
      failed: "#F44336",
    };
    return colors[status?.toLowerCase()] || "#999";
  };

  // ✅ Karta raqamini nusxalash funksiyasi
  const copyCardNumber = () => {
    const cardNumber = "9860176618884538";
    
    navigator.clipboard.writeText(cardNumber).then(() => {
      tg?.HapticFeedback?.notificationOccurred?.("success");
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }).catch(() => {
      // Fallback agar clipboard ishlamasa
      const textArea = document.createElement("textarea");
      textArea.value = cardNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      tg?.HapticFeedback?.notificationOccurred?.("success");
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    });
  };

  return (
    <div className="user-modal-overlay" onClick={handleClose}>
      {/* ✅ Copy Alert */}
      {showCopyAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #4CAF50, #2e7d32)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(76, 175, 80, 0.4)',
          zIndex: 10000,
          animation: 'slideDown 0.3s ease',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>✓</span>
          Nusxa olindi!
        </div>
      )}
      
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        {/* ================= HEADER ================= */}
        <div className="user-modal-header">
          <div className="user-modal-profile">
            <div className="user-modal-avatar">
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.first_name?.[0] || "?"}
                </div>
              )}
            </div>
            <div className="user-modal-info">
              <h3>
                {user?.first_name} {user?.last_name}
              </h3>
              <p>{user?.username || "Username yo'q"}</p>
            </div>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="user-modal-body">
          <h2 className="user-modal-title">HISTORY</h2>
          
          {/* FILTER BUTTONS */}
          <div className="history-tabs">
            <button
              className={`history-tab ${
                activeHistory === "orders" ? "active" : ""
              }`}
              onClick={() => {
                setActiveHistory("orders");
                setExpandedRow(null);
              }}
            >
              🛒 Orders ({ordersHistory.length})
            </button>
            <button
              className={`history-tab ${
                activeHistory === "payments" ? "active" : ""
              }`}
              onClick={() => {
                setActiveHistory("payments");
                setExpandedRow(null);
              }}
            >
              💳 Payments ({paymentsHistory.length})
            </button>
          </div>

          {/* ================= TABLE ================= */}
          {telegramLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Yuklanmoqda...</p>
            </div>
          ) : historyData.length === 0 ? (
            <p className="empty-history">
              📭 {activeHistory === "orders" ? "Buyurtmalar" : "To'lovlar"} tarixida ma'lumot yo'q
            </p>
          ) : (

            historyData.map((item) => (
              
              <div key={item.id} className="user-row-wrapper">
                <div
                  className="user-table-row"
                  onClick={() => toggleRow(item.id)}
                >
                  <div className="row-type">{item.type}</div>
                  <div className="row-amount">{item.amount}</div>
                  <div className="row-date">{item.date}</div>
                  <div className="row-toggle">
                    {expandedRow === item.id ? "↑" : "↓"}
                    
                  </div>
                  
                </div>
                <div
                  className={`user-row-details ${
                    expandedRow === item.id ? "expanded" : ""
                  }`}
                >
                  
                  
                  {/* ✅ Orders uchun summa */}
                  {activeHistory === "orders" && item.summa && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                      <strong>💰 To'lov:</strong> {item.summa}
                      <br />
                      <strong>Qabul Qiluvchi:</strong> {item.sent}
                    </div>
                  )}
                   
                  {/* ✅ Payments uchun method */}
                  {activeHistory === "payments" && item.method && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                      <strong>🏦 To'lov usuli:</strong> {item.rawType || item.type}
                      <br />
                      <br />
                      <strong>💰 To'lov:</strong> {item.amount}
                      
                      {/* ✅ Pending holatida karta raqami va taymer */}
                      {item.status === "pending" && (
                        <div style={{ 
                          marginTop: '12px', 
                          padding: '12px', 
                          background: 'rgba(255, 152, 0, 0.1)', 
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 152, 0, 0.3)'
                        }}>
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#FF9800', 
                            fontWeight: 'bold',
                            marginBottom: '8px'
                          }}>
                            💳 Karta raqami:
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '10px'
                          }}>
                            <div style={{ 
                              fontSize: '10px', 
                              fontWeight: 'bold',
                              color: '#fff',
                              letterSpacing: '1px',
                              flex: 1
                            }}>
                              9860 1766 1888 4538
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyCardNumber();
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #4CAF50, #2e7d32)',
                                border: 'none',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                              }}
                            >
                              📋 Copy
                            </button>
                          </div>
                          
                          {(timers[item.id] || item.timeRemaining) && (
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#FF9800',
                              fontWeight: 'bold'
                            }}>
                              ⏱️ Qolgan vaqt: {' '}
                              <span style={{ 
                                fontSize: '18px', 
                                color: '#fff'
                              }}>
                                {String((timers[item.id] || item.timeRemaining).minutes).padStart(2, '0')}:
                                {String((timers[item.id] || item.timeRemaining).seconds).padStart(2, '0')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeHistory === "payments" && item.summa && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                      <strong>💰 To'lov:</strong> {item.summa}
                    </div>
                  )}
                  <br />
                  <div 
                    className="status-badge"
                    style={{ 
                      backgroundColor: getStatusColor(item.status),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'inline-block',
                      marginBottom: '20px'
                    }}
                  >
                    {item.status?.toUpperCase()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="user-modal-close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default UserModal;