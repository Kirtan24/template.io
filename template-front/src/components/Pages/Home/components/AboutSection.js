const AboutSection = () => {
  return (
    <section id="about" className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Section */}
          <div className="relative" data-aos="fade-right">
            <div className="relative">
              {/* Decorative gradient background */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
              
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="./assets/images/img/aboutus.jpg"
                  alt="About Template.io"
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: "650px" }}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                    5+
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">Years</div>
                    <div className="text-sm text-gray-500">Of Excellence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:pl-8" data-aos="fade-left">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
              About Us
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Template.io</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Simplifying template management for businesses worldwide
            </p>
            
            <div className="space-y-6 mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                At <strong className="text-gray-900">Template.io</strong>, we believe that managing
                templates shouldn't be a hassle. Founded with the vision of
                simplifying document and email workflows, our platform empowers
                businesses to create, manage, and customize templates
                seamlessly. Whether you're generating personalized documents,
                scheduling emails, or managing approvals,{" "}
                <strong className="text-gray-900">Template.io</strong> ensures efficiency, consistency,
                and security in every step of your workflow.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Businesses trust <strong className="text-gray-900">Template.io</strong> to streamline
                their template management processes, saving time and enhancing
                productivity. With powerful features like cloud integration, and
                permission-based access, we help businesses deliver professional
                and timely communication to their customers.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                Cloud Integration
              </span>
              <span className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
                Secure Access
              </span>
              <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">
                24/7 Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
