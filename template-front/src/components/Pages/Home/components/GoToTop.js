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
    <div
      className={`go-to-top-btn ${isVisible ? "visible" : "invisible"}`}
      style={{
        position: "fixed",
        bottom: "10px",
        right: "15px",
        zIndex: 99,
        cursor: "pointer",
        padding: "10px",
        borderRadius: "50%",
        backgroundColor: "var(--primary-color)",
        color: "white",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s, transform 0.3s",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "50px",
        height: "50px",
      }}
      onClick={scrollToTop}
    >
      <FaArrowUp />
    </div>
  );
};

export default GoToTopButton;
