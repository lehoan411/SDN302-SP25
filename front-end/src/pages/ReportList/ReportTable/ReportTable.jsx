import { useState, useEffect } from "react";
import "./ReportTable.scss";
import ReportRow from "../ReportRow/ReportRow";

const ReportTable = ({ getTotalReports, currentPage, pageSize }) => {
  const [reports, setReports] = useState([]);

  const getReportList = async () => {
    try {
      const response = await fetch("http://localhost:9999/reports/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming you use JWT authentication
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        const uniqueReports = data.reduce((acc, report) => {
          if (!acc.some((r) => r.wallpaper._id === report.wallpaper._id)) {
            acc.push(report);
          }
          return acc;
        }, []);

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedReports = uniqueReports.slice(startIndex, endIndex);

        getTotalReports(uniqueReports);
        setReports(paginatedReports);
      } else {
        console.error("Error fetching reports:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  const handleDeleteReport = (id) => {
    setReports(reports.filter((report) => report.wallpaper._id !== id));
  };

  useEffect(() => {
    getReportList();
  }, [currentPage]);

  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>Index</th>
          <th>Image ID</th>
          <th>Image Link</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report, index) => (
          <ReportRow key={report._id} report={report} index={index + 1} handleArrayChange={handleDeleteReport} />
        ))}
      </tbody>
    </table>
  );
};

export default ReportTable;
