import React, { useState, useContext } from "react";
import "./UserRow.scss";
import { Context } from "../AccountManagement";

const UserRow = ({ user }) => {
  const { setUsers, users, setDefaultUsers } = useContext(Context);

  const getRoleClassName = (role) => {
    if (role === "admin") return "badge admin";
    return "badge user";
  };

  const className = getRoleClassName(user.roles);

  const handleBlockUser = async () => {
    try {
      const response = await fetch(`http://localhost:9999/users/block/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: user.status }),
      });

      if (response.ok) {
        const updatedUsers = users.map((u) =>
          u._id === user._id ? { ...u, status: "inactive" } : u
        );
        setUsers(updatedUsers);
        setDefaultUsers(updatedUsers);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleActiveUser = async (userId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:9999/users/activate/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: user.status }),
      });

      if (response.ok) {
        const updatedUsers = users.map((u) =>
          u._id === user._id ? { ...u, status: "active" } : u
        );
        setUsers(updatedUsers);
        setDefaultUsers(updatedUsers);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleUpdateRole = async () => {
    try {
      const response = await fetch(`http://localhost:9999/users/upgrade/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const updatedUsers = users.map((u) =>
          u._id === user._id ? { ...u, roles: "user Vip" } : u
        );
        setUsers(updatedUsers);
        setDefaultUsers(updatedUsers);
      }
    } catch (error) {
      console.error("Error upgrading user role:", error);
    }
  };

  const handleDowngradeRole = async () => {
    try {
      const response = await fetch(`http://localhost:9999/users/downgrade/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const updatedUsers = users.map((u) =>
          u._id === user._id ? { ...u, roles: "user" } : u
        );
        setUsers(updatedUsers);
        setDefaultUsers(updatedUsers);
      }
    } catch (error) {
      console.error("Error downgrading user role:", error);
    }
  };

  return (
    <tr className={user.status === "inactive" ? "blocked" : ""}>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td className="hidden-xs">{user.dob && new Date(user.dob).toLocaleDateString("vi-VN")}</td>
      <td className={user.roles === "user Vip" ? "user-vip" : "user-role"}>
        {user.roles}
      </td>
      <td>
        <input type="checkbox" checked={user.status === "active"} onChange={handleActiveUser} />
      </td>
      <td>
        <input type="checkbox" checked={user.status === "inactive"} onChange={handleBlockUser} />
      </td>
      <td>
        {user.roles === "user" ? (
          <button onClick={handleUpdateRole}>Upgrade to VIP</button>
        ) : (
          <button onClick={handleDowngradeRole}>Downgrade to User</button>
        )}
      </td>
    </tr>
  );
};

export default UserRow;
