import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import config from "../../../utils/helpers/helper";
import Spinner from "../../Spinner/Spinner";
import { handleError } from "../../../utils/errorHandling/errorHandler";
import { getItem, getToken, setItem } from "../../../utils/localStorageHelper";
import { CONSTANT } from "../../../utils/constant";

const { API_URL } = config;

const PDFPreviewPage = () => {
  const navigate = useNavigate();
  const inboxId = getItem('pdf_preview_id');
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: CONSTANT.AUTH.AUTH_REQUIRED,
      }));
    }
    return token;
  };

  useEffect(() => {
    const fetchPdfUrl = async () => {
      const token = fetchToken();
      if (!token || !inboxId) return;

      try {
        const response = await axios.get(`${API_URL}/inbox/${inboxId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const documentLink = response.data.inbox?.documentLink;
        if (documentLink) {
          setPdfUrl(documentLink);
        }
      } catch (error) {
        handleError(error);
        setErrors((prevErrors) => ({
          ...prevErrors,
          general: "Failed to load PDF. Please try again.",
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchPdfUrl();
  }, [inboxId]);

  const handleSend = () => {
    setItem('send_inbox_id', inboxId);
    navigate('/send');
  };

  return (
    <div className="container">
      <div className="page-title-box d-sm-flex align-items-center justify-content-between">
        <h4 className="mb-sm-0 font-size-18">PDF Preview</h4>
      </div>

      <div className="card">
        <div className="card-body">
          {errors.general && <div className="text-danger">{errors.general}</div>}

          {loading ? (
            <Spinner className="dark" />
          ) : pdfUrl ? (
            <embed src={pdfUrl} type="application/pdf" width="100%" height="600px" />
          ) : (
            <p className="text-muted">No PDF available.</p>
          )}

          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-primary" onClick={handleSend} disabled={!pdfUrl}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewPage;
