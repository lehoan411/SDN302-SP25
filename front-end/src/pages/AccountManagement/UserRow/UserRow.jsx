import React, { useState, useContext } from "react";
import "./UserRow.scss";
import { Context } from "../AccountManagement";

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

const UserRow = () => {
  const { setUsers, setDefaultUsers } = useContext(Context);
  const [users, setLocalUsers] = useState(fakeUsers);

  const getRoleClassName = (roles) => {
    if (roles.some((role) => role.name === "admin")) return "badge admin";
    if (roles.some((role) => role.name === "vip")) return "badge vip";
    return `badge member`;
  };

  const handleBlockUser = (userId) => {
    const updatedUsers = users.map((user) =>
      user._id === userId ? { ...user, isActived: !user.isActived } : user
    );

    setLocalUsers(updatedUsers);
    setUsers(updatedUsers);
    setDefaultUsers(updatedUsers);
  };

  return (
    <>
      {users.map((user) => (
        <tr key={user._id} className={!user.isActived ? "blocked" : ""}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td className="hidden-xs">{user.dob && new Date(user.dob).toLocaleDateString("vi-VN")}</td>
          <td>
            <span className={getRoleClassName(user.roles)}>
              {user.roles.some((role) => role.name === "admin")
                ? "admin"
                : user.roles.some((role) => role.name === "vip")
                ? "vip"
                : "member"}
            </span>
          </td>
          <td>
            <input type="checkbox" checked={!user.isActived} onChange={() => handleBlockUser(user._id)} />
          </td>
        </tr>
      ))}
    </>
  );
};

export default UserRow;
