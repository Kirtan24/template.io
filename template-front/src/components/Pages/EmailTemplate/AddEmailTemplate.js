import { Editor } from '@tinymce/tinymce-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../../utils/helpers/helper';
import axios from 'axios';
import { getToken } from '../../../utils/localStorageHelper';
import { handleError } from '../../../utils/errorHandling/errorHandler';
import { notify } from '../../../utils/notifications/ToastNotification';
import { CONSTANT } from '../../../utils/constant';
import Title from '../Title';
import Spinner from '../../Spinner/Spinner';

const { API_URL, EDITOR_KEY } = config;

const AddEmailTemplate = ({ title }) => {
  const navigate = useNavigate();
  const [newEmailTemplate, setNewEmailTemplate] = useState({
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

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(newErrors).forEach((key) => (newErrors[key] = ''));

    if (!newEmailTemplate.template_name) {
      newErrors.template_name = 'Template name is required!';
      isValid = false;
    }

    if (!newEmailTemplate.subject) {
      newErrors.subject = 'Subject is required!';
      isValid = false;
    }

    if (!newEmailTemplate.body) {
      newErrors.body = 'Body content is required!';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const token = fetchToken();
      if (!token) return;

      const response = await axios.post(`${API_URL}/email-template`, newEmailTemplate, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
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
    setNewEmailTemplate({ ...newEmailTemplate, [name]: value });
  };

  const handleCancel = () => {
    setNewEmailTemplate({
      template_name: '',
      subject: '',
      body: '',
    });
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
            <h4 className="mb-sm-0 font-size-18">Add Email Template</h4>
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
                      value={newEmailTemplate.template_name}
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
                      value={newEmailTemplate.subject}
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
                        value={newEmailTemplate.body}
                        onEditorChange={(content) => setNewEmailTemplate({ ...newEmailTemplate, body: content })}
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
                  <button type="submit" className="btn btn-success w-md">Save Email Template</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddEmailTemplate;
