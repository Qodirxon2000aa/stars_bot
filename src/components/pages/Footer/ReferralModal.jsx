// src/components/ReferralModal.jsx
import React, { useEffect, useState } from "react";
import "./ReferralModal.css";
import Lottie from "lottie-react";
import shareAnimation from "../../../assets/share.json";
import { useTelegram } from "../../../../context/TelegramContext";

const ReferralModal = ({ isOpen, onClose }) => {
  const { apiFetch } = useTelegram(); // ✅ apiFetch ishlatiladi

  const [visible, setVisible] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState(0);
  const [shareLink, setShareLink] = useState("");

  /* =========================
     OPEN / CLOSE ANIMATION
  ========================= */
  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  /* =========================
     📡 FETCH REFERRAL DATA
  ========================= */
  useEffect(() => {
    if (!isOpen) return;

    const fetchReferrals = async () => {
      try {
        // ✅ GET + user_id o'rniga POST + initData
        const data = await apiFetch("referals.php");

        if (data.ok) {
          setInvitedFriends(Number(data.ref_count || 0));
          setShareLink(data.share_link || "");
        }
      } catch (e) {
        console.error("Referral fetch error:", e);
      }
    };

    fetchReferrals();
  }, [isOpen]);

  /* =========================
     🔗 INVITE
  ========================= */
  const handleInvite = () => {
    if (!shareLink) return;
    window.open(shareLink, "_blank");
  };

  /* =========================
     📋 COPY
  ========================= */
  const handleCopy = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
    } catch (e) {
      console.error("Copy error:", e);
    }
  };

  if (!isOpen && !visible) return null;

  return (
    <div className={`referral-overlay ${visible ? "show" : "hide"}`}>
      <div
        className={`referral-fullscreen ${
          visible ? "slide-in" : "slide-out"
        }`}
      >
        {/* ❌ CLOSE */}
        <button className="close-btn" onClick={handleClose}>
          ×
        </button>

        {/* 📦 CONTENT */}
        <div className="referral-content">
          {/* 🎬 LOTTIE */}
          <div className="animation">
            <Lottie animationData={shareAnimation} loop autoplay />
          </div>

          <h2>Referral dasturi</h2>
          <p>
            Do'stlaringizni taklif qiling va ularning xaridlaridan
            <b> Stars</b> ishlang!
          </p>

          {/* 👥 COUNTER */}
          <div className="invited-counter">
            <div className="invited-counter-label">
              Taklif qilgan do'stlaringiz miqdori
            </div>
            <div className="invited-counter-value">
              {invitedFriends} <span className="icon">👥</span>
            </div>
          </div>

          {/* 🔘 BUTTONS */}
          <div className="action-buttons">
            <button className="btn-invite" onClick={handleInvite}>
              Taklif qilish
            </button>

            <button className="btn-copy" onClick={handleCopy}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M8 5H6C4.9 5 4 5.9 4 7V19C4 20.1 4.9 21 6 21H16C17.1 21 18 20.1 18 19V18M8 5C8 6.1 8.9 7 10 7H14C15.1 7 16 6.1 16 5M8 5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5M16 5H18C19.1 5 20 5.9 20 7V9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="worddd">
            <p>
             Sizning havolaningzdan Yangi dostingiz tashrif buyursa
              <b> 100 so'm </b> bonus olasiz va dostlaringizni xar bir hisob toldirishidan <b>2%</b> qismini olasiz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;