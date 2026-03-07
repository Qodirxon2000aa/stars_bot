// Footer.jsx
import React from "react";
import "./Footer.css";

import { MdStorefront } from "react-icons/md";
import { FiHome, FiUser, FiUserPlus, FiCalendar } from "react-icons/fi"; // FiCalendar qo'shildi

const Footer = ({
  activeSection,
  onHomeClick,
  onMarketClick,
  onEventsClick,     // YANGI prop
  onInviteClick,
  onProfileClick,
}) => {
  return (
    <div className="footer">
      <div className="footer-content">
        {/* Taklif */}
        <button
          className={`footer-item ${activeSection === "invite" ? "active" : ""}`}
          onClick={onInviteClick}
        >
          <FiUserPlus className="footer-icon" />
          <span>Taklif</span>
        </button>

        {/* YANGI: Events */}
        <button
          className={`footer-item ${activeSection === "events" ? "active" : ""}`}
          onClick={onEventsClick}
        >
          <FiCalendar className="footer-icon" />
          <span>Events</span>
        </button>

        {/* Asosiy */}
        <button
          className={`footer-item ${activeSection === "home" ? "active" : ""}`}
          onClick={onHomeClick}
        >
          <FiHome className="footer-icon" />
          <span>Asosiy</span>
        </button>

        {/* Market */}
        <button
          className={`footer-item ${activeSection === "market" ? "active" : ""}`}
          onClick={onMarketClick}
        >
          <MdStorefront className="footer-icon" />
          <span>Market</span>
        </button>

        {/* Profil */}
        <button
          className={`footer-item ${activeSection === "profile" ? "active" : ""}`}
          onClick={onProfileClick}
        >
          <FiUser className="footer-icon" />
          <span>Profil</span>
        </button>
      </div>
    </div>
  );
};

export default Footer;