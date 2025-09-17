import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../../utils/helpers/helper";
import { getItem, getToken, setItem } from "../../../utils/localStorageHelper";
import { handleError } from "../../../utils/errorHandling/errorHandler";
import { CONSTANT } from "../../../utils/constant";
import { notify } from "../../../utils/notifications/ToastNotification";
import Spinner from "../../Spinner/Spinner";
import Title from "../Title";

const { API_URL } = config;

const SendTemplate = ({ title }) => {
  const navigate = useNavigate();
  const templateId = getItem('send_template_id');

  const [formData, setFormData] = useState({});
  const [sendTemplate, setSendTemplate] = useState({ files: [] });
  const [template, setTemplate] = useState({
    name: "",
    filename: "",
    description: "",
    emailTemplate: "",
    fields: [],
    isSignature: false,
    files: [],
  });
  const [fields, setFields] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  const fetchTemplateData = async () => {

    if (!templateId) {
      notify("Template ID is missing", "error");
      navigate('/template');
    }

    const token = fetchToken();
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setTemplate(response.data);
        const sortedFields = response.data.fields.sort((a, b) => {
          const order = { text: 1, textarea: 2, date: 3, file: 4 };
          return (order[a.inputType] || 5) - (order[b.inputType] || 5);
        });
        setFields(sortedFields);
      } else {
        notify(response.data.message, response.data.status);
        navigate("/template");
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchTemplateData();
  }, [templateId]);

  const handleCancel = () => {
    navigate("/template");
  };

  const handleFileChange = (fieldName, e) => {
    if (errors[fieldName]) {
      delete errors[fieldName];
    }

    const selectedFiles = Array.from(e.target.files);

    const filesWithFieldName = selectedFiles.map((file) => ({
      fieldName,
      file,
    }));

    setSendTemplate((prev) => ({
      ...prev,
      files: [...prev.files, ...filesWithFieldName],
    }));
  };

  const handleFieldChange = (fieldName, value) => {
    if (errors[fieldName]) {
      delete errors[fieldName];
    }
    setSendTemplate({
      ...sendTemplate,
      [fieldName]: value,
    });
    setErrors(errors);
  };

  const validateForm = () => {
    let isValid = true;
    const validationErrors = {};

    template.fields.forEach((field) => {
      if (field.isSignature === true) return;

      if (!sendTemplate[field.name] && !(field.inputType === "file" && sendTemplate.files.length > 0)) {
        validationErrors[field.name] = `${field.name.replace("%", "")} is required`;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      isValid = false;
    } else {
      setErrors({});
    }

    if (!isValid) setLoading(false);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateForm()) return;

    try {
      const token = fetchToken();
      if (!token) return;

      const formData = new FormData();
      const fileMapping = {};

      Object.keys(sendTemplate).forEach((key) => {
        if (key !== "files") {
          formData.append(key, sendTemplate[key]);
        }
      });

      sendTemplate.files.forEach((fileObj, index) => {
        const fieldName = fileObj.fieldName;
        fileMapping[fieldName] = index;
        formData.append(`file_${index}`, fileObj.file);
      });

      formData.append("fileMapping", JSON.stringify(fileMapping));

      formData.append("fields", JSON.stringify(template.fields));
      formData.append("fileName", template.filename);
      formData.append("templateId", templateId);

      // for (let [key, value] of formData.entries()) {
      //   console.log(`FormData Key: ${key}, Value:`, value);
      // }

      const response = await axios.post(`${API_URL}/templates/generate-docx`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        notify(response.data.message, response.data.status);
        setLoading(false);

        setItem('pdf_preview_id', response.data.inboxId);
        navigate('/pdf-preview');
      }

    } catch (error) {
      console.error(error);
      setErrors({ general: "Error submitting form data" });
      setLoading(false);
    }
  };

  const handleUploadExcel = () => {
    setItem('excel_template_id', templateId);
    navigate('/excel-upload');
  };

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Send Template</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {errors.general && <div className="alert alert-danger">{errors.general}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mt-2">
                  {fields.map((field, index) => (
                    <div key={index} className="form-group mb-1">
                      {field.inputType !== "file" || field.isSignature !== true ? (
                        <label htmlFor={field.name.replace("%", "")}>
                          {field.name.replace(/%/g, "").split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                        </label>
                      ) : null}

                      {field.inputType === "textarea" ? (
                        <textarea className="form-control" id={field.name} name={field.name}
                          value={formData[field.name]} onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      ) : field.inputType === "date" ? (
                        <input type="date" className="form-control" id={field.name} name={field.name}
                          value={formData[field.name]} onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      ) : field.inputType === "file" && field.isSignature !== true ? (
                        <input type="file" className="form-control" id={field.name} accept="image/*"
                          name={field.name} multiple onChange={(e) => handleFileChange(field.name, e)}
                        />
                      ) : field.inputType !== "file" ? (
                        <input type={field.inputType || "text"} className="form-control" id={field.name}
                          name={field.name} value={formData[field.name]}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      ) : null}

                      {errors[field.name] && <div className="text-danger">{errors[field.name]}</div>}
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button type="button" className="btn btn-secondary w-md me-2" onClick={handleCancel} disabled={loading}>Cancel</button>
                  <button type="button" className="btn btn-success w-md me-2" onClick={handleUploadExcel} disabled={loading}>Upload Excel</button>
                  <button type="submit" className="btn btn-primary d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                    {loading && <Spinner />}
                    Generate Document
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SendTemplate;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate, useParams } from 'react-router-dom';
// import config from '../../../utils/helpers/helper';
// import { getToken } from '../../../utils/localStorageHelper';
// import { handleError } from '../../../utils/errorHandling/errorHandler';
// import { CONSTANT } from '../../../utils/constant';
// import { notify } from '../../../utils/notifications/ToastNotification';
// import Spinner from '../Spinner/Spinner';

// const { API_URL } = config;

// const SendTemplate = ({ title }) => {
//   useEffect(() => {
//     document.title = `${title} • ${CONSTANT.AUTH.APP_NAME}`;
//   }, [title]);

//   const navigate = useNavigate();
//   const { templateId } = useParams();
//   const [formData, setFormData] = useState({});
//   const [sendTemplate, setSendTemplate] = useState({})
//   const [template, setTemplate] = useState({
//     name: '',
//     filename: '',
//     description: '',
//     emailTemplate: '',
//     fields: [],
//     isSignature: false,
//     file: null,
//   });
//   const [fields, setFields] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const fetchToken = () => {
//     const token = getToken();
//     if (!token) {
//       setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
//     }
//     return token;
//   };

//   const fetchTemplateData = async () => {
//     const token = fetchToken();
//     if (!token) return;

//     try {
//       const response = await axios.get(`${API_URL}/templates/${templateId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.status === 200) {
//         setTemplate(response.data);
//         console.log("template", response.data, template.isSignature)
//         const sortedFields = response.data.fields.sort((a, b) => {
//           const order = { text: 1, textarea: 2, date: 3, file: 4 };
//           return (order[a.inputType] || 5) - (order[b.inputType] || 5);
//         });
//         setFields(sortedFields);
//       } else {
//         notify(response.data.message, response.data.status);
//         navigate('/template');
//       }
//     } catch (error) {
//       handleError(error);
//     }
//   };

//   useEffect(() => {
//     fetchTemplateData();
//   }, [templateId]);

//   const handleCancel = () => {
//     navigate('/template');
//   };

//   const handleFileChange = (fieldName, e) => {
//     if (errors[fieldName]) {
//       delete errors[fieldName];
//     }
//     const newFile = e.target.files[0];
//     setSendTemplate({ ...sendTemplate, file: newFile });
//     setErrors(errors);
//   };

//   const handleFieldChange = (fieldName, value) => {
//     if (errors[fieldName]) {
//       delete errors[fieldName];
//     }
//     setSendTemplate({
//       ...sendTemplate,
//       [fieldName]: value,
//     });
//     setErrors(errors);
//   };

//   const validateForm = () => {
//     let isValid = true;
//     const validationErrors = {};

//     template.fields.forEach((field) => {
//       if (!sendTemplate[field.name] && !(field.inputType === 'file' && sendTemplate.file)) {
//         validationErrors[field.name] = `${field.name.replace('%', '')} is required`;
//       }
//     });

//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       isValid = false;
//     } else {
//       setErrors({});
//     }

//     if (!isValid) setLoading(false);
//     return isValid;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     if (!validateForm()) return;

//     try {
//       const token = fetchToken();
//       if (!token) return;

//       const formData = new FormData();

//       Object.keys(sendTemplate).forEach((key) => {
//         if (key !== 'file') {
//           formData.append(key, sendTemplate[key]);
//         }
//       });

//       if (sendTemplate.file) {
//         formData.append('file', sendTemplate.file);
//       }
//       formData.append('fields', JSON.stringify(template.fields));
//       formData.append('fileName', template.filename);
//       formData.append('templateId', templateId);

//       formData.forEach((value, key) => {
//         console.log(`FormData Key: ${key}, Value:`, value);
//       });

//       const response = await axios.post(`${API_URL}/templates/generate-docx`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           'Authorization': `Bearer ${token}`,
//         }
//       });

//       console.log("Response Status:", response.status);
//       if (response.status === 200) {
//         notify(response.data.message, response.data.status);
//         setLoading(false);
//         navigate(`/template/pdf-preview/${response.data.inboxId}`);
//       }

//     } catch (error) {
//       console.error(error);
//       setErrors({ general: 'Error submitting form data' });
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="row">
//         <div className="col-12">
//           <div className="page-title-box d-sm-flex align-items-center justify-content-between"></div>
//         </div>
//       </div>

//       <div className="row">
//         <div className="col-12">
//           <div className="card">
//             <div className="card-body">
//               {errors.general && (
//                 <div className="alert alert-danger" id="errorAlert">
//                   <p>{errors.general}</p>
//                 </div>
//               )}

//               <form onSubmit={handleSubmit}>
//                 <div className="mt-2">
//                   {fields.map((field, index) => (
//                     <div key={index} className="form-group mb-1">
//                       {field.inputType !== 'file' || field.isSignature !== false ? (
//                         <label htmlFor={field.name.replace('%', '')}>
//                           {field.name.replace(/%/g, '').split('_').map(word =>
//                             word.charAt(0).toUpperCase() + word.slice(1)
//                           ).join(' ')}
//                         </label>
//                       ) : null}

//                       {field.inputType === 'textarea' ? (
//                         <textarea
//                           className="form-control"
//                           id={field.name}
//                           name={field.name}
//                           value={formData[field.name]}
//                           onChange={(e) => handleFieldChange(field.name, e.target.value)}
//                           placeholder={field.placeholder}
//                         />
//                       ) : field.inputType === 'date' ? (
//                         <input
//                           type="date"
//                           className="form-control"
//                           id={field.name}
//                           name={field.name}
//                           value={formData[field.name]}
//                           onChange={(e) => handleFieldChange(field.name, e.target.value)}
//                           placeholder={field.placeholder}
//                         />
//                       ) : field.inputType === 'file' && field.isSignature !== false ? ( // ✅ Only show if isSignature is NOT false
//                         <input
//                           type="file"
//                           className="form-control"
//                           id={field.name}
//                           accept=".png"
//                           name={field.name}
//                           onChange={(e) => handleFileChange(field.name, e)}
//                         />
//                       ) : field.inputType !== 'file' ? ( // ✅ Don't show text input for "file" type
//                         <input
//                           type={field.inputType || 'text'}
//                           className="form-control"
//                           id={field.name}
//                           name={field.name}
//                           value={formData[field.name]}
//                           onChange={(e) => handleFieldChange(field.name, e.target.value)}
//                           placeholder={field.placeholder}
//                         />
//                       ) : null} {/* ✅ If it's a file but isSignature is false, render nothing */}


//                       {errors[field.name] && (
//                         <div className="text-danger">{errors[field.name]}</div>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 <div className="d-flex justify-content-end mt-3">
//                   <button
//                     type="button"
//                     className="btn btn-secondary w-md mx-2"
//                     onClick={handleCancel}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     type="submit"
//                     className="btn btn-primary submit-btn"
//                     disabled={loading}
//                   >
//                     <div className="btn-load">
//                       {loading && <Spinner />}
//                       Generate Document
//                     </div>
//                   </button>
//                 </div>

//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default SendTemplate;

// // Replacement
// // // {fields.map((field, index) => (
// // //   (field.inputType !== 'file' || field.isSignature !== false) && ( // ✅ Hide label too when file input is hidden
// // //     <div key={index} className="form-group mb-1">
// // //       {/* ✅ Show label only if the input is visible */}
// // //       {field.inputType !== 'file' || field.isSignature !== false ? (
// // //         <label htmlFor={field.name.replace('%', '')}>
// // //           {field.name.replace(/%/g, '').split('_').map(word =>
// // //             word.charAt(0).toUpperCase() + word.slice(1)
// // //           ).join(' ')}
// // //         </label>
// // //       ) : null}

// // //       {console.log(JSON.stringify(fields))}

// // //       {/* Input Fields */}
// // //       {field.inputType === 'textarea' ? (
// // //         <textarea
// // //           className="form-control"
// // //           id={field.name}
// // //           name={field.name}
// // //           value={formData[field.name] || ''}
// // //           onChange={(e) => handleFieldChange(field.name, e.target.value)}
// // //           placeholder={field.placeholder}
// // //         />
// // //       ) : field.inputType === 'date' ? (
// // //         <input
// // //           type="date"
// // //           className="form-control"
// // //           id={field.name}
// // //           name={field.name}
// // //           value={formData[field.name] || ''}
// // //           onChange={(e) => handleFieldChange(field.name, e.target.value)}
// // //           placeholder={field.placeholder}
// // //         />
// // //       ) : field.inputType === 'file' ? (
// // //         <input
// // //           type="file"
// // //           className="form-control"
// // //           id={field.name}
// // //           accept=".png"
// // //           name={field.name}
// // //           onChange={(e) => handleFileChange(field.name, e)}
// // //         />
// // //       ) : (
// // //         <input
// // //           type={field.inputType || 'text'}
// // //           className="form-control"
// // //           id={field.name}
// // //           name={field.name}
// // //           value={formData[field.name] || ''}
// // //           onChange={(e) => handleFieldChange(field.name, e.target.value)}
// // //           placeholder={field.placeholder}
// // //         />
// // //       )}

// // //       {/* Error Message */}
// // //       {errors[field.name] && (
// // //         <div className="text-danger">{errors[field.name]}</div>
// // //       )}
// // //     </div>
// // //   )
// // // ))}
