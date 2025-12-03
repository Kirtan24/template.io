import { FaArrowRight, FaRocket } from "react-icons/fa";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden"
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
              <FaRocket className="text-blue-400" />
              <span>Powerful Template Management Platform</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Effortless Template
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Streamline your workflow with our powerful and intuitive template management system. 
              Designed for developers and businesses to create, manage, and customize templates effortlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#pricing"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all duration-300 hover:scale-105"
              >
                View Pricing
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300"
              >
                Explore Features
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-gray-400">Efficient</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-gray-400">Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative" data-aos="fade-left" data-aos-delay="200">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-30 transform rotate-6"></div>
              <img
                src="./assets/images/img/bg2.jpg"
                alt="Template Management Preview"
                className="relative w-full h-auto rounded-3xl shadow-2xl object-cover border border-white/20"
                style={{ maxHeight: "600px" }}
              />
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <FaRocket className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Fast Setup</div>
                    <div className="text-xs text-gray-500">In minutes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
