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
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
        {/* Inner spinning ring */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
