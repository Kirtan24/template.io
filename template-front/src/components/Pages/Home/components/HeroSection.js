import { FaArrowRight } from "react-icons/fa";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="hero-section py-5"
      style={{ paddingTop: "80px" }}
    >
      <div className="container">
        <div className="row align-items-center g-4">
          {/* Left Content */}
          <div
            className="col-lg-6 order-2 order-lg-1 text-center text-lg-start"
            data-aos="fade-right"
          >
            <h1 className="text-white display-4 fw-bold mb-3">
              Effortless Template Management System
            </h1>
            <p className="lead text-white mb-4">
              Streamline your workflow with our powerful and intuitive template
              management system. Designed for developers and businesses to
              create, manage, and customize templates effortlessly.
            </p>
            <div className="d-flex flex-row flex-sm-row gap-3 justify-content-center justify-content-lg-start">
              <a
                href="#pricing"
                className="btn btn-light btn-lg px-4 rounded-pill"
              >
                View Pricing
              </a>
              <a
                href="#features"
                className="btn btn-dark btn-lg px-4 rounded-pill d-flex align-items-center"
              >
                Explore Features <FaArrowRight className="ms-2" />
              </a>
            </div>
          </div>

          {/* Right Image */}
          <div
            className="col-lg-6 order-1 order-lg-2 d-flex justify-content-center"
            data-aos="fade-left"
          >
            <img
              src="./assets/images/img/bg2.jpg"
              alt="Template Management Preview"
              className="img-fluid rounded shadow-lg"
              style={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: "400px",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
