// pages/Money.jsx - FINAL VERSIYA (Karta raqami dinamik olinadi)
import React, { useState, useEffect } from "react";
import "./Money.css";
import { useTelegram } from "../../../../context/TelegramContext";
import MoneyImage from "../../../assets/money.json"; // Lottie JSON fayl
import Lottie from "lottie-react";

const Money = ({ onClose }) => {
  const { refreshUser, apiFetch } = useTelegram(); // ✅ apiFetch qo'shildi
  const [amount, setAmount] = useState(""); // formatlangan ko'rinish
  const [rawAmount, setRawAmount] = useState(""); // faqat raqamlar
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [cardInfo, setCardInfo] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [resultType, setResultType] = useState("");
  const [payStatus, setPayStatus] = useState("off");
  const [showPaymentDisabled, setShowPaymentDisabled] = useState(false);

  // Global karta raqami (settings.php dan olinadi)
  const [globalCardNumber, setGlobalCardNumber] = useState("9860 1766 1888 4538"); // default fallback

  // Settings va pay_status ni har 5 sekundda tekshirish + karta raqamini yangilash
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("https://tezpremium.uz/uzbstar/settings.php");
        const data = await res.json();

        if (data.ok && data.settings) {
          setPayStatus(data.settings.pay_status || "off");

          // Karta raqamini olamiz va formatlaymiz
          if (data.settings.card) {
            const rawCard = data.settings.card.replace(/\s/g, ""); // bo'shliqlarni tozalaymiz
            if (rawCard.length === 16) {
              const formatted = rawCard.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");
              setGlobalCardNumber(formatted);
            }
          }
        } else {
          setPayStatus("off");
        }
      } catch (err) {
        console.error("Settings yuklashda xatolik:", err);
        setPayStatus("off");
      }
    };

    fetchSettings();
    const interval = setInterval(fetchSettings, 5000); // har 5 sekundda yangilanadi
    return () => clearInterval(interval);
  }, []);

  // Taymer
  useEffect(() => {
    if (waiting && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && waiting) {
      handlePaymentError("Vaqt tugadi ⏰");
    }
  }, [waiting, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 350);
  };

  const handlePaymentSuccess = async () => {
    setResultType("success");
    setShowResult(true);
    await refreshUser();

    setTimeout(() => {
      setShowResult(false);
      setWaiting(false);
      setPaymentId(null);
      setCardInfo(null);
      handleClose();
    }, 2500);
  };

  const handlePaymentError = (msg = "To'lov bekor qilindi yoki muvaffaqiyatsiz") => {
    setResultType("error");
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      setWaiting(false);
      setPaymentId(null);
      setCardInfo(null);
      alert(msg + " ❌");
    }, 2500);
  };

  const handleSubmit = async () => {
    setErrorMsg("");

    if (payStatus === "off") {
      setShowPaymentDisabled(true);
      setTimeout(() => setShowPaymentDisabled(false), 3000);
      return;
    }

    const numAmount = parseInt(rawAmount, 10);
    if (!numAmount || numAmount < 1000 || numAmount > 10000000) {
      setErrorMsg("Summa 1 000 — 10 000 000 UZS oralig'ida bo'lishi kerak");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ GET + user_id o'rniga apiFetch bilan POST + initData
      const data = await apiFetch("payments/review.php", { amount: numAmount });

      if (data.ok && data.payment_id) {
        setPaymentId(data.payment_id);
        setWaiting(true);
        setTimeLeft(600);

        // Agar review.php javobida card bo'lsa — undan, aks holda global settingsdan
        const cardNumber = data.card ? data.card : globalCardNumber;

        setCardInfo({
          number: cardNumber,
          owner: "M/U",
        });

        checkPaymentStatus(data.payment_id);
      } else {
        setErrorMsg(data.message || "To'lov yaratishda xatolik");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "So'rovda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkPaymentStatus = (pid) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://tezpremium.uz/uzbstar/payments/status.php?payment_id=${pid}`
        );
        if (!res.ok) return;
        const data = await res.json();

        if (data.ok && data.status === "paid") {
          clearInterval(interval);
          handlePaymentSuccess();
        } else if (["failed", "canceled", "expired"].includes(data.status)) {
          clearInterval(interval);
          handlePaymentError("To'lov bekor qilindi yoki muvaffaqiyatsiz");
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    }, 5000);

    // 10 daqiqadan keyin to'xtatish
    setTimeout(() => clearInterval(interval), 600000);
  };

  const copyToClipboard = (text, label = "Ma'lumot") => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setToast(`${label} nusxalandi ✓`);
        setTimeout(() => setToast(""), 2500);
      })
      .catch(() => {
        setToast("Nusxalashda xatolik");
        setTimeout(() => setToast(""), 2500);
      });
  };

  return (
    <div
      className={`money-modal-overlay ${isClosing ? "fade-out" : ""}`}
      onClick={handleClose}
    >
      <div className="money-modal" onClick={(e) => e.stopPropagation()}>
        <button className="money-close-btn" onClick={handleClose}>
          ×
        </button>

        <div className="animation">
          <Lottie
            animationData={MoneyImage}
            loop={true}
            autoplay={true}
            style={{ width: 200, height: 200 }}
          />
        </div>

        <h2 className="money-title">Hisobni to'ldirish</h2>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        {!waiting ? (
          <>
            <div className="money-method">
              <label>To'lov turi</label>
              <br />
              <br />
              <div className="method-selected">Karta orqali</div>
            </div>

            <div className="money-amount">
              <label>To'lov summasi (UZS)</label>
              <input
                type="text"
                placeholder="misol: 50 000"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setRawAmount(val);
                  setAmount(val ? parseInt(val, 10).toLocaleString("ru-RU") : "");
                }}
              />
              <br />
              <br />
              <div className="money-limits">
                Min: 1 000 UZS • Max: 10 000 000 UZS
              </div>
            </div>

            <button
              className="money-submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Yuborilmoqda..." : "To'lovga o'tish"}
            </button>
          </>
        ) : (
          <div className="money-waiting">
            <div className="waiting-spinner"></div>
            <h3>To'lovni yakunlang</h3>
            <p>Kartangizdan to'lovni amalga oshiring</p>
            <p>Belgilangan tolovdan 1 so'm ko'p ham kam ham tashlamang!</p>
            <br />

            <div className="payment-amount-display">
              <div className="amount-info">
                <div className="amount-label">To'lov summasi</div>
                <div className="amount-value">{amount} UZS</div>
              </div>
              <button
                className="copy-amount-btn"
                onClick={() => copyToClipboard(rawAmount, "To'lov summasi")}
              >
                Nusxa olish
              </button>
            </div>
            <br />

            {cardInfo && (
              <div className="card-details">
                <div className="card-info">
                  <div>
                    <div className="card-label">Karta raqami</div>
                    <div className="card-number">{cardInfo.number}</div>
                  </div>
                  <button
                    className="copy-card-btn"
                    onClick={() => copyToClipboard(cardInfo.number, "Karta raqami")}
                  >
                    Nusxa olish
                  </button>
                </div>

                <div className="card-owner">
                  <span>Karta egasi</span>
                  <span>{cardInfo.owner}</span>
                </div>
              </div>
            )}

            <div className="deadline timer-active">
              <span className="clock-icon">⏰</span>
              <span>
                Qolgan vaqt: <strong className="timer-countdown">{formatTime(timeLeft)}</strong>
              </span>
            </div>

            <p className="waiting-note">
              To'lov holatini avtomatik tekshirib turibmiz...<br />
              (Har 5 sekundda)
            </p>
          </div>
        )}

        {/* Natija animatsiyasi */}
        {showResult && (
          <div className={`payment-result-overlay ${resultType}`}>
            <div className="result-icon">
              {resultType === "success" ? "✓" : "✖"}
            </div>
            <div className="result-text">
              {resultType === "success" ? "To'lov muvaffaqiyatli!" : "To'lov bekor qilindi"}
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && <div className="toast-notification">{toast}</div>}

        {/* To'lov o'chirilgan holat */}
        {showPaymentDisabled && (
          <div className="payment-disabled-overlay">
            <div className="payment-disabled-modal">
              <div className="disabled-icon">🚫</div>
              <h3>To'lov vaqtincha o'chirilgan</h3>
              <p>Hozirda web appdan to'lov qilish imkoni yo'q.</p>
              <p className="bot-text">📱 Bot orqali to'lov amalga oshiring</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Money;