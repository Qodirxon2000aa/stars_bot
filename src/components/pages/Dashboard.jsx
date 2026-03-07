// Dashboard.jsx – FULL FINAL VERSION (Events qo'shilgan) 🚀
import React, {
  useEffect,
  useState,
  useRef,
  lazy,
  Suspense,
} from "react";
import Lottie from "lottie-react";
import "./Dashboard.css";

import Header from "../pages/Header/Header.jsx";
import Footer from "./Footer/Footer.jsx";
import ReferralModal from "./Footer/ReferralModal.jsx";
import Money from "../../components/pages/Money/Money.jsx";
import Profile from "./Footer/Profile.jsx";
import Premium from "./premuium/Premium.jsx"
import Stars from "./starts/Stars.jsx"

/* ===============================
   🔥 LAZY COMPONENTS
================================ */
const Market = lazy(() => import("../pages/Market/Market.jsx"));
const Events = lazy(() => import("../pages/Events/Events.jsx")); // YANGI: Events lazy

const Dashboard = () => {
  const dashboardRef = useRef(null);

  const [isPremium, setIsPremium] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const [openModal, setOpenModal] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  /* ===============================
     🔥 WELCOME STATE
  ================================ */
  const [showWelcome, setShowWelcome] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const finishedRef = useRef(false);

  const isMarketOpen = activeSection === "market";
  const isEventsOpen = activeSection === "events"; // YANGI: Events ochiqmi?
  const isFullScreenSection = isMarketOpen || isEventsOpen; // Market yoki Events ochiq bo'lsa header yashiriladi

  /* ===============================
     🔐 MODAL SCROLL LOCK (OPTIMIZED)
  ================================ */
  useEffect(() => {
    if (!dashboardRef.current) return;

    const locked =
      openModal === "money" || showReferralModal || showProfile;

    dashboardRef.current.classList.toggle("modal-lock", locked);
  }, [openModal, showReferralModal, showProfile]);

  /* ===============================
     🚀 WELCOME — FAQAT 1 MARTA
  ================================ */
  useEffect(() => {
    const shown = sessionStorage.getItem("welcome_shown");
    if (shown) return;

    setShowWelcome(true);

    // Async yuklash (UI bloklanmaydi)
    import("../../assets/animation.json").then((res) => {
      setAnimationData(res.default);
    });
  }, []);

  const handleAnimationComplete = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    sessionStorage.setItem("welcome_shown", "1");
    setShowWelcome(false);
  };

  return (
    <>
      {/* ================= WELCOME SCREEN ================= */}
      {showWelcome && (
        <div className="welcome-screen">
          <div className="video-box">
            {animationData && (
              <Lottie
                animationData={animationData}
                loop={false}
                autoplay
                onComplete={handleAnimationComplete}
                rendererSettings={{
                  progressiveLoad: true,
                  preserveAspectRatio: "xMidYMid slice",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ================= DASHBOARD ================= */}
      {!showWelcome && (
        <div className="dashboard" ref={dashboardRef}>
          {/* HEADER — Market yoki Events ochiq bo'lsa yashiriladi */}
          {!isFullScreenSection && (
            <Header
              isPremium={isPremium}
              setIsPremium={setIsPremium}
              onOpenMoney={() => setOpenModal("money")}
            />
          )}

          {/* MAIN CONTENT */}
          <div
            className={`dashboard-main ${
              isFullScreenSection ? "market-full" : ""
            }`}
          >
            <Suspense fallback={<div className="loader"></div>}>
              {/* HOME */}
              {activeSection === "home" && (
                <div className="dashboard-content">
                  {isPremium ? <Premium /> : <Stars />}
                </div>
              )}

              {/* MARKET */}
              {activeSection === "market" && (
                <div className="dashboard-content market-page">
                  <Market />
                </div>
              )}

              {/* EVENTS — YANGI BO'LIM */}
              {activeSection === "events" && (
                <div className="dashboard-content market-page">
                  <Events />
                </div>
              )}
            </Suspense>
          </div>

          {/* MONEY MODAL */}
          {openModal === "money" && (
            <div
              className="modal-overlay"
              onClick={() => setOpenModal(null)}
            >
              <div
                className="modal-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Money onClose={() => setOpenModal(null)} />
              </div>
            </div>
          )}

          {/* REFERRAL MODAL */}
          <ReferralModal
            isOpen={showReferralModal}
            onClose={() => setShowReferralModal(false)}
          />

          {/* PROFILE MODAL */}
          {showProfile && (
            <Profile onClose={() => setShowProfile(false)} />
          )}

          {/* FOOTER — Yangi Events tugmasi bilan */}
          <Footer
            activeSection={activeSection}
            onHomeClick={() => setActiveSection("home")}
            onMarketClick={() => setActiveSection("market")}
            onEventsClick={() => setActiveSection("events")} // YANGI
            onInviteClick={() => {
              setActiveSection("home");
              setShowReferralModal(true);
            }}
            onProfileClick={() => setShowProfile(true)}
          />
        </div>
      )}
    </>
  );
};

export default Dashboard;