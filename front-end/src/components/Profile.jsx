import React, { useState } from "react";
import { Container, Row, Col, Button, Card, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FacebookOutlined, MailOutlined, PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined } from "@ant-design/icons";

const Profile = () => {
  const navigate = useNavigate();

  // Thông tin người dùng
  const [user, setUser] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    bio: "A passionate photographer capturing the beauty of the world.",
    dob: "1995-08-25",
    avatar: "https://i.pravatar.cc/150?img=3",
  });

  const [albums, setAlbums] = useState([
    { id: 1, name: "Modwa", images: 0, cover: "https://wallpapercat.com/w/full/4/6/1/1165730-3840x2160-desktop-4k-landscape-background.jpg" },
    { id: 2, name: "Sunset", images: 5, cover: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fDRrJTIwbGFuZHNjYXBlfGVufDB8fDB8fHww" },
    { id: 3, name: "Nature", images: 8, cover: "https://www.hdwallpapers.in/download/beautiful_landscape_4k-3840x2160.jpg" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "edit" hoặc "add"
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumName, setAlbumName] = useState("");

  const handleEditClick = (album) => {
    setModalType("edit");
    setSelectedAlbum(album);
    setAlbumName(album.name);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setModalType("add");
    setAlbumName("");
    setShowModal(true);
  };

  const handleSaveChanges = () => {
    if (modalType === "edit") {
      setAlbums(albums.map(album => (album.id === selectedAlbum.id ? { ...album, name: albumName } : album)));
    } else {
      setAlbums([...albums, { id: Date.now(), name: albumName, images: 0, cover: "https://via.placeholder.com/300" }]);
    }
    setShowModal(false);
  };

  return (
    <Container className="mt-5">
      {/* Thông tin người dùng */}
      <Row className="text-center mb-4">
        <Col>
          <img
            src={user.avatar}
            alt="User Avatar"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "10px"
            }}
          />
          <h2 className="mt-2">{user.name}</h2>
          <p className="text-muted">{user.email}</p>
          <p>{user.bio}</p>
          <p className="text-muted">DOB: {user.dob}</p>
        </Col>
      </Row>

      {/* Collections & New Album Button */}
      <Row className="mb-3 align-items-center">
        <Col xs="auto">
          <h4 className="fw-bold px-4">Collections</h4>
        </Col>
        <Col className="text-end">
          <Button variant="success" onClick={handleAddClick}>
            <PlusOutlined className="me-1" /> New Album
          </Button>
        </Col>
      </Row>

      {/* Danh sách Album */}
      <Row className="g-3" style={{ marginBottom: "70px" }}>
        {albums.map((album) => (
          <Col md={3} sm={6} key={album.id}>
            <div
              className="position-relative shadow-lg rounded-3"
              style={{
                overflow: "hidden",
                transition: "transform 0.3s ease-in-out",
                cursor: "pointer",
                position: "relative"
              }}
              onClick={() => navigate(`/profile/album/${album.id}`)} // Chuyển hướng đến AlbumWallpaper khi click
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
                {/* Ảnh Album */}
                <div style={{ position: "relative", overflow: "hidden" }}>
                  <Card.Img
                    variant="top"
                    src={album.cover}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      border: "none"
                    }}
                  />
                  {/* Nút Edit & Delete - Ẩn mặc định, chỉ hiển thị khi hover */}
                  <div
                    className="edit-delete-buttons"
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      right: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      opacity: 0,
                      transition: "opacity 0.3s ease-in-out"
                    }}
                  >
                    <Button variant="success" size="sm" onClick={(e) => { e.stopPropagation(); handleEditClick(album); }}>
                      <EditOutlined />
                    </Button>
                    <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setAlbums(albums.filter(a => a.id !== album.id)); }}>
                      <DeleteOutlined />
                    </Button>
                  </div>
                </div>

                {/* Thông tin Album */}
                <Card.Body className="text-center">
                  <Card.Title className="mb-2">{album.name}</Card.Title>
                  <span className="text-muted">
                    <PictureOutlined className="me-1" /> {album.images}
                  </span>
                </Card.Body>
              </Card>
            </div>
          </Col>
        ))}
      </Row>

      {/* Modal Add / Edit Album */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "edit" ? `Change Name album: ${selectedAlbum?.name}` : "Add New Album"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="albumName">
              <Form.Label>Album Name:</Form.Label>
              <Form.Control
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="Enter album name"
              />
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