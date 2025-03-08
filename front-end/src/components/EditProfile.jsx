import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();

  // Thông tin người dùng (giả lập)
  const [user, setUser] = useState({
    avatar: "https://i.pravatar.cc/150?img=3",
    name: "John Doe",
    bio: "A passionate photographer capturing the beauty of the world.",
    dob: "1995-08-25",
  });

  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // Xử lý khi người dùng chọn avatar mới
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedAvatar(URL.createObjectURL(file)); // Hiển thị ảnh tạm thời
    }
  };

  // Xử lý khi thay đổi thông tin người dùng
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Xử lý lưu thay đổi
  const handleSaveChanges = () => {
    alert("Profile updated successfully!");
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="p-4 shadow-lg border-0 rounded-3" style={{marginBottom: "50px"}}>
            <h2 className="text-center mb-4">Edit Profile</h2>

            {/* Avatar */}
            <div className="text-center position-relative">
              <img
                src={selectedAvatar || user.avatar}
                alt="User Avatar"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #ddd",
                }}
              />
              <label
                htmlFor="avatarUpload"
                className="position-absolute"
                style={{
                  bottom: "5px",
                  right: "5px",
                  background: "#fff",
                  padding: "6px",
                  width: "35px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
                }}
              >
                <CameraOutlined style={{ fontSize: "18px" }} />
              </label>
              <input
                type="file"
                id="avatarUpload"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>

            <Form className="mt-4">
              {/* Tên */}
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </Form.Group>

              {/* Bio */}
              <Form.Group className="mb-3">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="bio"
                  value={user.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                />
              </Form.Group>

              {/* Ngày sinh (DOB) */}
              <Form.Group className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="dob"
                  value={user.dob}
                  onChange={handleChange}
                />
              </Form.Group>

              {/* Nút Save & Change Password */}
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate("/change-password")}>
                  Change Password
                </Button>
                <Button variant="primary" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile;