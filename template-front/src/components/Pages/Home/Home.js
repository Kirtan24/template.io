import { useEffect } from "react";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import ServicesSection from "./components/ServicesSection";
import AboutSection from "./components/AboutSection";
import PricingSection from "./components/PricingSection";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GoToTopButton from "./components/GoToTop";
import "aos/dist/aos.css"; // Import AOS CSS
import AOS from "aos";
import "./assets/css/styles.css";

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
    });
  }, []);

  return (
    <>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <AboutSection />
      <PricingSection />
      <Footer />
      <GoToTopButton />
    </>
  );
};

export default Home;
