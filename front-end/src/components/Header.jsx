import React, { useState } from "react";
import { Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mặc định chưa đăng nhập
  const navigate = useNavigate();

  const [user] = useState({
    name: "John Doe",
    avatar: "https://i.pravatar.cc/40?img=3", // Avatar người dùng
  });

  const handleJoin = () => {
    navigate("/login"); // Chuyển hướng sang trang Login khi ấn Join
  };

  const handleSignUp = () => {
    navigate("/register"); // Chuyển hướng sang trang Register khi ấn Sign-up
  };

  return (
    <Navbar bg="light" expand="lg" className="px-4 py-2 shadow-sm">
      <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
        Get Images
      </Navbar.Brand>

      <Nav className="ms-auto d-flex align-items-center gap-3">
        <Dropdown>
          <Dropdown.Toggle variant="light" id="dropdown-basic" className="fw-medium border-0">
            Explore
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="#">Popular</Dropdown.Item>
            <Dropdown.Item href="#">New</Dropdown.Item>
            <Dropdown.Item href="#">Trending</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {isLoggedIn ? (
          <>
            <span className="fw-semibold">Welcome, {user.name}</span>

            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="p-2 border-0 d-flex align-items-center"
                style={{ background: "none" }}
              >
                <img
                  src={user.avatar}
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
                <Dropdown.Item onClick={() => setIsLoggedIn(false)}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </>
        ) : (
          <>
            <Button variant="outline-info" className="fw-semibold px-3" onClick={handleSignUp}>
              Sign-up
            </Button>
            <Button
              variant="success"
              className="fw-semibold px-3 text-white"
              onClick={handleJoin}
            >
              Join
            </Button>
          </>
        )}
      </Nav>
    </Navbar>
  );
};

export default Header;
