import { FaCogs, FaMobileAlt, FaSyncAlt, FaShieldAlt } from "react-icons/fa";

const ServicesSection = () => {
  const services = [
    {
      icon: <FaCogs size={40} />,
      title: "Tailored Dashboard Solutions",
      description:
        "We create dynamic, high-performing admin dashboards customized to your workflow and business needs.",
      color: "blue",
    },
    {
      icon: <FaMobileAlt size={40} />,
      title: "Responsive & Modern UI/UX",
      description:
        "Deliver an unmatched user experience with clean, responsive, and intuitive UI designs.",
      color: "purple",
    },
    {
      icon: <FaSyncAlt size={40} />,
      title: "Seamless System Integrations",
      description:
        "Effortlessly connect your dashboard with CRMs, third-party apps, and APIs for a unified system.",
      color: "indigo",
    },
    {
      icon: <FaShieldAlt size={40} />,
      title: "Security & Performance Optimization",
      description:
        "Ensure fast performance and top-tier security to protect your data and enhance user trust.",
      color: "green",
    },
  ];

  const colorClasses = {
    blue: {
      bg: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    purple: {
      bg: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    indigo: {
      bg: "from-indigo-500 to-blue-500",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    green: {
      bg: "from-green-500 to-emerald-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  };

  return (
    <section id="services" className="py-24 lg:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20" data-aos="fade-up">
          <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold mb-4">
            Services
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
            Our Expertise
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Powerful features to help you build and manage an effective admin dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const colors = colorClasses[service.color];
            return (
              <div
                key={index}
                className="group"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <div className="h-full bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 relative overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                      <div className={`w-20 h-20 flex items-center justify-center rounded-2xl ${colors.iconBg} ${colors.iconColor} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                        {service.icon}
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                      {service.title}
                    </h4>
                    <p className="text-gray-600 text-center leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Animated border */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${colors.bg} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
