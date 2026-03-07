import React, { useRef, useEffect } from "react";
import Lottie from "lottie-react";
import "./WelcomeAnimation.css";
import animationData from "../assets/animation.json";

const WelcomeAnimation = ({ onFinish }) => {
  const finishedRef = useRef(false);

  useEffect(() => {
    return () => {
      // 🔒 unmount paytida qayta chaqirilishdan himoya
      finishedRef.current = true;
    };
  }, []);

  return (
    <div className="welcome-screen">
      <div className="video-box">
        <Lottie
          animationData={animationData}
          loop={false}
          autoplay
          onComplete={() => {
            if (finishedRef.current) return;

            finishedRef.current = true;

            // 🔥 React lifecycle tugagach chaqiramiz
            setTimeout(() => {
              onFinish?.();
            }, 0);
          }}
        />
      </div>
    </div>
  );
};

export default WelcomeAnimation;
