import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const GoToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <FaArrowUp className="text-lg" />
    </button>
  );
};

export default GoToTopButton;
