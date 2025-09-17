import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { getItem, getToken } from "../../../../utils/localStorageHelper";
import { CONSTANT } from "../../../../utils/constant";
import config from "../../../../utils/helpers/helper";
import { notify } from "../../../../utils/notifications/ToastNotification";
import { handleError } from "../../../../utils/errorHandling/errorHandler";
import Spinner from "../../../Spinner/Spinner";
import Title from "../../Title";

const { API_URL } = config;

export default function ExcelMapper({ title }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [columns, setColumns] = useState([]);
  const [keys, setKeys] = useState([]);
  const [mapping, setMapping] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [template, setTemplate] = useState({
    name: "",
    filename: "",
    description: "",
    emailTemplate: "",
    fields: [],
    isSignature: false,
    files: [],
  });

  const [errors, setErrors] = useState({});

  const templateId = getItem('excel_template_id');

  useEffect(() => {
    if (templateId) {
      fetchTemplateData();
    } else {
      navigate("/template");
    }
  }, [templateId]);

  const fetchToken = () => {
    const token = getToken();
    if (!token) {
      setErrors({ general: CONSTANT.AUTH.AUTH_REQUIRED });
    }
    return token;
  };

  const fetchTemplateData = async () => {
    const token = fetchToken();
    if (!token) return;

    try {
      const { data, status } = await axios.get(`${API_URL}/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (status !== 200) {
        notify(data.message, data.status);
        return navigate("/template");
      }

      setTemplate(data);
      setKeys(data.fields.map(field => field.name));

      const sortedFields = data.fields.sort((a, b) => (["text", "textarea", "date", "file"].indexOf(a.inputType) - ["text", "textarea", "date", "file"].indexOf(b.inputType)));
      setTemplate(prev => ({ ...prev, fields: sortedFields }));

    } catch (error) {
      handleError(error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = ({ target }) => {
      const data = new Uint8Array(target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const headers = jsonData[0];
      setColumns(headers);
      setMapping(autoMapColumns(headers, keys));
      setShowMap(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSelectChange = (key, value) => {
    setMapping(prev => ({ ...prev, [key]: value }));
  };

  const autoMapColumns = (headers, keys) => {
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const mapped = {};
    const usedHeaders = new Set();

    keys.forEach((key) => {
      const normalizedKey = normalize(key);
      const match = headers.find(header => normalize(header) === normalizedKey);

      if (match && !usedHeaders.has(match)) {
        mapped[key] = match;
        usedHeaders.add(match);
      }
    });

    return mapped;
  };

  const clearFile = () => {
    setColumns([]);
    setMapping({});
    setShowMap(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMapClick = () => {
    const allMapped = keys.every(k => mapping[k]);

    if (!allMapped) {
      setErrors({ general: "Please map all required fields before proceeding." });
      setShowMap(false);
    } else {
      setErrors({});
      setShowMap(true);
    }
  };

  const handleSubmitToBackend = async () => {
    const allMapped = keys.every(k => mapping[k]);
    if (!allMapped) {
      setErrors({ general: "Please map all required fields before submitting." });
      setShowMap(false);
      return;
    }

    const token = fetchToken();
    if (!token) return;

    if (!fileInputRef.current?.files[0]) {
      notify("No file uploaded", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInputRef.current.files[0]);
    formData.append("templateId", templateId);
    formData.append("mapping", JSON.stringify(mapping));

    try {
      setLoading(true);
      const { data, status } = await axios.post(`${API_URL}/templates/bulk-generate`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (status === 200) {
        notify(data.message, data.status);
        navigate("/template");
      } else {
        notify(data.message || "Something went wrong", "error");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!columns.length) {
      setErrors({});
      setMapping({});
      setShowMap(false);
    }
  }, [columns]);

  useEffect(() => {
    console.log(mapping)
  }, [mapping]);

  useEffect(() => {
    if (keys.length && columns.length) {
      const autoMapping = autoMapColumns(columns, keys);
      setMapping(autoMapping);
    }
  }, [keys, columns]);

  const handleCancel = () => {
    navigate("/template");
  };

  return (
    <>
      <Title title={title} />
      <div className="row mb-4">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0">Excel Column Mapper</h4>
          </div>
        </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-3">Upload Excel File</h5>
                <div className="row g-2 align-items-center mb-4">
                  <div className="col">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="form-control"
                    />
                  </div>
                  <div className="col-auto">
                    <button className="btn btn-outline-danger" onClick={clearFile}>Clear File</button>
                  </div>
                </div>

                {columns.length > 0 && (
                  <>
                    <h5 className="mb-3">Map Excel Columns to Keys</h5>
                    {errors.general && <div className="alert alert-danger" role="alert">{errors.general}</div>}
                    {/* <div className="table-responsive"> */}
                      <table className="table table-bordered align-middle">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "40%" }}>Predefined Keys</th>
                            <th>Excel Columns</th>
                          </tr>
                        </thead>
                        <tbody>
                          {keys.map((key) => (
                            <tr key={key}>
                              <td className="fw-semibold text-capitalize">{key.replace(/_/g, " ")}</td>
                              <td>
                                <select
                                  className="form-select"
                                  value={mapping[key] || ""}
                                  onChange={(e) => handleSelectChange(key, e.target.value)}
                                >
                                  <option value="">-- Select Column --</option>
                                  {columns.map((col) => (
                                    <option key={col} value={col}>{col}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    {/* </div> */}

                    <div className="dropdown-divider"></div>

                    {showMap && (
                      <div className="mt-2">
                        <h5 className="mb-3">🧩 Column Mapping Overview</h5>
                        <div className="table-responsive">
                          <table className="table table-striped table-bordered">
                            <thead className="table-light">
                              <tr>
                                <th style={{ width: "50%" }}>Predefined Key</th>
                                <th>Mapped Excel Column</th>
                                <th style={{ width: "50px" }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {keys.map((key) => (
                                <tr key={key}>
                                  <td className="text-capitalize fw-semibold">{key.replace(/_/g, " ")}</td>
                                  <td>{mapping[key] || <span className="text-muted">Not Mapped</span>}</td>
                                  <td className="text-center">
                                    {mapping[key] ? <span className="text-success fw-bold">✔</span> : <span className="text-danger fw-bold">✖</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-end mt-3">
                      <button type="button" className="btn btn-secondary me-2" onClick={handleCancel} disabled={loading}>Cancel</button>
                      <button
                        className="btn btn-success d-flex align-items-center justify-content-center gap-2"
                        onClick={showMap ? handleSubmitToBackend : handleMapClick}
                        disabled={loading}
                      >
                        {loading && <Spinner />}
                        {showMap ? "Submit & Generate" : "Map Columns"}
                      </button>
                    </div>
                  </>
                )}

                {!columns.length && !loading && (
                  <div className="text-center mt-4">
                    <p className="text-muted">Upload an Excel file to see the columns here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </>
  );
}

// https://chatgpt.com/c/67f517f3-a1ec-8008-933c-e1af8daeadee
// import React, { useState, useCallback } from "react";
// import * as XLSX from "xlsx";
// import ReactFlow, {
//   ReactFlowProvider,
//   addEdge,
//   Background,
//   Controls,
//   MiniMap,
//   Handle,
//   Position,
// } from "react-flow-renderer";

// const keys = [
//   "Invoice Number",
//   "Product ID",
//   "Product Name",
//   "Quantity",
//   "Price per Unit",
//   "Total Price",
//   "Purchase Date",
//   "Supplier Name",
//   "Payment Mode",
//   "Delivery Status",
// ];

// // Custom node for key (source node)
// const KeyNode = ({ data }) => (
//   <div
//     style={{
//       padding: "8px 12px",
//       backgroundColor: "#e0f7fa",
//       borderRadius: 6,
//       border: "1px solid #00acc1",
//     }}
//   >
//     {data.label}
//     <Handle type="source" position={Position.Right} id="a" />
//   </div>
// );

// // Custom node for column (target node)
// const ColumnNode = ({ data }) => (
//   <div
//     style={{
//       padding: "8px 12px",
//       backgroundColor: "#f1f8e9",
//       borderRadius: 6,
//       border: "1px solid #8bc34a",
//     }}
//   >
//     <Handle type="target" position={Position.Left} id="b" />
//     {data.label}
//   </div>
// );

// const nodeTypes = {
//   keyNode: KeyNode,
//   columnNode: ColumnNode,
// };

// export default function VisualExcelMapper() {
//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     const reader = new FileReader();

//     reader.onload = (evt) => {
//       const data = new Uint8Array(evt.target.result);
//       const workbook = XLSX.read(data, { type: "array" });
//       const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
//       const headers = jsonData[0];

//       const keyNodes = keys.map((key, idx) => ({
//         id: `key-${idx}`,
//         type: "keyNode",
//         data: { label: key },
//         position: { x: 50, y: idx * 80 },
//       }));

//       const columnNodes = headers.map((col, idx) => ({
//         id: `col-${idx}`,
//         type: "columnNode",
//         data: { label: col },
//         position: { x: 400, y: idx * 80 },
//       }));

//       setNodes([...keyNodes, ...columnNodes]);
//       setEdges([]);
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   const onConnect = useCallback(
//     (params) =>
//       setEdges((eds) =>
//         addEdge({ ...params, animated: true, style: { stroke: "#2196f3" } }, eds)
//       ),
//     []
//   );

//   const clearMappings = () => {
//     setEdges([]);
//   };

//   return (
//     <div className="container mt-4">
//       <h4>📎 Excel Mapper - Drag to Connect</h4>

//       <input
//         type="file"
//         accept=".xlsx, .xls"
//         onChange={handleFileUpload}
//         className="form-control my-3"
//       />

//       <div className="mb-3">
//         <button className="btn btn-danger" onClick={clearMappings}>
//           🧹 Clear All Mappings
//         </button>
//       </div>

//       <div style={{ height: 600, border: "1px solid #ccc", borderRadius: 6 }}>
//         <ReactFlowProvider>
//           <ReactFlow
//             nodes={nodes}
//             edges={edges}
//             onConnect={onConnect}
//             fitView
//             nodeTypes={nodeTypes}
//             isValidConnection={({ sourceHandle, targetHandle }) =>
//               sourceHandle === 'a' && targetHandle === 'b'
//             }
//           >

//             <MiniMap />
//             <Controls />
//             <Background color="#aaa" gap={16} />
//           </ReactFlow>
//         </ReactFlowProvider>
//       </div>

//       {edges.length > 0 && (
//         <div className="mt-4">
//           <h5>🔗 Mapping Summary</h5>
//           <ul>
//             {edges.map((edge, idx) => {
//               const from = nodes.find((n) => n.id === edge.source)?.data.label;
//               const to = nodes.find((n) => n.id === edge.target)?.data.label;
//               return (
//                 <li key={idx}>
//                   <strong>{from}</strong> → <em>{to}</em>
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }