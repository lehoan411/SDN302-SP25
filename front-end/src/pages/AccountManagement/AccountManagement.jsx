import { createContext, useEffect, useState } from "react";
import UserTable from "./UserTable/UserTable";
import SearchBar from "./SearchBar/SearchBar";
import Pagination from "./Pagination/Pagination";
import "./AccountManagement.scss";

export const Context = createContext();

const fakeUsers = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    dob: "1990-05-15",
    roles: [{ name: "admin" }],
    isActived: true,
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    dob: "1995-08-20",
    roles: [{ name: "vip" }],
    isActived: false,
  },
  {
    _id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    dob: "1988-11-10",
    roles: [{ name: "member" }],
    isActived: true,
  },
];

const AccountManagement = () => {
  const [defaultUsers, setDefaultUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  useEffect(() => {
    // Using fake data instead of API call
    setDefaultUsers(fakeUsers);
    setUsers(fakeUsers);
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
