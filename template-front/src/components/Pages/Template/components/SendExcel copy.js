import React, { useState } from "react";
import * as XLSX from "xlsx";

const predefinedKeys = ["emp_name", "emp_address", "emp_date", "emp_desgination"];

export default function ExcelMapper() {
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [showMap, setShowMap] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      const headers = jsonData[0];
      setColumns(headers);
      setMapping({});
      setShowMap(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSelectChange = (key, value) => {
    setMapping((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMapClick = () => {
    setShowMap(true);
  };

  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0">Excel Column Mapper</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Upload Excel File</h5>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="form-control mb-4"
              />

              {columns.length > 0 && (
                <>
                  <h5 className="mb-3">Map Excel Columns to Keys</h5>
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "40%" }}>Predefined Keys</th>
                          <th>Excel Columns</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predefinedKeys.map((key) => (
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
                                  <option key={col} value={col}>
                                    {col}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-end">
                    <button className="btn btn-success mt-3 px-4" onClick={handleMapClick}>
                      Map Columns
                    </button>
                  </div>
                </>
              )}

              {showMap && (
                <div className="mt-5">
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
                        {predefinedKeys.map((key) => (
                          <tr key={key}>
                            <td className="text-capitalize fw-semibold">{key.replace(/_/g, " ")}</td>
                            <td>{mapping[key] || <span className="text-muted">Not Mapped</span>}</td>
                            <td className="text-center">
                              {mapping[key] ? (
                                <span className="text-success fw-bold">✔</span>
                              ) : (
                                <span className="text-danger fw-bold">✖</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
