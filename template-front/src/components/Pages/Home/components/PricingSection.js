import React, { useEffect, useState } from 'react';
import { FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../../../utils/helpers/helper';

const { API_URL } = config;

const PricingSection = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`${API_URL}/plans`);
        setPlans(response.data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };
    fetchPlans();
  }, []);

  const handlePlanClick = (planName) => {
    navigate('/subscription', { state: { selectedPlan: planName } });
  };

  return (
    <section id="pricing" className="section-padding py-5">
      <div className="container">
        <div className="section-title text-center" data-aos="fade-up">
          <h2>Pricing Plans</h2>
          <p>Choose the perfect plan for your business needs</p>
        </div>

        <div className="row g-4 justify-content-center">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay={100 * index}
            >
              <div
                className={`pricing-card h-100 position-relative ${
                  plan.popular ? "popular" : ""
                }`}
              >
                {plan.popular && (
                  <div className="pricing-popular-badge">Most Popular</div>
                )}
                <div className="pricing-header">
                  <h3 className={`${plan.popular ? "mt-2" : ""} mb-0`}>
                    {plan.name}
                  </h3>
                </div>
                <div className="p-4 text-center">
                  <div className="mb-4">
                    <span className="display-4 fw-bold">₹{plan.price}</span>
                    <span className="text-muted">{plan.period}</span>
                  </div>
                  <p className="text-muted mb-4">{plan.description}</p>

                  <ul className="list-unstyled mb-5">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="py-2 border-bottom d-flex align-items-center"
                      >
                        {feature.included ? (
                          <FaCheck className="text-success me-2" />
                        ) : (
                          <FaTimes className="text-muted me-2" />
                        )}
                        <span className={feature.included ? "" : "text-muted"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanClick(plan._id)}
                    className={`btn ${
                      plan.popular ? "btn-primary" : "btn-outline-primary"
                    } rounded-pill px-4 py-2 w-100`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
