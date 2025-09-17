import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SignaturePad from "signature_pad";
import axios from "axios";
import config from "../../../../utils/helpers/helper";
import Title from "../../Title";

const { API_URL } = config;

const SignaturePadComponent = ({ title }) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState("draw");
  const [inboxId, setInboxId] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [countdown, setCountdown] = useState(120);

  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const oneTimeToken = queryParams.get("token");

  useEffect(() => {
    if (!oneTimeToken) {
      setTokenError("No token provided in the URL.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.post(`${API_URL}/inbox/verify-token`, { token: oneTimeToken });

        if (response.status === 200) {
          setTokenValid(true);
          setInboxId(response.data.inboxId);
        }
      } catch (error) {
        setTokenValid(false);
        if (error.response) {
          setTokenError(error.response.data.message);
        } else {
          setTokenError("An error occurred while verifying the token.");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [oneTimeToken]);

  useEffect(() => {
    if (mode === "draw") {
      initializeSignaturePad();
    }
  }, [mode]);

  const initializeSignaturePad = () => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current);
    }
  };

  useEffect(() => {
    if (uploadSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      setTimeout(() => {
        window.close();
      }, countdown * 1000);

      return () => clearInterval(timer);
    }
  }, [uploadSuccess, countdown]);

  const refreshCanvas = () => {
    initializeSignaturePad();
  };

  const saveSignature = async () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) return;

    const isConfirmed = window.confirm("Are you sure you want to upload this signature? You won't be able to change it later.");
    if (!isConfirmed) return;

    const dataURL = signaturePadRef.current.toDataURL();
    const blob = await fetch(dataURL).then((res) => res.blob());
    const file = new File([blob], "signature.png", { type: "image/png" });

    await uploadSignature(file);
  };

  const uploadSignature = async (file) => {
    if (!oneTimeToken || !inboxId) return;

    const formData = new FormData();
    formData.append("signature", file);
    formData.append("token", oneTimeToken);
    formData.append("inboxId", inboxId);

    try {
      const response = await axios.post(`${API_URL}/inbox/upload-signature`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        const documentLink = response.data.documentLink;
        if (documentLink) {
          setPdfUrl(documentLink);
        }
        setUploadSuccess(true);
      }
    } catch (error) {
      console.error("Error uploading signature:", error);
    }
  };

  if (loading) {
    return <p className="text-center">Verifying token...</p>;
  }

  return (
    <>
      <Title title={title} />
      <div className="container mt-4">
        <h2 className="text-center mb-4">Digital Signature</h2>

        {!tokenValid ? (
          <p className="text-center text-danger">{tokenError}</p>
        ) : (
          <>
            {!uploadSuccess ? (
              <>
                <div className="d-flex justify-content-center mb-3">
                  <button className={`btn me-2 ${mode === "draw" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMode("draw")}>
                    Draw Signature
                  </button>
                  <button className={`btn ${mode === "upload" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMode("upload")}>
                    Upload Image
                  </button>
                </div>

                {mode === "draw" && (
                  <div className="text-center">
                    <canvas ref={canvasRef} className="border border-dark bg-light" width={400} height={200} />
                    <div className="mt-3">
                      <button className="btn btn-warning me-2" onClick={refreshCanvas}>Refresh Canvas</button>
                      <button className="btn btn-success" onClick={saveSignature}>Save</button>
                    </div>
                  </div>
                )}

                {mode === "upload" && (
                  <div className="text-center">
                    <input type="file" accept="image/*" className="form-control" onChange={(e) => setImage(e.target.files[0])} />
                    <button
                      className="btn btn-success mt-3"
                      onClick={() => {
                        const isConfirmed = window.confirm("Are you sure you want to upload this signature? You won't be able to change it later.");
                        if (isConfirmed && image) uploadSignature(image);
                      }}
                    >
                      Upload Image
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-center">
                  <h3 className="text-success">✅ Signature uploaded successfully!</h3>
                </div>
                <div className="my-4 text-center">
                  <h3>Generated Document:</h3>
                  <embed src={pdfUrl} type="application/pdf" width="100%" height="600px" />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SignaturePadComponent;




// import React, { useRef, useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import SignaturePad from "signature_pad";
// import axios from "axios";
// import config from "../../../../utils/helpers/helper";
// import { getToken } from "../../../../utils/localStorageHelper";

// const { API_URL } = config;

// const SignaturePadComponent = ({title}) => {
//   const canvasRef = useRef(null);
//   const signaturePadRef = useRef(null);
//   const [image, setImage] = useState(null);
//   const [mode, setMode] = useState("draw");
//   const [inboxId, setInboxId] = useState("");
//   const [tokenValid, setTokenValid] = useState(false);
//   const [tokenError, setTokenError] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [uploadSuccess, setUploadSuccess] = useState(false);
//   const [pdfUrl, setPdfUrl] = useState("");
//   const [countdown, setCountdown] = useState(120);

//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const oneTimeToken = queryParams.get("token");

//   useEffect(() => {
//     if (!oneTimeToken) return;

//     const verifyToken = async () => {
//       try {
//         const authToken = getToken("token");
//         if (!authToken) return;
//         console.log(authToken)

//         const response = await axios.post(`${API_URL}/inbox/verify-token`,
//           { token: oneTimeToken },
//           { headers: { Authorization: `Bearer ${authToken}` } }
//         );

//         console.log(response.data);
//         if (response.status === 200) {
//           setTokenValid(true);
//           setInboxId(response.data.inboxId);
//           const documentLink = response.data.documentLink;
//           if (documentLink) {
//             setPdfUrl(documentLink);
//           }
//         }
//       } catch (error) {
//         setTokenValid(false);
//         if (error.response) {
//           setTokenError(error.response.data.message);
//         } else {
//           setTokenError("An error occurred while verifying the token.");
//         }
//       }
//       finally {
//         setLoading(false);
//       }
//     };

//     verifyToken();
//   }, [oneTimeToken]);

//   useEffect(() => {
//     initializeSignaturePad();
//   }, [mode]);

//   const initializeSignaturePad = () => {
//     if (canvasRef.current) {
//       signaturePadRef.current = new SignaturePad(canvasRef.current);
//     }
//   };

//   useEffect(() => {
//     if (uploadSuccess) {
//       const timer = setInterval(() => {
//         setCountdown((prev) => prev - 1);
//       }, 1000);

//       setTimeout(() => {
//         window.close();
//       }, countdown * 1000);

//       return () => clearInterval(timer);
//     }
//   }, [uploadSuccess]);

//   const clearSignature = () => {
//     signaturePadRef.current?.clear();
//   };

//   const refreshCanvas = () => {
//     clearSignature();
//     initializeSignaturePad();
//   };

//   const saveSignature = async () => {
//     if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) return;

//     const isConfirmed = window.confirm("Are you sure you want to upload this signature? You won't be able to change it later.");
//     if (!isConfirmed) return;

//     const dataURL = signaturePadRef.current.toDataURL();
//     const blob = await fetch(dataURL).then((res) => res.blob());
//     const file = new File([blob], "signature.png", { type: "image/png" });

//     await uploadSignature(file);
//   };

//   const uploadSignature = async (file) => {
//     if (!oneTimeToken) return;

//     const authToken = getToken("token");
//     if (!authToken) return;

//     const formData = new FormData();
//     formData.append("signature", file);
//     formData.append("token", oneTimeToken);
//     formData.append("inboxId", inboxId);

//     try {
//       const response = await axios.post(`${API_URL}/inbox/upload-signature`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${authToken}`,
//         },
//       });

//       if (response.status === 200) {
//         setUploadSuccess(true);
//       }
//     } catch (error) {
//       console.error("Error uploading signature:", error);
//     }
//   };

//   if (loading) {
//     return <p className="text-center">Verifying token...</p>;
//   }

//   if (!tokenValid) {
//     return <p className="text-center text-danger">{tokenError}</p>;
//   }

//   return (
//     <>
//     <Title title={title}
//     <div className="container mt-4">
//       <h2 className="text-center mb-4">Digital Signature</h2>

//       {uploadSuccess ? (
//         <div className="text-center">
//           <h3 className="text-success">✅ Signature uploaded successfully!</h3>
//           <p>This tab will close in <b>{countdown} seconds</b>.</p>

//           <embed src={pdfUrl} type="application/pdf" width="100%" height="600px" />
//         </div>
//       ) : (
//         <>
//           <div className="d-flex justify-content-center mb-3">
//             <button className={`btn me-2 ${mode === "draw" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMode("draw")}>
//               Draw Signature
//             </button>
//             <button className={`btn ${mode === "upload" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMode("upload")}>
//               Upload Image
//             </button>
//           </div>

//           {mode === "draw" && (
//             <div className="text-center">
//               <canvas ref={canvasRef} className="border border-dark bg-light" width={400} height={200} />
//               <div className="mt-3">
//                 <button className="btn btn-warning me-2" onClick={refreshCanvas}>Refresh Canvas</button>
//                 <button className="btn btn-secondary me-2" onClick={clearSignature}>Clear</button>
//                 <button className="btn btn-success" onClick={saveSignature}>Save</button>
//               </div>
//             </div>
//           )}

//           {mode === "upload" && (
//             <div className="text-center">
//               <input type="file" accept="image/*" className="form-control" onChange={(e) => setImage(e.target.files[0])} />
//               <button
//                 className="btn btn-success mt-3"
//                 onClick={() => {
  //                   const isConfirmed = window.confirm("Are you sure you want to upload this signature? You won't be able to change it later.");
  //                   if (isConfirmed && image) uploadSignature(image);
  //                 }}
  //               >
  //                 Upload Image
  //               </button>
  //             </div>
  //           )}

  //           {signatureURL && (
  //             <div className="mt-4 text-center">
  //               <h3>Saved Signature:</h3>
//               <img src={signatureURL} alt="Signature" className="border border-dark img-fluid" style={{ maxWidth: "400px", height: "200px" }} />
//             </div>
//           )}
//         </>
//       )}
//     </div>
//     </>
//   );
// };

// export default SignaturePadComponent;
