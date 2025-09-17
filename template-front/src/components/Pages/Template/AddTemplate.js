import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import React, { use, useEffect, useState } from 'react';
import { getToken } from '../../../utils/localStorageHelper';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import { notify } from '../../../utils/notifications/ToastNotification';
import config from '../../../utils/helpers/helper';
import { CONSTANT } from '../../../utils/constant';
import Spinner from '../../Spinner/Spinner';
import Title from '../Title';

const { API_URL } = config;

const AddTemplate = ({ title }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    companyId: '',
    filename: '',
    oldFile: '',
    emailTemplate: '',
    isSignature: false,
    file: null,
  });

  const [extractedVariables, setExtractedVariables] = useState([]);
  const [currentSection, setCurrentSection] = useState(1);
  const [isFirstSectionComplete, setIsFirstSectionComplete] = useState(false);
  const [isSecondSectionComplete, setIsSecondSectionComplete] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [errors, setErrors] = useState({});
  const [emailTemplate, setEmailTemplate] = useState({});

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  useEffect(() => {
    const fetchEmailTemplates = async () => {
      const token = fetchToken();
      if (!token) return;

      try {
        const response = await axios.get(`${API_URL}/email-template`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setEmailTemplate(response.data.emailTemplates);
        }
      } catch (error) {
        handleError(error);
      }
    };

    fetchEmailTemplates();
  }, []);

  const validateUploadTemplate = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(newErrors).forEach((key) => (newErrors[key] = ''));

    if (!newTemplate.name) {
      newErrors.name = 'name is required!';
      isValid = false;
    }
    if (!newTemplate.description) {
      newErrors.description = 'description is required!';
      isValid = false;
    }
    if (!newTemplate.emailTemplate) {
      newErrors.emailTemplate = 'email template is required!';
      isValid = false;
    }
    if (!newTemplate.file) {
      newErrors.file = 'file is required!';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) setLoading(false);
    return isValid;
  };

  const handleUploadTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateUploadTemplate()) return;

    const formData = new FormData();
    formData.append("name", newTemplate.name);
    formData.append("description", newTemplate.description);
    formData.append("emailTemplate", newTemplate.emailTemplate);
    formData.append("isSignature", newTemplate.isSignature);
    formData.append("oldFilename", newTemplate.filename);

    setNewTemplate({ ...newTemplate, oldFile: newTemplate.filename });

    if (newTemplate.file) {
      formData.append("file", newTemplate.file);
    }

    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.post(`${API_URL}/templates/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 200) {
        const { extractedVariables, data } = response.data;
        // Sort extractedVariables based on inputType (like you did for fields)
        const sortedExtractedVariables = extractedVariables.sort((a, b) => {
          const order = { text: 1, textarea: 2, date: 3, file: 4 };
          return (order[a.inputType] || 5) - (order[b.inputType] || 5);
        });

        // Update the extracted variables state with sorted values
        setExtractedVariables(
          sortedExtractedVariables.map((variable) => ({
            name: variable,
            placeholder: '',
            inputType: '',
          }))
        );
        // console.log("newTemplate", newTemplate, data, data.oldFile, data.filename)
        setNewTemplate((prevTemplate) => ({
          ...prevTemplate,
          ...data,
          // filename: data.filename,
          // oldFile: data.oldFile,
        }));

        console.log(newTemplate);

        // Send Notification 
        const { status, message } = response.data;
        notify(message, status);

        // Other Code
        setIsFirstSectionComplete(true);
        setLoading(false);
        setCurrentSection(2);
      }
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  };

  const validateFinalSave = () => {
    let isValid = true;
    const newErrors = { ...validationErrors };

    Object.keys(newErrors).forEach((key) => (newErrors[key] = ''));
    extractedVariables.forEach((variable, index) => {
      if (!variable.inputType) {
        newErrors[`inputType-${index}`] = 'Input type is required';
        isValid = false;
      }
    });

    setValidationErrors(newErrors);
    if (!isValid) setLoading(false);
    return isValid;
  };

  const handleVariableChange = (index, field, value) => {
    const updatedVariables = [...extractedVariables];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    setExtractedVariables(updatedVariables);

    if (field === "inputType") {
      updatedVariables[index].isSignature = value === "file" ? (updatedVariables[index].isSignature || false) : undefined;

      const newErrors = { ...validationErrors };
      if (!value) {
        newErrors[`inputType-${index}`] = 'Input type is required';
      } else {
        delete newErrors[`inputType-${index}`];
      }
      setValidationErrors(newErrors);
    }

    setExtractedVariables(updatedVariables);
  };

  const handleFileChange = (e) => {
    setNewTemplate({ ...newTemplate, file: e.target.files[0] });
    setIsFirstSectionComplete(false);
    setCurrentSection(1);
    setExtractedVariables([]);
  };

  useEffect(() => {
    console.log("extractedVariables", extractedVariables)
  }, [extractedVariables])

  const handleFinalSave = async () => {
    setLoading(true);
    if (!validateFinalSave()) return;

    const finalData = {
      ...newTemplate,
      name: newTemplate.name,
      description: newTemplate.description,
      emailTemplate: newTemplate.emailTemplate,
      isSignature: newTemplate.isSignature,
      filename: newTemplate.filename,
      companyId: newTemplate.companyId,
      fields: extractedVariables.map((variable) => ({
        name: variable.name,
        placeholder: variable.placeholder,
        inputType: variable.inputType,
        isSignature: variable?.isSignature,
      })),
    };

    console.log("finalData", finalData)

    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.post(`${API_URL}/templates/finalsave`, finalData, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      });

      if (response.status === 201) {
        const { status, message } = response.data;
        setTimeout(() => {
          setLoading(false);
          notify(message, status);
          navigate('/template');
        }, 500);
      }
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  };

  const nextSection = () => {
    if (currentSection === 1 && isFirstSectionComplete) setCurrentSection(2);
    if (currentSection === 2 && isSecondSectionComplete) setCurrentSection(3);
  };

  const prevSection = () => {
    if (currentSection > 1) setCurrentSection(currentSection - 1);
  };

  useEffect(() => {

    const handleBeforeUnload = (e) => {
      if (!isSecondSectionComplete) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSecondSectionComplete]);

  const handleCancelTemplate = async (e) => {
    e.preventDefault();

    if (!newTemplate.file) {
      navigate("/template");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "This will cancel the process and delete the uploaded file.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = fetchToken();
          if (!token) return;

          const response = await axios.delete(
            `${API_URL}/templates/cancelProcess/${newTemplate.filename}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.status === 200) {
            const { status, message } = response.data;
            notify(message, status);
            navigate("/template");
          }
        } catch (error) {
          handleError(error);
        }
      }
    });
  };

  return (
    <>
    <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Add Template</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div id="basic-example">
                {errors.general && <div className="alert alert-danger">{errors.general}</div>}
                {currentSection === 1 && (
                  <>
                    <form onSubmit={handleUploadTemplate}>
                      <div className="row mb-3">
                        <label htmlFor="templateName" className="col-md-2 col-form-label">Template Name</label>
                        <div className="col-md-10">
                          <input
                            type="text"
                            className="form-control"
                            id="templateName"
                            value={newTemplate.name}
                            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                          />
                          {errors.name && <div className="text-danger">{errors.name}</div>}
                        </div>
                      </div>

                      <div className="row mb-3">
                        <label htmlFor="templateDescription" className="col-md-2 col-form-label">Description</label>
                        <div className="col-md-10">
                          <textarea
                            className="form-control"
                            id="templateDescription"
                            value={newTemplate.description}
                            onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                          ></textarea>
                          {errors.description && <div className="text-danger">{errors.description}</div>}
                        </div>
                      </div>

                      <div className="row mb-3">
                        <label htmlFor="emailTemplate" className="col-md-2 col-form-label">Email Template</label>
                        <div className="col-md-10">
                          <select
                            className="form-select"
                            id="emailTemplate"
                            value={newTemplate.emailTemplate}
                            onChange={(e) => setNewTemplate({ ...newTemplate, emailTemplate: e.target.value })}
                          >
                            <option value="">Select Template</option>
                            {Array.isArray(emailTemplate) && emailTemplate.length > 0 ? (
                              emailTemplate.map((template) => (
                                <option key={template._id} value={template._id}>
                                  {template.template_name}
                                </option>
                              ))
                            ) : (
                              <option>No templates available</option>
                            )}
                          </select>
                          {errors.emailTemplate && <div className="text-danger">{errors.emailTemplate}</div>}
                        </div>
                      </div>

                      <div className="row mb-3">
                        <label className="col-md-2 col-form-label">Signature</label>
                        <div className="col-md-10">
                          <div className="form-check form-switch form-switch-lg mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="flexSwitchCheckDefault"
                              checked={newTemplate.isSignature}
                              onChange={(e) => setNewTemplate({ ...newTemplate, isSignature: e.target.checked })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <label htmlFor="fileUpload" className="col-md-2 col-form-label">Upload File</label>
                        <div className="col-md-10">
                          <input
                            type="file"
                            className="form-control"
                            id="fileUpload"
                            accept=".docx"
                            onChange={handleFileChange}
                          />
                          {errors.file && <div className="text-danger">{errors.file}</div>}
                        </div>
                      </div>
                    </form>
                  </>
                )}

                {currentSection === 2 && (
                  <>
                    <form>
                      {extractedVariables.length > 0 && (
                        <table className="table table-bordered">
                          <thead className="table-secondary">
                            <tr>
                              <th>Variable</th>
                              <th>Placeholder</th>
                              <th>Input Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {extractedVariables.map((variable, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    type="text"
                                    readOnly
                                    className="form-control mt-2"
                                    value={`${variable.name.replace(/%/g, '')}`}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control mt-2"
                                    placeholder="Enter placeholder here.."
                                    value={variable.placeholder}
                                    onChange={(e) => handleVariableChange(index, 'placeholder', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <select
                                    className="form-control mt-2"
                                    value={variable.inputType}
                                    onChange={(e) => handleVariableChange(index, 'inputType', e.target.value)}
                                  >
                                    <option value="" disabled>Select input type</option>
                                    <option value="text">Textbox</option>
                                    <option value="textarea">Textarea</option>
                                    <option value="date">Date</option>
                                    <option value="file">File</option>
                                  </select>
                                  {variable.inputType === "file" && newTemplate.isSignature && ( // ✅ Hide checkbox if newTemplate.isSignature is true
                                    <div className="form-check mt-2">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`isSignature-${index}`}
                                        checked={variable.isSignature || false}
                                        onChange={(e) => handleVariableChange(index, 'isSignature', e.target.checked)}
                                      />
                                      <label className="form-check-label ms-2" htmlFor={`isSignature-${index}`}>
                                        Make this Signature
                                      </label>
                                    </div>
                                  )}

                                  {validationErrors[`inputType-${index}`] && (
                                    <div className="text-danger mt-2">
                                      {validationErrors[`inputType-${index}`]}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                    </form>
                  </>
                )}

                <div className="d-flex justify-content-end mt-2">
                  {currentSection === 1 && (
                    <>
                      <button type="button" className="btn btn-danger me-1" onClick={handleCancelTemplate}>Cancel</button>
                      {!isFirstSectionComplete &&
                        <button className="btn btn-primary" onClick={handleUploadTemplate} disabled={loading}>
                          <div className={`btn-load`}>
                            {loading && <Spinner />}
                            Save
                          </div>
                        </button>
                      }
                      {isFirstSectionComplete &&
                        <button className="btn btn-primary" onClick={nextSection}>Next</button>
                      }
                    </>
                  )}
                  {currentSection === 2 && (
                    <>
                      <button type="button" className="btn btn-danger me-1" onClick={handleCancelTemplate}>Cancel</button>
                      <button type="button" className="btn btn-secondary me-1" onClick={prevSection}>Previous</button>
                      <button className="btn btn-primary" onClick={handleFinalSave} disabled={loading}>
                        <div className={`btn-load`}>
                          {loading && <Spinner />}
                          Create
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTemplate;
