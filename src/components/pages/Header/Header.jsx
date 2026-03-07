// Header.jsx
import React, { useState } from "react";
import "./Header.css";
import { useTelegram } from "../../../../context/TelegramContext.jsx";
import Lang from "./Lang.jsx";

const Header = ({ isPremium, setIsPremium, onOpenMoney }) => {
  const { apiUser, loading } = useTelegram();
  const balance = loading ? "..." : apiUser?.balance || "0";

  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="top-bar">

          {/* 🌐 LANGUAGE */}
          <div
            className="globe-icon"
            onClick={() => setIsLangOpen(true)}
          >
            🌐
          </div>

          {/* 🔥 TOGGLE */}
          <div className="toggle-switch">
            <div className="switch-track">

              {/* ⭐ STARS */}
              <span
                className={`switch-label ${!isPremium ? "active" : ""}`}
                onClick={() => {
                  if (isPremium) setIsPremium(false);
                }}
              >
                Stars
              </span>

              {/* 💎 PREMIUM */}
              <span
                className={`switch-label ${isPremium ? "active" : ""}`}
                onClick={() => {
                  if (!isPremium) setIsPremium(true);
                }}
              >
                Premium
              </span>

              <div
                className={`switch-thumb ${
                  isPremium ? "right" : "left"
                }`}
              >
                <span className="thumb-text">
                  {isPremium ? "" : " "}
                </span>
              </div>

            </div>
          </div>

          {/* 💰 BALANCE */}
          <div
            className="balance-plus-btn"
            onClick={onOpenMoney}
          >
            <span className="balance-text">{balance}</span>
            <span className="plus-icon">+</span>
          </div>

        </div>
      </header>

      {/* 🌍 LANGUAGE MODAL */}
      {isLangOpen && (
        <Lang onClose={() => setIsLangOpen(false)} />
      )}
    </>
  );
};

export default Header;
