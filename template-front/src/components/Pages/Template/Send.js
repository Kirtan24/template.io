import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../../utils/helpers/helper";
import { useNavigate } from "react-router-dom";
import { getItem, getToken, removeItem } from "../../../utils/localStorageHelper";
import { CONSTANT } from "../../../utils/constant";
import { Editor } from "@tinymce/tinymce-react";
import { handleError } from "../../../utils/errorHandling/errorHandler";
import { notify } from "../../../utils/notifications/ToastNotification";
import Spinner from "../../Spinner/Spinner";
import { hasPermission } from "../../../utils/helpers/permissionCheck";
import Title from "../Title";

const { API_URL } = config;

function SendEmail({ title }) {
  const inboxId = getItem('send_inbox_id');
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderEmail, setSenderEmail] = useState();
  const [inbox, setInbox] = useState({});
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setValidationErrors({ general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  const removeNotificationContainer = () => {
    const interval = setTimeout(() => {
      const notificationContainer = document.querySelector('.tox-notifications-container');
      if (notificationContainer) {
        notificationContainer.remove();
        clearInterval(interval);
      }
    }, 500);
  };

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const token = fetchToken();
        if (!token || !inboxId) return;

        const response = await axios.get(`${API_URL}/inbox/${inboxId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const inboxData = response.data.inbox;
          setInbox(inboxData);

          if (inboxData.documentTemplateId) {
            setPdfBlobUrl(inboxData.documentLink);
          }

          if (inboxData.emailTemplateId) {
            setEmailSubject(inboxData.emailTemplateId.subject);
            setEmailBody(inboxData.emailTemplateId.body);
          }
        }
      } catch (error) {
        handleError(error);
      }
    };

    fetchInbox();
    removeNotificationContainer();
  }, [inboxId]);

  const validateForm = () => {
    const errors = {};
    if (!senderEmail) errors.senderEmail = "Sender email is required";
    if (!recipientEmail) errors.recipientEmail = "Recipient email is required";
    if (!emailSubject) errors.emailSubject = "Subject is required";
    if (!emailBody) errors.emailBody = "Body is required";

    setValidationErrors(errors);
    console.log(errors)
    return Object.keys(errors).length === 0;
  };

  const handleEmailAction = async (e, type) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const emailData = {
        inboxId,
        templateId: inbox.emailTemplateId?.id,
        attachmentPath: inbox.documentLink,
        pdfFileName: inbox.documentTemplateId,
        subject: emailSubject,
        body: emailBody,
        senderEmail: senderEmail,
        recipientEmail: recipientEmail,
      };

      if (type === "schedule" && scheduledTime) {
        emailData.scheduledTime = scheduledTime;
      }

      const token = fetchToken();
      if (!token) return;

      const endpoint = type === "schedule" ? "/inbox/scheduleMail" : "/inbox/send";

      const response = await axios.post(`${API_URL}${endpoint}`, emailData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        notify(response.data.message, response.data.status);
        setLoading(false);
        navigate("/inbox");
      }
    } catch (error) {
      handleError(error);
    } finally {
      removeItem('send_inbox_id');
      setLoading(false);
    }
  };

  const handleSendClick = (e) => {
    handleEmailAction(e, "send");
  };

  const handleScheduleButtonClick = (e) => {
    setShowModal(true);
  };

  const handleScheduleCancel = (e) => {
    setShowModal(false);
  };

  const handleScheduleSendClick = () => {
    setScheduleLoading(true);

    setTimeout(() => {
      setScheduleLoading(false);
      setShowModal(false);

      handleEmailAction(null, "schedule");
    }, 2000);
  };

  return (
    <>
    <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Send Email</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-1">
                      <label htmlFor="senderEmail" className="col-form-label">From:</label>
                      <input
                        type="email"
                        id="senderEmail"
                        value={senderEmail}
                        className="form-control"
                        onChange={(e) => setSenderEmail(e.target.value)}
                        required
                      />
                      {validationErrors.senderEmail && <div className="text-danger">{validationErrors.senderEmail}</div>}
                    </div>

                    <div className="form-group mb-1">
                      <label htmlFor="recipientEmail" className="col-form-label">To:</label>
                      <input
                        type="email"
                        id="recipientEmail"
                        value={recipientEmail}
                        className="form-control"
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        required
                      />
                      {validationErrors.recipientEmail && <div className="text-danger">{validationErrors.recipientEmail}</div>}
                    </div>

                    <div className="form-group mb-1">
                      <label htmlFor="emailSubject" className="col-form-label">Subject:</label>
                      <input
                        id="emailSubject"
                        value={emailSubject}
                        className="form-control"
                        onChange={(e) => setEmailSubject(e.target.value)}
                        rows="4"
                        required
                      />
                      {validationErrors.emailSubject && <div className="text-danger">{validationErrors.emailSubject}</div>}
                    </div>

                    <div className="form-group mb-1">
                      <label htmlFor="emailBody" className="col-form-label">Body:</label>
                      <Editor
                        apiKey="edwk8cnjbawvx87xz8btb6wa5qn53bya20dw4nwagswq9a6z"
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
                        name="body"
                        value={emailBody}
                        onEditorChange={(content) => setEmailBody(content)}
                        onInit={removeNotificationContainer}
                      />
                      {validationErrors.emailBody && <div className="text-danger">{validationErrors.emailBody}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    {pdfBlobUrl ? (
                      <embed src={pdfBlobUrl} type="application/pdf" width="100%" height="600px" />
                    ) : (
                      <Spinner className="dark" />
                    )}

                    <div className="d-flex justify-content-end1 flex-row-reverse mt-2">
                      <button className="btn btn-success d-flex align-items-center justify-content-center gap-2 ms-2" onClick={handleSendClick} disabled={loading}>
                        {loading && <Spinner />} Send
                      </button>
                      {hasPermission('schedule_template') && (
                        <button type="button" className="btn btn-primary" onClick={handleScheduleButtonClick} disabled={loading}>
                          Schedule Email
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {showModal && (
          <div style={{
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1040,
          }}>
            <div className="modal" tabindex="-1" style={{
              display: 'block',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1050,
            }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Select Scheduled Time</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={scheduledTime || ""}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleScheduleCancel} disabled={scheduleLoading}>Cancel</button>
                    <button type="button" className="btn btn-primary d-flex align-items-center justify-content-center gap-2" onClick={handleScheduleSendClick} disabled={scheduleLoading}>
                      {scheduleLoading ? (
                        <>
                          <Spinner />
                          Scheduling...
                        </>
                      ) : 'Schedule'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default SendEmail;

























// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import config from "../../../utils/helpers/helper";
// import { useNavigate, useParams } from "react-router-dom";
// import { getToken } from "../../../utils/localStorageHelper";
// import { CONSTANT } from "../../../utils/constant";
// import { Editor } from "@tinymce/tinymce-react";
// import { handleError } from "../../../utils/errorHandling/errorHandler";
// import { notify } from "../../../utils/notifications/ToastNotification";
// import Spinner from "../Spinner/Spinner";

// const { API_URL } = config;

// function SendEmail() {
//   const { inboxId } = useParams();
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailBody, setEmailBody] = useState("");
//   const [recipientEmail, setRecipientEmail] = useState("");
//   const [senderEmail, setSenderEmail] = useState("");
//   const [inbox, setInbox] = useState({});
//   const [pdfBlobUrl, setPdfBlobUrl] = useState("");
//   const [validationErrors, setValidationErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [scheduledTime, setScheduledTime] = useState(null);
//   const navigate = useNavigate();

//   const fetchToken = () => {
//     const token = getToken();
//     if (!token) {
//       setValidationErrors({ general: CONSTANT.AUTH.AUTH_REQUIRED });
//     }
//     return token;
//   };

//   const removeNotificationContainer = () => {
//     const interval = setTimeout(() => {
//       const notificationContainer = document.querySelector('.tox-notifications-container');
//       if (notificationContainer) {
//         notificationContainer.remove();
//         clearInterval(interval);
//       }
//     }, 500);
//   };

//   useEffect(() => {
//     const fetchInbox = async () => {
//       try {
//         const token = fetchToken();
//         if (!token || !inboxId) return;

//         const response = await axios.get(`${API_URL}/inbox/${inboxId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (response.status === 200) {
//           const inboxData = response.data.inbox;
//           setInbox(inboxData);

//           if (inboxData.documentTemplateId) {
//             setPdfBlobUrl(inboxData.documentLink);
//           }

//           if (inboxData.emailTemplateId) {
//             setEmailSubject(inboxData.emailTemplateId.subject);
//             setEmailBody(inboxData.emailTemplateId.body);
//           }
//         }
//       } catch (error) {
//         handleError(error);
//       }
//     };

//     fetchInbox();
//     removeNotificationContainer();
//   }, [inboxId]);

//   const validateForm = () => {
//     const errors = {};
//     if (!senderEmail) errors.senderEmail = "Sender email is required";
//     if (!recipientEmail) errors.recipientEmail = "Recipient email is required";
//     if (!emailSubject) errors.emailSubject = "Subject is required";
//     if (!emailBody) errors.emailBody = "Body is required";

//     setValidationErrors(errors);
//     console.log(errors)
//     return Object.keys(errors).length === 0;
//   };

//   const handleEmailAction = async (e, type) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setLoading(true);

//     try {
//       const emailData = {
//         inboxId,
//         templateId: inbox.emailTemplateId?.id,
//         attachmentPath: inbox.documentLink,
//         pdfFileName: inbox.documentTemplateId,
//         subject: emailSubject,
//         body: emailBody,
//         senderEmail: senderEmail,
//         recipientEmail: recipientEmail,
//       };

//       // If scheduling, add scheduledTime
//       if (type === "schedule" && scheduledTime) {
//         emailData.scheduledTime = scheduledTime;
//       }

//       const token = fetchToken();
//       if (!token) return;

//       const endpoint = type === "schedule" ? "/inbox/scheduleMail" : "/inbox/send";

//       const response = await axios.post(`${API_URL}${endpoint}`, emailData, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.data.status === "success") {
//         notify(response.data.message, response.data.status);
//         setLoading(false);
//         navigate("/inbox");
//       }
//     } catch (error) {
//       handleError(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="row">
//       <div className="col-12">
//         <div className="page-title-box d-sm-flex align-items-center justify-content-between">
//           <h4 className="mb-sm-0 font-size-18">Send Email</h4>
//         </div>
//       </div>

//       <div className="col-12">
//         <div className="card">
//           <div className="card-body">
//             <form>
//               <div className="row">
//                 <div className="col-md-6">
//                   <div className="form-group mb-1">
//                     <label htmlFor="senderEmail" className="col-form-label">From:</label>
//                     <input
//                       type="email"
//                       id="senderEmail"
//                       value={senderEmail}
//                       className="form-control"
//                       onChange={(e) => setSenderEmail(e.target.value)}
//                       required
//                     />
//                     {validationErrors.senderEmail && <div className="text-danger">{validationErrors.senderEmail}</div>}
//                   </div>

//                   <div className="form-group mb-1">
//                     <label htmlFor="recipientEmail" className="col-form-label">To:</label>
//                     <input
//                       type="email"
//                       id="recipientEmail"
//                       value={recipientEmail}
//                       className="form-control"
//                       onChange={(e) => setRecipientEmail(e.target.value)}
//                       required
//                     />
//                     {validationErrors.recipientEmail && <div className="text-danger">{validationErrors.recipientEmail}</div>}
//                   </div>

//                   <div className="form-group mb-1">
//                     <label htmlFor="emailSubject" className="col-form-label">Subject:</label>
//                     <input
//                       id="emailSubject"
//                       value={emailSubject}
//                       className="form-control"
//                       onChange={(e) => setEmailSubject(e.target.value)}
//                       rows="4"
//                       required
//                     />
//                     {validationErrors.emailSubject && <div className="text-danger">{validationErrors.emailSubject}</div>}
//                   </div>

//                   <div className="form-group mb-1">
//                     <label htmlFor="emailBody" className="col-form-label">Body:</label>
//                     <Editor
//                       apiKey="edwk8cnjbawvx87xz8btb6wa5qn53bya20dw4nwagswq9a6z"
//                       init={{
//                         plugins: [
//                           'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
//                           'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
//                         ],
//                         toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
//                         tinycomments_mode: 'embedded',
//                         tinycomments_author: 'Author name',
//                         mergetags_list: [
//                           { value: 'First.Name', title: 'First Name' },
//                           { value: 'Email', title: 'Email' },
//                         ],
//                       }}
//                       name="body"
//                       value={emailBody}
//                       onEditorChange={(content) => setEmailBody(content)}
//                       onInit={removeNotificationContainer}
//                     />
//                     {validationErrors.emailBody && <div className="text-danger">{validationErrors.emailBody}</div>}
//                   </div>

//                   {/* Date & Time Picker */}
//                   <div className="form-group mb-1">
//                     <label htmlFor="scheduledTime" className="col-form-label">Schedule Email (Optional):</label>
//                     <input
//                       type="datetime-local"
//                       id="scheduledTime"
//                       className="form-control"
//                       value={scheduledTime || ""}
//                       onChange={(e) => setScheduledTime(e.target.value)}
//                       min={new Date().toISOString().slice(0, 16)} // Ensures past dates are not selectable
//                     />
//                   </div>


//                 </div>

//                 <div className="col-md-6">
//                   {pdfBlobUrl ? (
//                     <embed src={pdfBlobUrl} type="application/pdf" width="100%" height="600px" />
//                   ) : (
//                     <p>Loading PDF...</p>
//                   )}

//                   <div className="d-flex justify-content-end1 flex-row-reverse mt-2">
//                     <button className="btn btn-success ms-2" onClick={(e) => handleEmailAction(e, "send")} disabled={loading}>
//                       {loading && <Spinner />} Send
//                     </button>
//                     <button className="btn btn-primary" onClick={(e) => handleEmailAction(e, "schedule")} disabled={loading}>
//                       {loading && <Spinner />} Schedule Mail
//                     </button>
//                   </div>

//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SendEmail;











// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios"; // Import axios
// import config from "../../../utils/helpers/helper";
// import { getToken } from "../../../utils/localStorageHelper";
// import { CONSTANT } from "../../../utils/constant";
// import { Editor } from "@tinymce/tinymce-react"; // Import TinyMCE Editor

// const { API_URL } = config;

// function SendEmail() {
//   const { templateId, asset_id } = useParams();
//   const [templateDetails, setTemplateDetails] = useState(null);
//   const [emailTemplateDetails, setEmailTemplateDetails] = useState(null);
//   const [recipientEmail, setRecipientEmail] = useState("");
//   const [senderEmail, setSenderEmail] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   const [validationErrors, setValidationErrors] = useState({});
//   const [emailSubject, setEmailSubject] = useState(""); // Subject
//   const [emailBody, setEmailBody] = useState(""); // Body
//   const [pdfUrl, setPdfUrl] = useState("");

//   const fetchAuthToken = () => {
//     const token = getToken();
//     if (!token) {
//       setValidationErrors({ ...validationErrors, general: CONSTANT.AUTH.AUTH_REQUIRED });
//     }
//     return token;
//   };

//   useEffect(() => {
//     if (asset_id) {
//       const backendPdfUrl = `${API_URL}/pdf/${asset_id}`;
//       setPdfUrl(backendPdfUrl);
//     }
//   }, [asset_id]);

//   useEffect(() => {
//     const fetchTemplateDetails = async () => {
//       const token = fetchAuthToken();
//       if (!token) return;

//       try {
//         const response = await axios.get(`${API_URL}/templates/${templateId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (response.status === 200) {
//           setTemplateDetails(response.data.emailTemplate);
//           if (response.data.emailTemplate) {
//             setEmailSubject(response.data.emailTemplate.subject);
//             setEmailBody(response.data.emailTemplate.body);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching template details:", error);
//       }
//     };

//     if (templateId) {
//       fetchTemplateDetails();
//     }
//   }, [templateId]);

//   const handleSendEmail = () => {
//     console.log("Sending email...");
//     console.log("From:", senderEmail);
//     console.log("To:", recipientEmail);
//     console.log("Message:", emailMessage);
//     console.log("Subject:", emailSubject);
//     console.log("Body:", emailBody);

//     alert("Email sent successfully!");
//   };

//   const removeNotificationContainer = () => {
//     const interval = setTimeout(() => {
//       const notificationContainer = document.querySelector('.tox-notifications-container');
//       if (notificationContainer) {
//         notificationContainer.remove();
//         clearInterval(interval);
//       }
//     }, 1);
//   };

//   if (!templateDetails) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <div className="row">
//       <div className="col-12">
//         <div className="page-title-box d-sm-flex align-items-center justify-content-between">
//           <h4 className="mb-sm-0 font-size-18">Send Email</h4>
//         </div>
//       </div>

//       <div className="col-12">
//         <div className="card">
//           <div className="card-body">
//             <form>
//               <div className="row">
//                 <div className="col-md-6"> {/* Use full-width column for the entire form */}
//                   <div className="form-group mb-1">
//                     <label htmlFor="senderEmail" className="col-form-label">From:</label>
//                     <input
//                       type="email"
//                       id="senderEmail"
//                       value={senderEmail}
//                       className="form-control"
//                       onChange={(e) => setSenderEmail(e.target.value)}
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>

//                   <div className="form-group mb-1">
//                     <label htmlFor="recipientEmail" className="col-form-label">To:</label>
//                     <input
//                       type="email"
//                       id="recipientEmail"
//                       value={recipientEmail}
//                       className="form-control"
//                       onChange={(e) => setRecipientEmail(e.target.value)}
//                       placeholder="Recipient's email"
//                       required
//                     />
//                   </div>

//                   <div className="form-group mb-1">
//                     <label htmlFor="emailSubject" className="col-form-label">Subject:</label>
//                     <textarea
//                       id="emailSubject"
//                       value={emailSubject}
//                       className="form-control"
//                       onChange={(e) => setEmailSubject(e.target.value)}
//                       placeholder="Write your subject here"
//                       rows="4"
//                       required
//                     />
//                   </div>
//                   <div className="form-group mb-1">
//                     <label htmlFor="emailBody" className="col-form-label">Body:</label>
//                     <Editor
//                       apiKey="edwk8cnjbawvx87xz8btb6wa5qn53bya20dw4nwagswq9a6z"
//                       init={{
//                         plugins: [
//                           'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
//                           'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
//                         ],
//                         toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
//                         tinycomments_mode: 'embedded',
//                         tinycomments_author: 'Author name',
//                         mergetags_list: [
//                           { value: 'First.Name', title: 'First Name' },
//                           { value: 'Email', title: 'Email' },
//                         ],
//                       }}
//                       name="emailBody"
//                       value={emailBody}
//                       onEditorChange={(content) => setEmailBody(content)}
//                       onInit={removeNotificationContainer}
//                     />
//                   </div>
//                 </div>
//                 <div className="col-md-6">
//                   <embed
//                     src={pdfUrl}
//                     type="application/pdf"
//                     width="100%"
//                     height="600px"
//                   />
//                 <div className="d-flex justify-content-end mt-2">
//                     <button className="btn btn-success mt-3" onClick={handleSendEmail} style={{ marginTop: "10px" }}>
//                       Send
//                     </button>
//                 </div>
//                 </div>
//               </div>

//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SendEmail;
