import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EditProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    avatar: "",
    name: "",
    bio: "",
    dob: "",
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUserData();
  }, [token, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:9999/users/get-by-id", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedAvatar(file);
      setUser({ ...user, avatar: URL.createObjectURL(file) });
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    if (!user.name.trim()) {
      alert("Name cannot be empty!");
      return;
    }

    // Validate ngày sinh không phải là hiện tại hoặc tương lai
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Xóa phần giờ để so sánh chính xác

  const userDob = new Date(user.dob);
  userDob.setHours(0, 0, 0, 0); // Xóa phần giờ để so sánh chính xác

  if (isNaN(userDob.getTime())) {
    alert("Invalid Date of Birth!");
    return;
  }

  if (userDob >= today) {
    alert("Date of Birth cannot be today or a future date.");
    return;
  }

    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("bio", user.bio);
    formData.append("dob", user.dob);
    if (selectedAvatar) {
      formData.append("avatar", selectedAvatar);
    }

    setLoading(true);
    try {
      const response = await axios.put("http://localhost:9999/users/edit-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data);
      alert("Profile updated successfully!");
      fetchUserData();
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
    setLoading(false);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="p-4 shadow-lg border-0 rounded-3" style={{ marginBottom: "50px" }}>
            <h2 className="text-center mb-4">Edit Profile</h2>
            <div className="text-center position-relative">
              <img
                src={user.avatar}
                alt="User Avatar"
                style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "3px solid #ddd" }}
              />
              <label
                htmlFor="avatarUpload"
                className="position-absolute"
                style={{
                  bottom: "5px", right: "5px", background: "#fff", padding: "6px", width: "35px", borderRadius: "50%", cursor: "pointer",
                  boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
                }}
              >
                <CameraOutlined style={{ fontSize: "18px" }} />
              </label>
              <input type="file" id="avatarUpload" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            </div>
            <Form className="mt-4">
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" value={user.name} onChange={handleChange} placeholder="Enter your name" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Bio</Form.Label>
                <Form.Control as="textarea" rows={3} name="bio" value={user.bio} onChange={handleChange} placeholder="Tell us about yourself" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control type="date" name="dob" value={user.dob ? new Date(user.dob).toISOString().split('T')[0] : ''} onChange={handleChange} />
              </Form.Group>
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate("/change-password")}>Change Password</Button>
                <Button variant="primary" onClick={handleSaveChanges} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile;