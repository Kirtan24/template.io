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
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaFileSignature />,
      title: "Automated Document Generation",
      description:
        "Generate fully customized documents in seconds, saving time and effort.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaEnvelopeOpenText />,
      title: "Email Template Creation",
      description:
        "Create and manage professional email templates for consistent communication.",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: <FaPaperPlane />,
      title: "Instant & Scheduled Email Sending",
      description:
        "Send emails instantly or schedule them for later using predefined templates.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaShareAlt />,
      title: "Real-Time Collaboration",
      description:
        "Share templates, assign roles, and collaborate with teams effortlessly.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: <FaCloudUploadAlt />,
      title: "Cloud-Based Access",
      description:
        "Access, edit, and store templates securely from anywhere, anytime.",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <section id="features" className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20" data-aos="fade-up">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
            Features
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
            What We Provide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the powerful features that make our Template Management System stand out
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="h-full bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 relative overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className={`w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative Corner */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-500`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
