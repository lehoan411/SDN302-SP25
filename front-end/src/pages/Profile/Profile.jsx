import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, UploadOutlined, HeartFilled } from "@ant-design/icons";

const Profile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumName, setAlbumName] = useState("");
  const [albumImage, setAlbumImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [activeTab, setActiveTab] = useState("collections");
  const [favorited, setFavorited] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`http://localhost:9999/users/${userId}`);
      setUser(response.data);
      setAlbums(response.data.albums);
      setFavorited(response.data.favorited);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  const handleEditClick = (album) => {
    setModalType("edit");
    setSelectedAlbum(album);
    setAlbumName(album.albumName);
    setPreviewImage(album.albumImage || "");
    setShowModal(true);
  };

  const handleAddClick = () => {
    setModalType("add");
    setAlbumName("");
    setPreviewImage("");
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAlbumImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (!albumName.trim()) {
      alert("Album name cannot be empty!");
      return;
    }

    const formData = new FormData();
    formData.append("albumName", albumName);
    formData.append("userId", userId);
    if (albumImage) {
      formData.append("albumImage", albumImage);
    }

    try {
      let response;
      if (modalType === "add") {
        response = await axios.post(`http://localhost:9999/albums/create`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "multipart/form-data",
          },

        });
      } else if (modalType === "edit" && selectedAlbum) {
        response = await axios.put(`http://localhost:9999/albums/${selectedAlbum._id}/edit-album`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response?.data?.album) {
        alert(`Album ${modalType === "add" ? "created" : "updated"} successfully!`);
        setAlbums((prevAlbums) =>
          modalType === "add"
            ? [...prevAlbums, response.data.album]
            : prevAlbums.map((album) =>
              album._id === selectedAlbum._id ? response.data.album : album
            )
        );
        setShowModal(false);
        fetchUserData();
      } else {
        alert("Something went wrong, please try again.");
      }
    } catch (error) {
      console.error(`Error ${modalType === "add" ? "creating" : "editing"} album:`, error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm("Are you sure you want to delete this album? This action cannot be undone!")) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:9999/albums/${albumId}/delete`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      if (response.status === 200) {
        alert("Album deleted successfully!");
        setAlbums((prevAlbums) => prevAlbums.filter(album => album._id !== albumId));
        fetchUserData();
      } else {
        alert("Failed to delete album. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting album:", error);
      alert("An error occurred while deleting the album.");
    }
  };

  if (!user) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  return (
    <Container className="mt-5">
      {/* Thông tin người dùng */}
      <Row className="text-center mb-4">
        <Col>
          <img
            src={user.avatar || "https://i.pravatar.cc/150"}
            alt="User Avatar"
            style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px" }}
          />
          <h2 className="mt-2">{user.name}</h2>
          <p className="text-muted">{user.email}</p>
          <p>{user.bio}</p>
          <p className="text-muted">DOB: {new Date(user.dob).toLocaleDateString()}</p>
        </Col>
      </Row>

      {/* Collections & New Album Button */}
      <Row className="mb-3 align-items-center">
        <Col xs="auto">
          <Button
            variant={activeTab === "collections" ? "primary" : "outline-primary"}
            className="fw-bold px-4"
            onClick={() => setActiveTab("collections")}
          >
            Collections
          </Button>
          <Button
            variant={activeTab === "favorited" ? "primary" : "outline-primary"}
            className="fw-bold px-4 ms-2"
            onClick={() => setActiveTab("favorited")}
          >
            Favorited
          </Button>
        </Col>
        {activeTab === "collections" && (
          <Col className="text-end">
            <Button variant="success" onClick={handleAddClick}>
              <PlusOutlined className="me-1" /> New Album
            </Button>
          </Col>
        )}
      </Row>

      {/* Danh sách Album */}
      {activeTab === "collections" && (
        <Row className="g-3" style={{ marginBottom: "70px" }}>
          {
            albums.length > 0 ? (
              albums.map((album) => (
                album && album.albumImage ? (
                  <Col md={3} sm={6} key={album._id}>
                    <div
                      className="position-relative shadow-lg rounded-3"
                      style={{ overflow: "hidden", transition: "transform 0.3s ease-in-out", cursor: "pointer" }}
                      onClick={() => navigate(`/profile/album/${album._id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.querySelector(".edit-delete-buttons").style.opacity = "1";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.querySelector(".edit-delete-buttons").style.opacity = "0";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <Card className="border-0">
                        <div style={{ position: "relative", overflow: "hidden" }}>
                          <Card.Img variant="top" src={album.albumImage || "https://via.placeholder.com/300"} style={{ width: "100%", height: "200px", objectFit: "cover", border: "none" }} />
                          <div className="edit-delete-buttons" style={{ position: "absolute", top: "10px", left: "10px", right: "10px", display: "flex", justifyContent: "space-between", opacity: 0, transition: "opacity 0.3s ease-in-out" }}>
                            <Button variant="success" size="sm" onClick={(e) => { e.stopPropagation(); handleEditClick(album); }}>
                              <EditOutlined />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAlbum(album._id);
                              }}
                            >
                              <DeleteOutlined />
                            </Button>
                          </div>
                        </div>
                        <Card.Body className="text-center">
                          <Card.Title className="mb-2">{album.albumName}</Card.Title>
                          <span className="text-muted"><PictureOutlined className="me-1" /> {album.wallpapers.length}</span>
                        </Card.Body>
                      </Card>
                    </div>
                  </Col>
                ) : null
              ))
            ) : (
              <Col className="text-center">
                <p className="text-muted">No albums available.</p>
              </Col>
            )}
        </Row>
      )}

      {/* Hiển thị danh sách ảnh đã thích */}
      {activeTab === "favorited" && (
        <Row className="g-3" style={{ marginBottom: "70px" }}>
          {favorited.length > 0 ? (
            favorited.map((wallpaper) => (
              <Col md={3} sm={6} key={wallpaper._id}>
                <div
                  className="position-relative shadow-lg rounded-3"
                  style={{ cursor: "pointer", overflow: "hidden" }}
                  onClick={() => navigate(`/wallpaper/${wallpaper._id}`)}
                >
                  <img
                    src={wallpaper.imageUrl}
                    alt={wallpaper.description}
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px" }}
                  />
                  <div
                    className="position-absolute bottom-0 start-0 bg-dark text-white p-1 rounded"
                    style={{ opacity: 0.8 }}
                  >
                    <HeartFilled style={{ color: "red" }} /> {wallpaper.likes}
                  </div>
                </div>
              </Col>
            ))
          ) : (
            <Col className="text-center">
              <p className="text-muted">No favorited images yet.</p>
            </Col>
          )}
        </Row>
      )}

      {/* Modal Add / Edit Album */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === "edit" ? `Edit Album: ${selectedAlbum?.albumName}` : "Add New Album"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="albumName">
              <Form.Label>Album Name:</Form.Label>
              <Form.Control type="text" value={albumName} onChange={(e) => setAlbumName(e.target.value)} placeholder="Enter album name" />
            </Form.Group>
            <Form.Group controlId="albumImage" className="mt-3">
              <Form.Label>Album Cover Image:</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
              {previewImage && <img src={previewImage} alt="Preview" style={{ width: "100%", height: "200px", objectFit: "cover", marginTop: "10px", borderRadius: "10px" }} />}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleSaveChanges}>Save changes</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;