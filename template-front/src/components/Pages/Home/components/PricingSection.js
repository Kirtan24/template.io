import React, { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../../utils/helpers/helper";

const { API_URL } = config;

const PricingSection = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`${API_URL}/plans`);
        console.log("Plans fetched:", response.data);
        setPlans(response.data);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePlanClick = (planId) => {
    navigate("/subscription", { state: { selectedPlan: planId } });
  };

  if (loading) {
    return (
      <section id="pricing" className="py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20" data-aos="fade-up">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
            Pricing
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Select the perfect plan for your business needs. All plans include our core features with flexible options.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No pricing plans available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {plans.map((plan, index) => (
              <div
                key={plan._id || index}
                className={`relative ${plan.popular ? "lg:-mt-4 lg:mb-4" : ""}`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl">
                      <FaStar className="text-yellow-200" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div
                  className={`h-full bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 overflow-hidden border-2 ${
                    plan.popular
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 scale-105"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {/* Header */}
                  <div
                    className={`p-8 text-center ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white"
                        : "bg-gradient-to-r from-gray-50 to-gray-100"
                    }`}
                  >
                    <h3
                      className={`text-3xl font-extrabold mb-2 ${
                        plan.popular ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p
                        className={`text-sm ${
                          plan.popular ? "text-blue-100" : "text-gray-600"
                        }`}
                      >
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        <span className="text-6xl font-extrabold text-gray-900">
                          {plan.price}
                        </span>
                      </div>
                      {plan.period && (
                        <p className="text-gray-600 text-lg font-medium">
                          {plan.period}
                        </p>
                      )}
                    </div>

                    {/* Features List */}
                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3"
                          >
                            <span className={`mt-1 flex-shrink-0 ${
                              feature.included ? "text-green-500" : "text-gray-300"
                            }`}>
                              {feature.included ? (
                                <FaCheck className="text-xl" />
                              ) : (
                                <FaTimes className="text-xl" />
                              )}
                            </span>
                            <span
                              className={`text-base leading-relaxed ${
                                feature.included
                                  ? "text-gray-700"
                                  : "text-gray-400 line-through"
                              }`}
                            >
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={() => handlePlanClick(plan._id)}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700"
                          : "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow-xl"
                      }`}
                    >
                      {plan.buttonText || "Choose Plan"}
                    </button>
                  </div>

                  {/* Decorative Element */}
                  {plan.popular && (
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;
