import { createContext, useEffect, useState } from "react";
import UserTable from "./UserTable/UserTable";
import SearchBar from "./SearchBar/SearchBar";
import Pagination from "./Pagination/Pagination";
import "./AccountManagement.scss";
import axios from "axios";

export const Context = createContext();

const AccountManagement = () => {
  const [defaultUsers, setDefaultUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  const getAllUser = async () => {
    try {
      const response = await axios.get("http://localhost:9999/users/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure authentication if needed
        },
      });

      if (response.data) {
        setDefaultUsers(response.data);
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getAllUser();
  }, []);

  const usersPerPage = 10;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortConfig.key) {
      const order = sortConfig.direction === "ascending" ? 1 : -1;
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return -1 * order;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return 1 * order;
      }
      return 0;
    }
    return users;
  });

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="container account-management">
      <Context.Provider
        value={{
          users: sortedUsers,
          setUsers,
          defaultUsers,
          setDefaultUsers,
          currentPage,
          setCurrentPage,
          usersPerPage,
          handlePageChange,
          requestSort,
          sortConfig,
        }}
      >
        <SearchBar />
        <UserTable />
        <Pagination />
      </Context.Provider>
    </div>
  );
};

export default AccountManagement;
