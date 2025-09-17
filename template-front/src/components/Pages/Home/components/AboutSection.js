const AboutSection = () => {
  return (
    <section id="about" className="section-padding bg-light py-5">
      <div className="container">
        <div className="row align-items-center">
          {/* Image Section */}
          <div className="col-lg-6 mb-5 mb-lg-0" data-aos="fade-right">
            <img
              src="./assets/images/img/aboutus.jpg"
              alt="About Template.io"
              className="img-fluid rounded shadow"
              style={{
                backgroundColor: "transparent",
                display: "block",
                maxWidth: "100%",
                maxHeight: "500px",
                height: "auto",
              }}
            />
          </div>

          {/* Content Section */}
          <div className="col-lg-6" data-aos="fade-left">
            <div className="ps-lg-5">
              <div className="section-title text-start">
                <h2>
                  About <strong>Template.io</strong>
                </h2>
                <p>Simplifying template management for businesses worldwide</p>
              </div>
              <p className="mb-4">
                At <strong>Template.io</strong>, we believe that managing
                templates shouldn’t be a hassle. Founded with the vision of
                simplifying document and email workflows, our platform empowers
                businesses to create, manage, and customize templates
                seamlessly. Whether you're generating personalized documents,
                scheduling emails, or managing approvals,{" "}
                <strong>Template.io</strong> ensures efficiency, consistency,
                and security in every step of your workflow.
              </p>
              <p className="mb-4">
                Businesses trust <strong>Template.io</strong> to streamline
                their template management processes, saving time and enhancing
                productivity. With powerful features like cloud integration, and
                permission-based access, we help businesses deliver professional
                and timely communication to their customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
