import { FaCogs, FaMobileAlt, FaSyncAlt, FaShieldAlt } from "react-icons/fa";

const ServicesSection = () => {
  const services = [
    {
      icon: <FaCogs className="text-primary" size={60} />,
      title: "Tailored Dashboard Solutions",
      description:
        "We create dynamic, high-performing admin dashboards customized to your workflow and business needs.",
    },
    {
      icon: <FaMobileAlt className="text-primary" size={60} />,
      title: "Responsive & Modern UI/UX",
      description:
        "Deliver an unmatched user experience with clean, responsive, and intuitive UI designs.",
    },
    {
      icon: <FaSyncAlt className="text-primary" size={60} />,
      title: "Seamless System Integrations",
      description:
        "Effortlessly connect your dashboard with CRMs, third-party apps, and APIs for a unified system.",
    },
    {
      icon: <FaShieldAlt className="text-primary" size={60} />,
      title: "Security & Performance Optimization",
      description:
        "Ensure fast performance and top-tier security to protect your data and enhance user trust.",
    },
  ];

  return (
    <section id="services" className="section-padding py-5">
      <div className="container">
        <div className="section-title text-center mb-5" data-aos="fade-up">
          <h2>Our Expertise</h2>
          <p>
            Powerful features to help you build and manage an effective admin
            dashboard.
          </p>
        </div>

        <div className="row g-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="col-md-6 col-lg-3"
              data-aos="zoom-in"
              data-aos-delay={100 * index}
            >
              <div className="card h-100 p-4 text-center shadow-sm border-0">
                <div className="d-flex justify-content-center mb-3">
                  {service.icon}
                </div>
                <h4 className="mb-3">{service.title}</h4>
                <p className="text-muted">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
