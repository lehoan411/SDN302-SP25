import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportDetailTable from "./ReportDetailTable/ReportDetailTable";
import Pagination from "../../components/Pagination/Pagination";

const ReportDetail = () => {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const getTotalReports = (data) => {
    setReports(data);
  };

  const navigate = useNavigate();

  const toReportList = () => {
    navigate("/management/report");
  };

  return (
    <div className="container">
      <h1 className="fw-bold text-center">Reported image detail</h1>
      <button className="btn btn-primary " onClick={toReportList}>
        Back to Report List
      </button>
      <ReportDetailTable getTotalReports={getTotalReports} currentPage={currentPage} pageSize={pageSize} />
      <Pagination
        pageSize={pageSize}
        totalCount={reports.length}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ReportDetail;
