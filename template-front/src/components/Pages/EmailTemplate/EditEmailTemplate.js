import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import config from '../../../utils/helpers/helper';
import { getItem, getToken } from '../../../utils/localStorageHelper';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import { notify } from '../../../utils/notifications/ToastNotification';
import { CONSTANT } from '../../../utils/constant';
import Spinner from '../../Spinner/Spinner';
import Title from '../Title';

const { API_URL, EDITOR_KEY } = config;

const EditEmailTemplate = ({ title }) => {
  const id = getItem('edit_email_template_id');
  const navigate = useNavigate();

  const [emailTemplate, setEmailTemplate] = useState({
    template_name: '',
    subject: '',
    body: '',
  });

  const [errors, setErrors] = useState({
    template_name: '',
    subject: '',
    body: '',
  });

  const [loading, setLoading] = useState(true);

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  useEffect(() => {
    const fetchEmailTemplate = async () => {
      try {
        const token = fetchToken();
        if (!token) return;

        const response = await axios.get(`${API_URL}/email-template/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        if (response.status === 200) {
          setEmailTemplate(response.data);
        }
      } catch (error) {
        handleError(error);
      }
    };

    fetchEmailTemplate();
  }, [id]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(newErrors).forEach((key) => (newErrors[key] = ''));

    if (!emailTemplate.template_name) {
      newErrors.template_name = 'Template name is required!';
      isValid = false;
    }

    if (!emailTemplate.subject) {
      newErrors.subject = 'Subject is required!';
      isValid = false;
    }

    if (!emailTemplate.body) {
      newErrors.body = 'Body content is required!';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm())
      return;

    try {
      const token = getToken();

      if (!token) {
        setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
        return;
      }

      const response = await axios.put(`${API_URL}/email-template/${id}`, emailTemplate, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const { status, message } = response.data;
        notify(message, status);
        navigate('/email-template');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailTemplate({ ...emailTemplate, [name]: value });
  };

  const handleCancel = () => {
    navigate('/email-template');
  };

  const removeNotificationContainer = () => {
    const interval = setTimeout(() => {
      const notificationContainer = document.querySelector('.tox-notifications-container');
      if (notificationContainer) {
        notificationContainer.remove();
        clearInterval(interval);
      }
    }, 1);
  };

  const onEditorLoad = () => {
    removeNotificationContainer();
    setLoading(false);
  }

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Edit Email Template</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="template_name" className="col-form-label">Template Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="template_name"
                      name="template_name"
                      value={emailTemplate.template_name}
                      onChange={handleChange}
                    />
                    {errors.template_name && <div className="text-danger">{errors.template_name}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="subject" className="col-form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      id="subject"
                      name="subject"
                      value={emailTemplate.subject}
                      onChange={handleChange}
                    />
                    {errors.subject && <div className="text-danger">{errors.subject}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-12">
                    <label htmlFor="body" className="col-form-label">Body</label>
                    <div className="editor-wrapper position-relative">
                      {loading && (
                        <div className="spinner-overlay d-flex justify-content-center align-items-center">
                          <Spinner className="dark" />
                        </div>
                      )}
                      <Editor
                        apiKey={EDITOR_KEY}
                        init={{
                          plugins: [
                            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                            'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
                          ],
                          toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                          tinycomments_mode: 'embedded',
                          tinycomments_author: 'Author name',
                          mergetags_list: [
                            { value: 'First.Name', title: 'First Name' },
                            { value: 'Email', title: 'Email' },
                          ],
                        }}
                        value={emailTemplate.body}
                        onEditorChange={(content) => setEmailTemplate({ ...emailTemplate, body: content })}
                        onInit={onEditorLoad}
                      />
                    </div>
                    {errors.body && <div className="text-danger">{errors.body}</div>}
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-2">
                  <button
                    type="button"
                    className="btn btn-secondary w-md mx-2"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success w-md">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditEmailTemplate;
