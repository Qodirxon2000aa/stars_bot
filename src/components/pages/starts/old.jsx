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

  const [userNotFoundToast, setUserNotFoundToast] = useState(false);
  const [username, setUsername] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [checking, setChecking] = useState(false);
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

  /* 👤 USERNAME CHECK */
  useEffect(() => {
    if (!username || username.trim().length < 4) {
      setUserInfo(null);
      setUserNotFoundToast(false);
      return;
    }

    const clean = username.trim().replace("@", "");
    setChecking(true);

    fetch(`https://tezpremium.uz/starsapi/user.php?username=@${clean}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.username) {
          setUserInfo(d);
          setUserNotFoundToast(false);
        } else {
          setUserInfo(null);
          setUserNotFoundToast(true);
          setTimeout(() => setUserNotFoundToast(false), 3000);
        }
      })
      .catch(() => {
        setUserInfo(null);
        setUserNotFoundToast(true);
        setTimeout(() => setUserNotFoundToast(false), 3000);
      })
      .finally(() => setChecking(false));
  }, [username]);

  const balance = apiUser?.balance || 0;
  const totalPrice = amount && pricePerStar ? Number(amount) * pricePerStar : 0;

  const handleSelf = () => {
    if (user?.username) {
      setUsername("@" + user.username.replace("@", ""));
    }
  };

  const handleSubmit = async () => {
    if (!userInfo)
      return openModal("error", "Xatolik", "Foydalanuvchi topilmadi");

    if (Number(amount) < 50 || Number(amount) > 10000)
      return openModal(
        "warning",
        "Noto‘g‘ri miqdor",
        "50 – 10 000 oralig‘ida bo‘lishi kerak"
      );

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
        sent: username,
        type: "Stars",
        overall: totalPrice,
      });

      if (res.ok) {
        openModal("success", "Muvaffaqiyatli", "Telegram Stars yuborildi");
        setAmount("");
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
              O‘zimga
            </button>
          </div>

          {!userInfo ? (
            <input
              className="tg-user-input"
              placeholder="Telegram @username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          ) : (
            <div className="tg-user-chip">
              <img src={userInfo.photo} alt="avatar" />
              <div className="tg-user-info">
                <div className="tg-user-name">{userInfo.name}</div>
                <div className="tg-user-username">@{userInfo.username}</div>
              </div>
              <button
                className="tg-user-clear"
                onClick={() => {
                  setUsername("");
                  setUserInfo(null);
                }}
              >
                ×
              </button>
            </div>
          )}
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

        {/* KO‘PROQ PRESETLAR */}
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
          {showMore ? "Yopish ▲" : "Ko‘proq ko‘rsat ▼"}
        </button>

        <div className="total">
          Jami: <strong>{totalPrice.toLocaleString()} UZS</strong>
        </div>

        <button
          className="buy-btn1"
          disabled={sending || !userInfo || !amount || loading}
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

      <AnimatedModal
        open={userNotFoundToast}
        type="info"
        message="Foydalanuvchi topilmadi. @username tekshiring."
        onClose={() => setUserNotFoundToast(false)}
        small
      />
    </div>
  );
};

export default Stars;