import React, { useEffect, useState } from "react";
import "./AnimatedModal.css";

const CONFIG = {
  success: { icon: "✓", label: "Success" },
  error: { icon: "✕", label: "Error" },
  warning: { icon: "!", label: "Warning" },
  info: { icon: "i", label: "Info" },
};

const AnimatedModal = ({
  open,
  type = "info",
  title,
  message,
  onClose,
  small = false,
}) => {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  if (!open && !visible) return null;

  return (
    <div className="am-overlay" onClick={close}>
      <div
        className={`am-modal ${type} ${open ? "am-in" : "am-out"} ${
          small ? "am-toast" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="am-icon">{CONFIG[type].icon}</div>

        {!small && <div className="am-label">{CONFIG[type].label}</div>}

        {title && !small && <h3 className="am-title">{title}</h3>}

        <p className="am-message">{message}</p>

        {!small && (
          <button className="am-btn" onClick={close}>
            Yopish
          </button>
        )}
      </div>
    </div>
  );
};

export default AnimatedModal;
