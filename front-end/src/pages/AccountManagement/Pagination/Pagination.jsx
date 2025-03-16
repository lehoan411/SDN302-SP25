import React, { useContext } from "react";
import "./Pagination.scss";
import { Context } from "../AccountManagement";

const Pagination = () => {
  const { users, currentPage, usersPerPage, handlePageChange } = useContext(Context);

  const totalPages = Math.ceil(users.length / usersPerPage);

  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (totalPages === 1) return null;

  return (
    <div className="pagination">
      <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))}>&laquo;</button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => handlePageChange(number)}
          className={currentPage === number ? "active" : ""}
        >
          {number}
        </button>
      ))}
      <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}>&raquo;</button>
    </div>
  );
};

export default Pagination;
