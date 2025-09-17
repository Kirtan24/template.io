import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../utils/helpers/helper";
import { getItem, getToken } from "../../../utils/localStorageHelper";
import { handleError } from "../../../utils/errorHandling/errorHandler";
import { CONSTANT } from "../../../utils/constant";
import Spinner from "../../Spinner/Spinner";
import Title from "../Title";

const { API_URL } = config;

const ViewCompany = ({ title }) => {
  const id = getItem('company_profile_data');
  const [company, setCompany] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ ...errors, general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = fetchToken();
        if (!token) return;

        const response = await axios.get(`${API_URL}/companies/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setCompany(response.data.company);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const handleCancel = () => {
    navigate("/companies");
  };

  return (
    <>
      <Title title={title} />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Company Details</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {errors.general && (
                <div className="alert alert-danger">{errors.general}</div>
              )}
              {loading ? (
                <Spinner className="dark" />
              ) : (
                <>
                  <h5 className="mb-3">Company Information</h5>
                  {company ? (
                    <>
                      <div className="row">
                        {Object.keys(company).map((key) => {
                          if (key === "_id" || key === "permissions" || key === "id" || key === "updatedAt")
                            return null;

                          return (
                            <div className="col-md-6 mb-3" key={key}>
                              <p className="mb-1 fw-semibold text-capitalize">
                                {key.replace(/_/g, " ")}:
                              </p>
                              <p className="text-muted">
                                {key === "plan"
                                  ? company.plan?.name
                                  : String(company[key])}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p>No company information available.</p>
                  )}
                  <div className="d-flex justify-content-end mt-2">
                    <button
                      type="button"
                      className="btn btn-secondary w-md"
                      onClick={handleCancel}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewCompany;
