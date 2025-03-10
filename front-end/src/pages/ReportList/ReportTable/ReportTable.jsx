import { useState, useEffect } from "react";
import "./ReportTable.scss";
import ReportRow from "../ReportRow/ReportRow";

const fakeReports = [
  { _id: "1", wallpaper: { _id: "101", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba" } },
  { _id: "2", wallpaper: { _id: "102", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba" } },
  { _id: "3", wallpaper: { _id: "103", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba" } },
  { _id: "4", wallpaper: { _id: "104", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba" } },
  { _id: "5", wallpaper: { _id: "105", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba" } },
  { _id: "6", wallpaper: { _id: "106", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba" } },
];

const ReportTable = ({ getTotalReports, currentPage, pageSize }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const uniqueReports = fakeReports.reduce((acc, report) => {
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
  }, [currentPage]);

  const handleDeleteReport = (id) => {
    setReports(reports.filter((report) => report.wallpaper._id !== id));
  };

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
