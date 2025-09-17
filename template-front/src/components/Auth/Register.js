import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CONSTANT } from "../../utils/constant";
import config from "../../utils/helpers/helper";
import axios from "axios";
import { handleError } from "../../utils/errorHandling/errorHandler";
import { notify } from "../../utils/notifications/ToastNotification";
import LogoLarge from "../../utils/logo/LogoLarge";
import Title from "../Pages/Title";

const { API_URL } = config;

const Register = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlan = location.state?.selectedPlan;
  console.log(selectedPlan)
  const [fields, setFields] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    plan: location?.state?.selectedPlan || "",
  });

  const [errors, setErrors] = useState({});
  const [plans, setPlans] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => {
    if (validateForm()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };


  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/plans`);
      if (response.status === 200) {
        setPlans(response.data);
      } else {
        handleError(response);
      }
    } catch (error) {
      console.log(error);
      handleError(error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const requiredFields =
      currentStep === 1
        ? ["name", "address", "plan"]
        : currentStep === 2
          ? ["email", "contactNumber"]
          : [];

    requiredFields.forEach((field) => {
      if (!fields[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
    });

    if (currentStep === 1) {
      if (fields.name && !/^[a-zA-Z\s]{2,50}$/.test(fields.name)) {
        newErrors.name = "Name must contain only letters and be 2-50 characters long";
        isValid = false;
      }
      if (fields.address && (fields.address.length < 5 || fields.address.length > 100)) {
        newErrors.address = "Address must be 5-100 characters long";
        isValid = false;
      }
    }

    if (currentStep === 2) {
      if (fields.email && !/\S+@\S+\.\S+/.test(fields.email)) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }
      if (fields.contactNumber && !/^\d{10}$/.test(fields.contactNumber)) {
        newErrors.contactNumber = "Contact number must be a valid 10-digit number";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };


  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, fields);
      if (response.status === 200) {
        notify(response.data.message, response.data.status);
        setIsRegistered(true);
      } else {
        handleError(response);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleFieldChange = (field, value) => {
    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
    setFields((prevFields) => ({ ...prevFields, [field]: value }));
  };

  return (
    <>
      <Title title={title} />
      <div className="auth-body-bg">
        <div className="container-fluid p-0">
          <div className="row g-0 h-100">

            <div className="col-xl-6">
              <div className="auth-full-bg pt-lg-5 p-4">
                <div className="d-flex h-100 flex-column">
                  <div className="p-4 mt-auto">
                    <div className="row justify-content-center">
                      <div className="col-lg-7">
                        <div className="text-center">
                          <img
                            src="register.jpg"
                            alt="Register"
                            className="img-fluid mb-4"
                            style={{ maxWidth: "100%", height: "auto" }}
                          />

                          <h4 className="mb-3">
                            <i className="bx bxs-quote-alt-left text-primary h1 align-middle me-3"></i>
                            <span className="text-primary">50</span>+ Satisfied clients
                          </h4>
                          <p className="font-size-16 mb-4">
                            "Great experience using this platform. It has made my work easier!"
                          </p>
                          <h4 className="font-size-16 text-primary">John Doe</h4>
                          <p className="font-size-14 mb-0">- {CONSTANT.AUTH.APP_NAME}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-6 d-flex justify-content-center align-items-center">
              <div className="auth-full-page-content p-md-5 p-4 w-100">
                <div className="w-100">
                  <div className="d-flex flex-column h-100">

                    <div className="mb-4 mb-md-5 text-center">
                      <Link to="/" className="d-block auth-logo">
                        <LogoLarge dark={true} />
                      </Link>
                    </div>

                    <div className="position-relative mb-4">
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${(currentStep - 1) * 50}%` }}
                          aria-valuenow={(currentStep - 1) * 50}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                      {[1, 2, 3].map((step) => (
                        <button
                          key={step}
                          type="button"
                          className={`position-absolute top-0 translate-middle btn btn-sm ${currentStep >= step ? "btn-primary" : "btn-secondary"
                            } rounded-pill`}
                          style={{
                            width: "2rem",
                            height: "2rem",
                            left: `${(step - 1) * 50}%`,
                          }}
                        >
                          {step}
                        </button>
                      ))}
                    </div>

                    {!isRegistered ? (
                      <div className="my-auto">
                        <h5 className="text-primary text-center">Register Account</h5>
                        <p className="text-muted text-center">Get your free Template.io account now.</p>

                        {currentStep === 1 && (
                          <>
                            <h5 className="mb-3">Step 1: Basic Details</h5>
                            <div className="mb-3">
                              <label className="form-label">Name</label>
                              <input
                                type="text"
                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                placeholder="Enter name"
                                value={fields.name}
                                onChange={(e) => handleFieldChange("name", e.target.value)}
                              />
                              {errors.name && <div className="text-danger">{errors.name}</div>}
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Address</label>
                              <input
                                type="text"
                                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                                placeholder="Enter address"
                                value={fields.address}
                                onChange={(e) => handleFieldChange("address", e.target.value)}
                              />
                              {errors.address && <div className="text-danger">{errors.address}</div>}
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Select Plan</label>
                              <select
                                className={`form-control ${errors.plan ? "is-invalid" : ""}`}
                                value={fields.plan}
                                onChange={(e) => handleFieldChange("plan", e.target.value)}
                              >
                                <option value="">Select Plan</option>
                                {plans.map((p) => (
                                  <option key={p._id} value={p._id}>
                                    {p.name} - {p.price}
                                  </option>
                                ))}
                              </select>
                              {errors.plan && <div className="text-danger">{errors.plan}</div>}
                            </div>

                            <div className="d-flex justify-content-end">
                              <button className="btn btn-primary" onClick={nextStep}>Next</button>
                            </div>
                          </>
                        )}

                        {currentStep === 2 && (
                          <>
                            <h5 className="mb-3">Step 2: Contact Details</h5>
                            <div className="mb-3">
                              <label className="form-label">Email</label>
                              <input
                                type="email"
                                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                placeholder="Enter email"
                                value={fields.email}
                                onChange={(e) => handleFieldChange("email", e.target.value)}
                              />
                              {errors.email && <div className="text-danger">{errors.email}</div>}
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Contact Number</label>
                              <input
                                type="text"
                                className={`form-control ${errors.contactNumber ? "is-invalid" : ""}`}
                                placeholder="Enter contact number"
                                value={fields.contactNumber}
                                onChange={(e) => handleFieldChange("contactNumber", e.target.value)}
                              />
                              {errors.contactNumber && <div className="text-danger">{errors.contactNumber}</div>}
                            </div>

                            <div className="d-flex justify-content-between">
                              <button className="btn btn-outline-secondary" onClick={prevStep}>Back</button>
                              <button className="btn btn-primary" onClick={nextStep}>Next</button>
                            </div>
                          </>
                        )}

                        {currentStep === 3 && (
                          <>
                            <h5 className="mb-3">Step 3: Payment</h5>
                            <p>Payment integration will be added later. Click "Submit" to complete registration.</p>

                            <div className="d-flex justify-content-between">
                              <button className="btn btn-outline-secondary" onClick={prevStep}>Back</button>
                              <button className="btn btn-success" onClick={handleRegister}>Submit</button>
                            </div>

                          </>
                        )}

                        <div className="mt-5 text-center">
                          <p>Already have an account? <Link to="/login" className="fw-medium text-primary">Login</Link></p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-center">
                          <h4 className="text-success mb-3">Registration Request Sent!</h4>
                          <p className="text-muted">Thank you for registering. You can now proceed to the login page.</p>

                          <Link to="/login" className="btn btn-primary mt-3">Go to Login</Link>
                        </div>
                      </>

                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

// import React, { useEffect, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { CONSTANT } from "../../utils/constant";
// import config from "../../utils/helpers/helper";
// import axios from "axios";
// import { handleError } from "../../utils/errorHandling/errorHandler";
// import { notify } from "../../utils/notifications/ToastNotification";

// const { API_URL } = config;

// const Register = ({ title }) => {
//   useEffect(() => {
//     document.title = `${title} • ${CONSTANT.AUTH.APP_NAME}`;
//   }, [title]);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const selectedPlan = location.state?.selectedPlan;
//   console.log(selectedPlan)
//   const [fields, setFields] = useState({
//     name: "",
//     email: "",
//     contactNumber: "",
//     address: "",
//     plan: location?.state?.selectedPlan || "",
//   });

//   const [errors, setErrors] = useState({});
//   const [plans, setPlans] = useState([]);
//   const [isRegistered, setIsRegistered] = useState(false);

//   const fetchPlans = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/plans`);
//       if (response.status === 200) {
//         setPlans(response.data);
//       } else {
//         handleError(response);
//       }
//     } catch (error) {
//       console.log(error);
//       handleError(error);
//     }
//   };

//   useEffect(() => {
//     fetchPlans();
//   }, []);

//   const validateForm = () => {
//     const newErrors = {};
//     let isValid = true;

//     // Validate fields
//     for (const field in fields) {
//       if (!fields[field]) {
//         newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
//         isValid = false;
//       } else {
//         newErrors[field] = "";
//       }

//       if (field === "email" && fields.email && !/\S+@\S+\.\S+/.test(fields.email)) {
//         newErrors.email = "Please enter a valid email address";
//         isValid = false;
//       }
//     }

//     console.log(newErrors)
//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     // Validate the form before proceeding
//     if (!validateForm()) {
//       return;
//     }

//     try {
//       // Make the POST request using axios, including the new fields
//       const response = await axios.post(`${API_URL}/auth/register`, {
//         name: fields.name,
//         email: fields.email,
//         contactNumber: fields.contactNumber,
//         address: fields.address,
//         plan: fields.plan,
//       });

//       if (response.status === 200) {
//         notify(response.data.message, response.data.status);
//         setIsRegistered(true); // Set to true after successful registration
//       } else {
//         handleError(response);
//       }
//     } catch (error) {
//       handleError(error);
//     }
//   };

//   const handleFieldChange = (field, value) => {
//     Object.keys(errors).forEach((key) => field === key ? errors[key] = '' : '');
//     setFields((prevFields) => ({
//       ...prevFields,
//       [field]: value,
//     }));
//   };

//   return (
//     <>
//       <div className="auth-body-bg">
//         <div className="container-fluid p-0">
//           <div className="row g-0 h-100">

//             {/* Left Side */}
//             <div className="col-xl-6">
//               <div className="auth-full-bg pt-lg-5 p-4">
//                 <div className="w-100 h-100">
//                   <div className="d-flex h-100 flex-column">
//                     <div className="p-4 mt-auto">
//                       <div className="row justify-content-center">
//                         <div className="col-lg-7">
//                           <div className="text-center">
//                             <h4 className="mb-3">
//                               <i className="bx bxs-quote-alt-left text-primary h1 align-middle me-3"></i>
//                               <span className="text-primary">50</span>+ Satisfied clients
//                             </h4>
//                             <p className="font-size-16 mb-4">
//                               "Great experience using this platform. It has made my work easier!"
//                             </p>
//                             <h4 className="font-size-16 text-primary">John Doe</h4>
//                             <p className="font-size-14 mb-0">- {CONSTANT.AUTH.APP_NAME}</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right Side */}
//             <div className="col-xl-6">
//               <div className="auth-full-page-content p-md-5 p-4">
//                 <div className="w-100">
//                   <div className="d-flex flex-column h-100">
//                     <div className="mb-4 mb-md-5">
//                       <Link to="/" className="d-block auth-logo">
//                         <img src="assets/images/logo-dark.png" alt="logo" height="18" className="auth-logo-dark" />
//                         <img src="assets/images/logo-light.png" alt="logo" height="18" className="auth-logo-light" />
//                       </Link>
//                     </div>

//                     {/* Registration Form */}
//                     {!isRegistered ? (
//                       <div className="my-auto">
//                         <h5 className="text-primary">Register Account</h5>
//                         <p className="text-muted">Get your free {CONSTANT.AUTH.APP_NAME} account now.</p>

//                         <form className="needs-validation" noValidate onSubmit={handleRegister}>
//                           <div className="mb-3">
//                             <label htmlFor="name" className="form-label">Name</label>
//                             <input
//                               type="text"
//                               className={`form-control ${errors.name ? "is-invalid" : ""}`}
//                               id="name"
//                               placeholder="Enter name"
//                               value={fields.name}
//                               onChange={(e) => handleFieldChange("name", e.target.value)}
//                             />
//                             {errors.name && <div className="text-danger">{errors.name}</div>}
//                           </div>

//                           <div className="mb-3">
//                             <label htmlFor="useremail" className="form-label">Email</label>
//                             <input
//                               type="email"
//                               className={`form-control ${errors.email ? "is-invalid" : ""}`}
//                               id="useremail"
//                               placeholder="Enter email"
//                               value={fields.email}
//                               onChange={(e) => handleFieldChange("email", e.target.value)}
//                             />
//                             {errors.email && <div className="text-danger">{errors.email}</div>}
//                           </div>

//                           <div className="mb-3">
//                             <label htmlFor="contactNumber" className="form-label">Contact Number</label>
//                             <input
//                               type="text"
//                               className={`form-control ${errors.contactNumber ? "is-invalid" : ""}`}
//                               id="contactNumber"
//                               placeholder="Enter contact number"
//                               value={fields.contactNumber}
//                               onChange={(e) => handleFieldChange("contactNumber", e.target.value)}
//                             />
//                             {errors.contactNumber && <div className="text-danger">{errors.contactNumber}</div>}
//                           </div>

//                           <div className="mb-3">
//                             <label htmlFor="address" className="form-label">Address</label>
//                             <input
//                               type="text"
//                               className={`form-control ${errors.address ? "is-invalid" : ""}`}
//                               id="address"
//                               placeholder="Enter address"
//                               value={fields.address}
//                               onChange={(e) => handleFieldChange("address", e.target.value)}
//                             />
//                             {errors.address && <div className="text-danger">{errors.address}</div>}
//                           </div>

//                           <div className="mb-3">
//                             <label htmlFor="plan" className="form-label">Select Plan</label>
//                             <select
//                               className={`form-control ${errors.plan ? "is-invalid" : ""}`}
//                               id="plan"
//                               value={fields.plan}
//                               onChange={(e) => handleFieldChange("plan", e.target.value)}
//                             >
//                               <option value="">Select Plan</option>
//                               {plans.map((p) => (
//                                 <option key={p._id} value={p.name}>{p.name} - {p.price}</option>
//                               ))}
//                             </select>
//                             {errors.plan && <div className="text-danger">{errors.plan}</div>}
//                           </div>

//                           <button className="btn btn-primary waves-effect waves-light w-100" type="submit">
//                             Register
//                           </button>
//                         </form>

//                         <div className="mt-5 text-center">
//                           <p>Already have an account? <Link to="/login" className="fw-medium text-primary">Login</Link></p>
//                         </div>
//                       </div>
//                     ) : (
//                       <h4 className="text-success text-center">Registration Request Sent!</h4>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Register;
