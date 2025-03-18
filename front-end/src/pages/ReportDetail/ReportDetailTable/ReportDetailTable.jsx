import React, { useEffect, useState } from "react";
import ReportDetailRow from "../ReportDetailRow/ReportDetailRow";
import { useParams } from "react-router-dom";
import "./ReportDetailTable.scss";

const ReportDetailTable = ({ getTotalReports, currentPage, pageSize }) => {
  const [reports, setReports] = useState([]);
  const { id } = useParams();

  const getReportList = async () => {
    try {
      const response = await fetch("http://localhost:9999/reports", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      const reportItems = data.filter((report) => report.wallpaper._id === id);
      
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedReports = reportItems.slice(startIndex, endIndex);

      getTotalReports(reportItems);
      setReports(paginatedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    getReportList();
  }, [currentPage]);

  return (
    <table className="report-detail-table">
      <thead>
        <tr>
          <th>Index</th>
          <th>Image Link</th>
          <th>Reason</th>
          <th>Uploader</th>
          <th>Reporter</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report, index) => (
          <ReportDetailRow key={report._id} report={report} index={index + 1} />
        ))}
      </tbody>
    </table>
  );
};

export default ReportDetailTable;