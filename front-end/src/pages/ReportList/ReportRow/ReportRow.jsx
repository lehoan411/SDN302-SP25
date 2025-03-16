import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ReportRow.scss";

const ReportRow = ({ report, index, handleArrayChange }) => {
  const navigate = useNavigate();

  const handleDeleteWallpaperAndReport = () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this wallpaper and report?");
    if (isConfirmed) {
      toast.success("Report and wallpaper deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: false,
      });
      handleArrayChange(report.wallpaper._id);
    }
  };

  const handleDeleteReport = () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this report?");
    if (isConfirmed) {
      toast.success("Report deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: false,
      });
      handleArrayChange(report.wallpaper._id);
    }
  };

  const handleNavigate = () => {
    navigate(`/management/report/${report.wallpaper._id}`);
  };

  return (
    <tr>
      <td>{index}</td>
      <td>{report.wallpaper._id}</td>
      <td>
        <Link to={`/wallpaper/${report.wallpaper._id}`}>Link</Link>
      </td>
      <td>
        <button className="btn btn-sm btn-primary" onClick={handleNavigate}>
          Detail
        </button>
        <button className="btn btn-sm btn-danger mx-2" onClick={handleDeleteReport}>
          Delete report
        </button>
        <button className="btn btn-sm btn-danger" onClick={handleDeleteWallpaperAndReport}>
          Delete report and image
        </button>
      </td>
    </tr>
  );
};

export default ReportRow;
