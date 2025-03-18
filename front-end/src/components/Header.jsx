import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:9999/users/get-by-id", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    navigate("/login");
  };

  return (
    <Navbar bg="light" expand="lg" className="px-4 py-2 shadow-sm">
      <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
        Get Images
      </Navbar.Brand>

      <Nav className="ms-auto d-flex align-items-center gap-3">
        {token && user ? (
          <>
            <span className="fw-semibold">Welcome, {user.name}</span>
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="p-2 border-0 d-flex align-items-center"
                style={{ background: "none" }}
              >
                <img
                  src={user.avatar || "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_960_720.png"}
                  alt="User Avatar"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #ddd",
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
            <Button as={Link} to="/register" variant="warning" className="fw-semibold px-3 text-white">
              Register
            </Button>
            <Button as={Link} to="/login" variant="success" className="fw-semibold px-3 text-white">
              Login
            </Button>
          </>
        )}
      </Nav>
    </Navbar>
  );
};

export default Header;