// src/pages/market/Market.jsx
import React, { useEffect, useState, useRef } from "react";
import { useTelegram } from "../../../../context/TelegramContext";
import "./Market.css";

const Market = ({ onClose }) => {
  const [selectedGift, setSelectedGift] = useState(null);
  const [type, setType] = useState("all");
  const [giftsData, setGiftsData] = useState([]);
  
  // Yangi: Faqat initial loading — API tugamaguncha spinner
  const [loading, setLoading] = useState(true);

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [checking, setChecking] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [balanceAlert, setBalanceAlert] = useState(false);

  const { apiUser, createGiftOrder, refreshUser, user } = useTelegram();
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  /* ================= GIFTLARNI YUKLASH ================= */
  const fetchGifts = async () => {
    const url =
      type === "all"
        ? "https://tezpremium.uz/webapp/giftlar.php"
        : `https://tezpremium.uz/webapp/giftlar.php?type=${type}`;

    try {
      const r = await fetch(url);
      const d = await r.json();

      if (d.ok && Array.isArray(d.gifts)) {
        setGiftsData((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(d.gifts)) {
            return prev;
          }
          return d.gifts;
        });
      } else {
        setGiftsData([]);
      }
    } catch (err) {
      console.warn("Giftlar yuklashda xato:", err);
      setGiftsData([]);
    } finally {
      setLoading(false); // Har doim loadingni o'chiramiz
    }
  };

  /* ================= HAR 5 SEKUNDDA JIM YANGILANISH ================= */
  useEffect(() => {
    setLoading(true); // Yangi type tanlansa — qayta loading
    fetchGifts();

    intervalRef.current = setInterval(() => {
      fetchGifts(); // Jim yangilanish (loading o'zgarmaydi)
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [type]);

  /* ================= USERNAME TEKSHIRISH (DEBOUNCE) ================= */
  useEffect(() => {
    if (!recipient.trim()) {
      setUserInfo(null);
      setChecking(false);
      setPurchaseError("");
      return;
    }

    if (userInfo) setUserInfo(null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const clean = recipient.trim().replace("@", "");
      if (clean.length < 3) {
        setUserInfo(null);
        setChecking(false);
        return;
      }

      setChecking(true);
      setPurchaseError("");

      fetch(`https://tezpremium.uz/starsapi/user.php?username=@${clean}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.username) {
            setUserInfo(d);
          } else {
            setUserInfo(null);
          }
        })
        .catch(() => setUserInfo(null))
        .finally(() => setChecking(false));
    }, 800);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [recipient]);

  const canAfford = (price) => Number(apiUser?.balance || 0) >= Number(price);

  const handleBuyClick = (gift, e) => {
    e.stopPropagation();
    if (!canAfford(gift.price)) {
      setBalanceAlert(true);
      return;
    }
    setSelectedGift(gift);
    setShowPurchaseModal(true);
    setRecipient("");
    setUserInfo(null);
    setPurchaseError("");
  };

  const handleSelf = () => {
    if (user?.username) {
      const username = "@" + user.username.replace("@", "");
      setRecipient(username);
      setUserInfo({
        username: user.username.replace("@", ""),
        name: user.first_name || user.username,
        photo: user.photo_url || null,
      });
    }
  };

  const clearRecipient = () => {
    setRecipient("");
    setUserInfo(null);
    setPurchaseError("");
  };

  const handleConfirmClick = () => {
    if (!recipient.trim()) {
      setPurchaseError("Iltimos, qabul qiluvchi username kiriting");
      return;
    }
    if (!userInfo) {
      setPurchaseError("Foydalanuvchi topilmadi. To‘g‘ri username kiriting");
      return;
    }
    setPurchaseError("");
    setShowPurchaseModal(false);
    setShowConfirmModal(true);
  };

  const confirmAndPurchase = async () => {
    setShowConfirmModal(false);
    setPurchasing(true);
    setPurchaseError("");

    try {
      const res = await createGiftOrder({
        giftId: selectedGift.id,
        sent: recipient.trim(),
        price: Number(selectedGift.price),
      });

      if (res.ok) {
        await refreshUser();
        fetchGifts(); // Yangilash

        setShowPurchaseModal(false);
        setShowSuccessModal(true);

        setTimeout(() => {
          setShowSuccessModal(false);
          setSelectedGift(null);
          setRecipient("");
          setUserInfo(null);
        }, 3000);
      } else {
        setPurchaseError(res.message || "Xatolik yuz berdi");
        setShowPurchaseModal(true);
      }
    } catch (err) {
      setPurchaseError("Tarmoq xatosi");
      setShowPurchaseModal(true);
    } finally {
      setPurchasing(false);
    }
  };

  /* ================= LOADING SPINNER ================= */
  if (loading) {
    return (
      <div className="market-loading-full">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="market-overlay" onClick={onClose}>
      <div className="market-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="market-header">
          <select className="filter-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Barchasi</option>
            <option value="old">Eski giftlar</option>
            <option value="new">Yangi giftlar</option>
            <option value="cheap">Arzon giftlar</option>
            <option value="expensive">Qimmat giftlar</option>
          </select>
          <div className="user-balance creative-balance">
            <span className="balance-icon">💰</span>
            <div className="balance-info">
              <div className="balance-label">Balans</div>
              <div className="balance-amount">
                {Number(apiUser?.balance || 0).toLocaleString()} so'm
              </div>
            </div>
          </div>
        </div>

        {/* GIFTS GRID */}
        <div className="gifts-grid">
          {giftsData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">❌</div>
              <h3>Giftlar topilmadi</h3>
              <p>Boshqa kategoriya tanlab ko‘ring</p>
            </div>
          ) : (
            giftsData.map((gift) => (
              <div key={gift.id} className="gift-card" onClick={() => setSelectedGift(gift)}>
                <div className="gift-image">
                  <img src={gift.photo} alt={gift.nft_id} />
                </div>
                <div className="gift-info">
                  <div className="column">
                    <p className="gift-name">{gift.nft_id}</p>
                    <p className="gift-price">{Number(gift.price).toLocaleString()} so'm</p>
                    <button className="buuy" onClick={(e) => handleBuyClick(gift, e)}>
                      Sotib olish
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedGift &&
        !showPurchaseModal &&
        !showConfirmModal &&
        !purchasing &&
        !showSuccessModal && (
          <div className="detail-overlay" onClick={() => setSelectedGift(null)}>
            <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
              <button className="detail-close-btn" onClick={() => setSelectedGift(null)}>×</button>
              <div className="detail-top">
                <div className="gift-image-large">
                  <img src={selectedGift.photo} alt={selectedGift.nft_id} />
                </div>
                <div className="detail-right">
                  <h3 className="detail-name"><span>{selectedGift.nft_id}</span></h3>
                  <div className="detail-info">
                    <p><b>Model:</b> {selectedGift.model}</p>
                    <p><b>Symbol:</b> {selectedGift.symbol}</p>
                    <p><b>Backdrop:</b> {selectedGift.backdrop}</p>
                    <p><b>Sana:</b> {selectedGift.created_at}</p>
                    <p><b>Narx:</b> {Number(selectedGift.price).toLocaleString()} so'm</p>
                  </div>
                </div>
              </div>
              <div className="detail-bottom">
                <button className="balance-btn" onClick={(e) => handleBuyClick(selectedGift, e)}>
                  Sotib olish
                </button>
                <div className="detail-actions">
                  <a href={selectedGift.link} target="_blank" rel="noreferrer" className="action-btn">
                    👀
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* PURCHASE MODAL */}
      {showPurchaseModal && selectedGift && (
        <div className="detail-overlay" onClick={() => !purchasing && setShowPurchaseModal(false)}>
          <div className="detail-modal purchase-modal" onClick={(e) => e.stopPropagation()}>
            <button className="detail-close-btn" onClick={() => !purchasing && setShowPurchaseModal(false)}>
              ×
            </button>
            <h2 className="purchase-title">🎁 Gift sotib olish</h2>
            <div className="purchase-content">
              <div className="gift-preview">
                <img src={selectedGift.photo} alt={selectedGift.nft_id} />
                <p className="gift-name">{selectedGift.nft_id}</p>
              </div>
              <div className="purchase-details">
                <p>Narx: <strong>{Number(selectedGift.price).toLocaleString()} so'm</strong></p>
                <p>Balansingiz: <strong>{Number(apiUser?.balance || 0).toLocaleString()} so'm</strong></p>
              </div>
              <div className="tg-user-section">
                <div className="tg-user-header">
                  <div className="tg-user-title">Kimga yuboramiz?</div>
                  <button className="tg-self-btn" onClick={handleSelf} disabled={purchasing}>
                    O‘zimga
                  </button>
                </div>
                {checking || !recipient.trim() || !userInfo ? (
                  <input
                    className="tg-user-input"
                    placeholder="Telegram @username..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={purchasing}
                    autoFocus
                  />
                ) : (
                  <div className="tg-user-chip">
                    {userInfo.photo && <img src={userInfo.photo} alt="avatar" className="chip-avatar" />}
                    <div className="tg-user-info">
                      <div className="tg-user-name">{userInfo.name || userInfo.username}</div>
                      <div className="tg-user-username">@{userInfo.username}</div>
                    </div>
                    <button className="tg-user-clear" onClick={clearRecipient} disabled={purchasing}>
                      ×
                    </button>
                  </div>
                )}
              </div>
              {purchaseError && <div className="error-message">❌ {purchaseError}</div>}
              <button
                className="confirm-purchase-btn"
                onClick={handleConfirmClick}
                disabled={purchasing || !recipient.trim() || !userInfo}
              >
                {purchasing ? "Kutilmoqda..." : "Tasdiqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {showConfirmModal && selectedGift && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">🎁</div>
            <h3>Rostdan ham sotib olmoqchimisiz?</h3>
            <p>
              <strong>{selectedGift.nft_id}</strong><br />
              Narxi: {Number(selectedGift.price).toLocaleString()} so'm<br />
              Qabul qiluvchi: @{userInfo?.username || recipient.replace("@", "")}
            </p>
            <div className="confirm-buttons">
              <button className="confirm-no" onClick={() => setShowConfirmModal(false)} disabled={purchasing}>
                Yo‘q
              </button>
              <button className="confirm-yes" onClick={confirmAndPurchase} disabled={purchasing}>
                Ha, sotib olaman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-animation">✅</div>
            <h3>Muvaffaqiyatli sotib olindi!</h3>
            <p>Gift muvaffaqiyatli yuborildi 🎉</p>
          </div>
        </div>
      )}

      {/* BALANCE ALERT */}
      {balanceAlert && (
        <div className="balance-alert-overlay">
          <div className="balance-alert-modal">
            <div className="balance-alert-icon">💸</div>
            <h3>Balans yetarli emas</h3>
            <p>Ushbu giftni sotib olish uchun hisobingizda mablag‘ yetarli emas.</p>
            <button className="balance-alert-btn" onClick={() => setBalanceAlert(false)}>
              Tushundim
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;