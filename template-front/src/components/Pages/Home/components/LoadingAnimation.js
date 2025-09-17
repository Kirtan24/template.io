import { useEffect, useState } from "react";

const LoadingAnimation = () => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`loading-animation ${fadeOut ? "fade-out" : ""}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingAnimation;
