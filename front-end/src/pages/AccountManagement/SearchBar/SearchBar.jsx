import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.scss";
import { Context } from "../AccountManagement";

const SearchBar = () => {
  const { setUsers, defaultUsers, setCurrentPage } = useContext(Context);
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchValue, setSearchValue] = useState("");

  const navigate = useNavigate();

  const handlePageChange = () => {
    navigate("/management/report");
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    filterUsers(role, searchValue);
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value;
    setSearchValue(searchValue);
    filterUsers(selectedRole, searchValue);
  };

  const filterUsers = (role, searchValue) => {
    let filteredUsers = defaultUsers;

    if (role !== "All") {
      filteredUsers = filteredUsers.filter((user) => user.roles.toLowerCase() === role.toLowerCase());
    }

    if (searchValue) {
      filteredUsers = filteredUsers.filter((user) => user.name.toLowerCase().includes(searchValue.toLowerCase()));
    }

    setUsers(filteredUsers);
    setCurrentPage(1);
  };

  return (
    <div className="search-bar__header d-flex">
      <div className="search-bar__inner">
        <input type="text" placeholder="Search users..." onChange={handleSearch} value={searchValue} />
        <select onChange={handleRoleChange} value={selectedRole}>
          <option disabled>Roles</option>
          <option>All</option>
          <option>user Vip</option>
          <option>user</option>
        </select>
      </div>

      <button className="btn btn-primary" onClick={handlePageChange}>
        View Report List
      </button>
    </div>
  );
};

export default SearchBar;
