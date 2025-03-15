import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navbar, Nav, Button, Dropdown, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

const Header = () => {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [user, setUser] = useState(null); // Thông tin user
  const [inputUserId, setInputUserId] = useState(""); // Giá trị nhập vào

  // Gọi API để lấy thông tin user nếu có userId
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`http://localhost:9999/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  // Khi ấn "Join", lưu userId vào localStorage và cập nhật state
  const handleJoin = () => {
    if (inputUserId.trim() !== "") {
      localStorage.setItem("userId", inputUserId);
      setUserId(inputUserId);
    }
  };

  // Khi ấn "Logout", xóa userId khỏi localStorage và cập nhật state
  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserId("");
    setUser(null);
  };

  return (
    <Navbar bg="light" expand="lg" className="px-4 py-2 shadow-sm">
      {/* Logo */}
      <Navbar.Brand href="/" className="fw-bold fs-4">Get Images</Navbar.Brand>

      {/* Navigation */}
      <Nav className="ms-auto d-flex align-items-center gap-3">
        {user ? (
          // Nếu đã đăng nhập
          <>
            {/* Welcome Message & Avatar */}
            <span className="fw-semibold">Welcome, {user.name}</span>

            {/* User Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="p-2 border-0 d-flex align-items-center"
                style={{ background: "none" }}
              >
                <img
                  src={user.avatar || "https://i.pravatar.cc/40"} // Avatar mặc định nếu không có
                  alt="User Avatar"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #ddd"
                  }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                <Dropdown.Item as={Link} to="/profile/edit-profile">Edit Profile</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </>
        ) : (
          // Nếu chưa đăng nhập
          <>
            {/* Input nhập userId */}
            <Form.Control
              type="text"
              placeholder="Enter User ID"
              value={inputUserId}
              onChange={(e) => setInputUserId(e.target.value)}
              style={{ width: "150px", marginRight: "10px" }}
            />
            {/* Nút Join để lưu userId vào localStorage */}
            <Button variant="success" className="fw-semibold px-3 text-white" onClick={handleJoin}>
              Join
            </Button>
          </>
        )}
      </Nav>
    </Navbar>
  );
};

export default Header;