import { useState, useEffect } from "react";

const OpenBudgetModal = ({ isOpen, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  const handleVote = () => {
    window.open("https://t.me/legenda_ovoz", "_blank");
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --sheet-bg: #111118;
          --card-bg: #1a1a24;
          --card-border: rgba(255,255,255,0.06);
          --text-primary: #f0f0f5;
          --text-secondary: rgba(240,240,245,0.45);
          --accent: #6c63ff;
          --gold: #f5a623;
          --font: 'Plus Jakarta Sans', sans-serif;
        }

        .obm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .obm-overlay.visible { opacity: 1; }

        .obm-sheet {
          font-family: var(--font);
          width: 100%;
          max-width: 520px;
          background: var(--sheet-bg);
          border-radius: 24px 24px 0 0;
          padding-bottom: env(safe-area-inset-bottom, 20px);
          position: relative;
          transform: translateY(100%);
          transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .obm-overlay.visible .obm-sheet {
          transform: translateY(0);
        }

        .obm-handle-wrap {
          padding: 14px 0 0;
          display: flex;
          justify-content: center;
        }
        .obm-handle {
          width: 36px;
          height: 3px;
          background: rgba(255,255,255,0.12);
          border-radius: 2px;
        }

        .obm-close {
          position: absolute;
          top: 12px;
          right: 14px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .obm-close:hover {
          background: rgba(255,255,255,0.12);
          color: var(--text-primary);
          transform: rotate(90deg);
        }

        .obm-body {
          padding: 18px 18px 22px;
        }

        .obm-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 7px;
        }
        .obm-title {
          font-size: clamp(18px, 5.5vw, 22px);
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
          margin-bottom: 5px;
        }
        .obm-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.55;
          margin-bottom: 18px;
        }

        .obm-sep {
          height: 1px;
          background: var(--card-border);
          margin-bottom: 16px;
        }

        .obm-prices {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .obm-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 14px;
          padding: 13px 14px;
          transition: border-color 0.2s;
        }
        .obm-card:active {
          border-color: rgba(108,99,255,0.3);
        }

        .obm-card-icon {
          font-size: 20px;
          line-height: 1;
          flex-shrink: 0;
        }

        .obm-card-body {
          flex: 1;
          min-width: 0;
        }
        .obm-card-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .obm-card-meta {
          font-size: 11.5px;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .obm-card-meta .hl { color: var(--gold); }

        .obm-card-price {
          flex-shrink: 0;
          text-align: right;
        }
        .obm-card-price strong {
          display: block;
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          white-space: nowrap;
        }
        .obm-card-price span {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .obm-note {
          font-size: 11.5px;
          color: rgba(255,255,255,0.22);
          text-align: center;
          margin-bottom: 16px;
          line-height: 1.5;
          padding: 0 4px;
        }

        .obm-btn {
          width: 100%;
          padding: 15px;
          background: var(--accent);
          border: none;
          border-radius: 14px;
          font-family: var(--font);
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: opacity 0.15s, transform 0.15s;
        }
        .obm-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%);
          pointer-events: none;
        }
        .obm-btn:active { transform: scale(0.98); opacity: 0.9; }

        @media (max-width: 360px) {
          .obm-body { padding: 16px 14px 18px; }
          .obm-card { padding: 11px 12px; gap: 10px; }
          .obm-title { font-size: 17px; }
        }

        @media (min-width: 521px) {
          .obm-sheet {
            border-radius: 24px;
            margin-bottom: 28px;
          }
        }
      `}</style>

      <div className={`obm-overlay ${visible ? "visible" : ""}`} onClick={handleClose}>
        <div className="obm-sheet" onClick={(e) => e.stopPropagation()}>

          <div className="obm-handle-wrap">
            <div className="obm-handle" />
          </div>
          <button className="obm-close" onClick={handleClose}>✕</button>

          <div className="obm-body">

            <div className="obm-eyebrow">🗳️ Open Budget</div>
            <div className="obm-title">Ovoz olamiz!</div>
            <div className="obm-desc">Jamoamizni qo'llab-quvvatlang va birga o'sing 🚀</div>

            <div className="obm-sep" />

            <div className="obm-prices">
              <div className="obm-card">
                <div className="obm-card-icon">💎</div>
                <div className="obm-card-body">
                  <div className="obm-card-title">1 ta ovoz</div>
                  <div className="obm-card-meta"><span className="hl">⭐ 100 Stars</span> yoki so'm</div>
                </div>
                <div className="obm-card-price">
                  <strong>22 000</strong>
                  <span>so'm</span>
                </div>
              </div>

              <div className="obm-card">
                <div className="obm-card-icon">💎</div>
                <div className="obm-card-body">
                  <div className="obm-card-title">2 ta ovoz</div>
                  <div className="obm-card-meta"><span className="hl">⭐ 200 Stars</span> / 1 oy Premium</div>
                </div>
                <div className="obm-card-price">
                  <strong>44 000</strong>
                  <span>so'm</span>
                </div>
              </div>
            </div>

            <div className="obm-note">
              📊 Ko'proq ovoz ham qabul qilinadi — narxlar shu tartibda
            </div>

            <button className="obm-btn" onClick={handleVote}>
              Ovoz berish →
            </button>

          </div>
        </div>
      </div>
    </>
  );
};

export default OpenBudgetModal;