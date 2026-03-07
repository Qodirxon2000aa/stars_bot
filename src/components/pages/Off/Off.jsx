import React, { useEffect, useState } from "react";
import "./off.css";

const Off = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`off-wrapper ${show ? "show" : ""}`}>
      <div className="off-card">
        <h1>🚧 Web App vaqtincha o‘chiq</h1>
        <p>
          Web App hozirda <b>ta’mirlanmoqda</b>.<br />
          Iltimos,bot orqali foydalaning.
        </p>
        <span className="pulse">⏳</span>
      </div>
    </div>
  );
};

export default Off;
