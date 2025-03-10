import React, { useEffect, useState } from "react";
import ReportDetailRow from "../ReportDetailRow/ReportDetailRow";
import { useParams } from "react-router-dom";
import "./ReportDetailTable.scss";

const fakeReports = [
  {
    _id: "101",
    wallpaper: { _id: "101", imageUrl: "https://via.placeholder.com/150" },
    description: "Inappropriate content",
    uploader: "Alice Johnson",
    reporter: "John Doe",
  },
  {
    _id: "102",
    wallpaper: { _id: "102", imageUrl: "https://via.placeholder.com/150" },
    description: "Copyright violation",
    uploader: "Bob Smith",
    reporter: "Jane Doe",
  },
  {
    _id: "103",
    wallpaper: { _id: "101", imageUrl: "https://via.placeholder.com/150" },
    description: "Offensive material",
    uploader: "Charlie Brown",
    reporter: "Emma Watson",
  },
];

const ReportDetailTable = ({ getTotalReports, currentPage, pageSize }) => {
  const [reports, setReports] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    // Using fake data instead of API call
    const reportItems = fakeReports.filter((report) => report.wallpaper._id === id);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedReports = reportItems.slice(startIndex, endIndex);

    getTotalReports(reportItems);
    setReports(paginatedReports);
  }, [currentPage, id]);

  return (
    <table className="report-detail-table">
      <thead>
        <tr>
          <th>Index</th>
          <th>Image Link</th>
          <th>Description</th>
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
