import React from "react";
import { Link } from "react-router-dom";

const ReportDetailRow = ({ report, index }) => {
  return (
    <tr>
      <td>{index}</td>
      <td>
        <Link to={`/wallpaper/${report.wallpaper._id}`}>Link</Link>
      </td>
      <td>{report.reason}</td>
      <td>{report.wallpaper.createdBy.name} ({report.wallpaper.createdBy.mail})</td>
      <td>{report.reporter.name} ({report.reporter.mail})</td>
    </tr>
  );
};

export default ReportDetailRow;
