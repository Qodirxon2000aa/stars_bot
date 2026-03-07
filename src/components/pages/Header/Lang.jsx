// Lang.jsx
import React, { useState } from "react";
import "./Lang.css";

const Lang = ({ onClose }) => {
  const [selected, setSelected] = useState("uz"); // faqat uzbek

  const handleConfirm = () => {
    // hozircha faqat yopiladi
    onClose();
  };

  return (
    <div className="lang-overlay" onClick={onClose}>
      <div className="lang-modal" onClick={(e) => e.stopPropagation()}>
        
        <button className="lang-close" onClick={onClose}>✕</button>

        <div className="lang-header">
          <h2>Tilni tanlang</h2>
          <p>Ilovada foydalaniladigan tilni tanlang</p>
        </div>

        <div className="lang-list">
          {/* UZBEK */}
          <div
            className={`lang-item ${selected === "uz" ? "active" : ""}`}
            onClick={() => setSelected("uz")}
          >
            <div>
              <strong>Uzbek</strong>
              <span>O‘zbek</span>
            </div>
            <div className="radio active" />
          </div>

          {/* ENGLISH */}
         

          {/* RUSSIAN */}
         
        </div>

        <button className="lang-confirm" onClick={handleConfirm}>
          Tasdiqlash
        </button>
      </div>
    </div>
  );
};

export default Lang;
