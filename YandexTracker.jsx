import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const YandexTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.ym) {
      window.ym(106140145, "hit", location.pathname);
    }
  }, [location]);

  return null;
};

export default YandexTracker;
