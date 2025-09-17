import {
  FaFileAlt,
  FaFileSignature,
  FaEnvelopeOpenText,
  FaPaperPlane,
  FaShareAlt,
  FaCloudUploadAlt,
} from "react-icons/fa";

const FeaturesSection = () => {
  const features = [
    {
      icon: <FaFileAlt />,
      title: "Smart Document Templates",
      description:
        "Design and store reusable document templates with dynamic variables.",
    },
    {
      icon: <FaFileSignature />,
      title: "Automated Document Generation",
      description:
        "Generate fully customized documents in seconds, saving time and effort.",
    },
    {
      icon: <FaEnvelopeOpenText />,
      title: "Email Template Creation",
      description:
        "Create and manage professional email templates for consistent communication.",
    },
    {
      icon: <FaPaperPlane />,
      title: "Instant & Scheduled Email Sending",
      description:
        "Send emails instantly or schedule them for later using predefined templates.",
    },
    {
      icon: <FaShareAlt />,
      title: "Real-Time Collaboration",
      description:
        "Share templates, assign roles, and collaborate with teams effortlessly.",
    },
    {
      icon: <FaCloudUploadAlt />,
      title: "Cloud-Based Access",
      description:
        "Access, edit, and store templates securely from anywhere, anytime.",
    },
  ];

  return (
    <section id="features" className="section-padding bg-light">
      <div className="container">
        <div className="section-title text-center" data-aos="fade-up">
          <h2>What We Provide</h2>
          <p>
            Discover the powerful features that make our Template Management
            System stand out
          </p>
        </div>

        <div className="row g-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="col-md-6 col-lg-4"
              data-aos="fade-up"
              data-aos-delay={100 * index}
            >
              <div className="card h-100 p-4 text-center">
                <div className="feature-icon mx-auto">{feature.icon}</div>
                <h4 className="mb-3">{feature.title}</h4>
                <p className="text-muted">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
