import React, { useEffect, useState } from "react";
import { useTelegram } from "../../../../context/TelegramContext";
import "./Stars.css";
import AnimatedModal from "../../ui/AnimatedModal";
import Lottie from "lottie-react";
import starsVideo from "../../../assets/stars.json";

// Faqat stars miqdorlarini saqlaymiz
const STAR_AMOUNTS = [50, 100, 250, 500];
const STAR_AMOUNTS_MORE = [1000, 5000, 10000];

const Stars = () => {
  const { createOrder, apiUser, user } = useTelegram();

  const [modal, setModal] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
  });

  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [pricePerStar, setPricePerStar] = useState(0); // 1 Star narxi (UZS)
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const openModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  /* ⭐ PRICE - API dan olish */
  useEffect(() => {
    fetch("https://tezpremium.uz/webapp/settings.php")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.settings?.price) {
          setPricePerStar(Number(d.settings.price)); // masalan: 220
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const balance = apiUser?.balance || 0;
  const totalPrice = amount && pricePerStar ? Number(amount) * pricePerStar : 0;

  const handleSelf = () => {
    if (user?.username) {
      setUsername("@" + user.username.replace("@", ""));
    }
  };

  const handleSubmit = async () => {
    // Username tekshirish
    if (!username || username.trim().length < 4) {
      return openModal("error", "Xatolik", "Username kiriting");
    }

    // Amount tekshirish
    if (Number(amount) < 50 || Number(amount) > 10000) {
      return openModal(
        "warning",
        "Noto'g'ri miqdor",
        "50 – 10 000 oralig'ida bo'lishi kerak"
      );
    }

    // Balans tekshirish
    if (balance < totalPrice) {
      const diff = totalPrice - balance;
      return openModal(
        "warning",
        "Balans yetarli emas",
        `Yana ${diff.toLocaleString()} UZS yetishmayapti`
      );
    }

    setSending(true);
    try {
      const res = await createOrder({
        amount: Number(amount),
        sent: username.trim(),
        type: "Stars",
        overall: totalPrice,
      });

      if (res.ok) {
        openModal("success", "Muvaffaqiyatli", "Telegram Stars yuborildi");
        setAmount("");
        setUsername("");
      } else {
        openModal("error", "Xatolik", "Buyurtma bajarilmadi");
      }
    } catch {
      openModal("error", "Server xatosi", "API muammo");
    } finally {
      setSending(false);
    }
  };

  // Dinamik preset narxini hisoblash
  const formatPrice = (stars) => {
    const price = stars * pricePerStar;
    return price.toLocaleString();
  };

  return (
    <div className="stars-wrapper">
      <div className="stars-card">
        <div className="stars-video">
          <Lottie animationData={starsVideo} loop autoplay />
        </div>

        <h2 className="stars-title">Telegram Stars</h2>

        {/* USER SECTION */}
        <div className="tg-user-section">
          <div className="tg-user-header">
            <div className="tg-user-title">Kimga yuboramiz?</div>
            <button className="tg-self-btn" onClick={handleSelf}>
              O'zimga
            </button>
          </div>

          <input
            className="tg-user-input"
            placeholder="Telegram @username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* AMOUNT INPUT */}
        <input
          type="number"
          placeholder="50 dan 10 000 gacha"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="inputs"
        />

        {/* ASOSIY PRESETLAR */}
        <div className="preset-list">
          {STAR_AMOUNTS.map((stars) => (
            <div
              key={stars}
              className={`preset ${Number(amount) === stars ? "active" : ""}`}
              onClick={() => setAmount(stars)}
            >
              {stars} Stars
              <span>{formatPrice(stars)} UZS</span>
            </div>
          ))}
        </div>

        {/* KO'PROQ PRESETLAR */}
        <div
          className={`preset-list more ${
            showMore ? "fade-in" : "fade-out"
          }`}
        >
          {STAR_AMOUNTS_MORE.map((stars) => (
            <div
              key={stars}
              className={`preset ${Number(amount) === stars ? "active" : ""}`}
              onClick={() => setAmount(stars)}
            >
              {stars} Stars
              <span>{formatPrice(stars)} UZS</span>
            </div>
          ))}
        </div>

        <button
          className="show-more-btn"
          onClick={() => setShowMore((v) => !v)}
        >
          {showMore ? "Yopish ▲" : "Ko'proq ko'rsat ▼"}
        </button>

        <div className="total">
          Jami: <strong>{totalPrice.toLocaleString()} UZS</strong>
        </div>

        <button
          className="buy-btn1"
          disabled={sending || !username || !amount || loading}
          onClick={handleSubmit}
        >
          {sending ? "Yuborilmoqda..." : "Sotib olish"}
        </button>
      </div>

      <AnimatedModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />
    </div>
  );
};

export default Stars;