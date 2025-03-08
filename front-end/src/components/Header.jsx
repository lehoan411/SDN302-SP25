import React, { useState } from "react";
import { Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import { MenuOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mặc định đã đăng nhập
  const [user] = useState({
    name: "John Doe",
    avatar: "https://i.pravatar.cc/40?img=3", // Avatar người dùng
  });

  return (
    <Navbar bg="light" expand="lg" className="px-4 py-2 shadow-sm">
      {/* Logo */}
      <Navbar.Brand href="/" className="fw-bold fs-4">Get Images</Navbar.Brand>

      {/* Navigation */}
      <Nav className="ms-auto d-flex align-items-center gap-3">
        {/* Explore Dropdown */}
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
                  src={user.avatar}
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
                <Dropdown.Item onClick={() => setIsLoggedIn(false)}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </>
        ) : (
          // Nếu chưa đăng nhập
          <>
            <Button variant="outline-info" className="fw-semibold px-3">Sign-up</Button>
            <Button
              variant="success"
              className="fw-semibold px-3 text-white"
              onClick={() => setIsLoggedIn(true)}
            >
              Join
            </Button>
          </>
        )}
      </Nav>
    </Navbar>
  );
}

export default Header;