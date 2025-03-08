import React, { useState } from "react";
import { Container, Row, Col, Button, Card, Modal, Form } from "react-bootstrap";
import { UserOutlined, UploadOutlined, HeartOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const AlbumWallpaper = () => {
  const navigate = useNavigate();

  // Dữ liệu album (giả lập)
  const [album, setAlbum] = useState({
    name: "Modwa",
    description: "Free Wallpaper",
    owner: {
      name: "nazi",
      avatar: "https://i.pravatar.cc/50?img=3",
    },
     wallpapers: [
        { id: 1, url: "https://images.unsplash.com/photo-1519681393784-d120267933ba", likes: 150 },
        { id: 2, url: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0", likes: 200 },
        { id: 3, url: "https://images.unsplash.com/photo-1494475673543-6a6a27143fc8", likes: 180 },
        { id: 4, url: "https://images.unsplash.com/photo-1521747116042-5a810fda9664", likes: 250 },
        { id: 5, url: "https://images.unsplash.com/photo-1519681393784-d120267933ba", likes: 130 },
        { id: 6, url: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0", likes: 175 },
      ],
  });

  // Modal Upload / Edit
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "upload" hoặc "edit"
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageInfo, setImageInfo] = useState({ description: "", tags: "" });

  // Mở modal upload ảnh mới
  const handleUploadClick = () => {
    setModalType("upload");
    setSelectedImage(null);
    setImageFile(null);
    setImageInfo({ description: "", tags: "" });
    setShowModal(true);
  };

  // Mở modal chỉnh sửa ảnh
  const handleEditClick = (image) => {
    setModalType("edit");
    setSelectedImage(image);
    setImageInfo({ description: image.description, tags: image.tags });
    setShowModal(true);
  };

  // Xử lý chọn file ảnh
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(URL.createObjectURL(file));
    }
  };

  // Lưu ảnh mới vào album
  const handleSaveImage = () => {
    if (modalType === "upload" && imageFile) {
      setAlbum({
        ...album,
        wallpapers: [
          ...album.wallpapers,
          {
            id: Date.now(),
            url: imageFile,
            description: imageInfo.description,
            tags: imageInfo.tags,
            likes: 0,
          },
        ],
      });
    } else if (modalType === "edit" && selectedImage) {
      setAlbum({
        ...album,
        wallpapers: album.wallpapers.map((img) =>
          img.id === selectedImage.id ? { ...img, ...imageInfo } : img
        ),
      });
    }
    setShowModal(false);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-between align-items-center mb-4">
        {/* Chủ album */}
        <Col xs="auto" className="d-flex align-items-center gap-2">
          {album.owner.avatar ? (
            <img
              src={album.owner.avatar}
              alt="User Avatar"
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
          ) : (
            <UserOutlined style={{ fontSize: "40px" }} />
          )}
          <span className="fw-semibold">{album.owner.name}</span>
        </Col>

        {/* Tên Album */}
        <Col xs="auto" className="text-center">
          <h3 className="fw-bold">{album.name}</h3>
          <p className="text-muted">{album.description}</p>
        </Col>

        {/* Nút Thêm Ảnh */}
        <Col xs="auto">
          <Button variant="success" onClick={handleUploadClick}>
            <UploadOutlined className="me-1" />  Photos
          </Button>
        </Col>
      </Row>

      {/* Danh sách Ảnh */}
      <Row>
        {album.wallpapers.length > 0 ? (
          album.wallpapers.map((wallpaper) => (
            <Col md={3} sm={6} key={wallpaper.id} className="mb-4">
              <div
                className="image-container position-relative shadow-sm rounded overflow-hidden"
                style={{ cursor: "pointer", transition: "transform 0.3s ease-in-out" }}
                onClick={() => navigate(`/wallpaper/${wallpaper.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector(".image-overlay").style.opacity = "1";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector(".image-overlay").style.opacity = "0";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {/* Ảnh */}
                <Card className="border-0">
                  <Card.Img variant="top" src={wallpaper.url} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                  {/* Hiệu ứng hover */}
                  <div
                    className="image-overlay position-absolute w-100 h-100 d-flex justify-content-between align-items-end p-2"
                    style={{ top: 0, left: 0, background: "rgba(0, 0, 0, 0.4)", opacity: 0, transition: "opacity 0.3s ease-in-out" }}
                  >
                    {/* Lượt thích */}
                    <div className="text-white d-flex align-items-center">
                      <HeartOutlined style={{ fontSize: "18px", marginRight: "5px" }} />
                      <span>{wallpaper.likes}</span>
                    </div>
                    {/* Nút Edit */}
                    <Button variant="light" size="sm" onClick={(e) => { e.stopPropagation(); handleEditClick(wallpaper); }}>
                      <EditOutlined />
                    </Button>
                  </div>
                </Card>
              </div>
            </Col>
          ))
        ) : (
          <Col className="text-center mt-5">
            <h4 style={{ color: "red" }}>No Content Found!</h4>
          </Col>
        )}
      </Row>

      {/* Modal Upload / Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === "upload" ? "Upload New Photo" : "Edit Photo"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="border-dashed p-3" style={{ border: "2px dashed green", borderRadius: "10px" }}>
              {imageFile || selectedImage ? (
                <>
                <img src={imageFile || selectedImage.url} alt="Preview" style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }} />
                <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                </>
                
                
              ) : (
                <>
                  <p>Drag and drop to upload</p>
                  <p>OR</p>
                  <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                </>
              )}
            </div>
          </div>
          <Form.Group className="mt-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={2} value={imageInfo.description} onChange={(e) => setImageInfo({ ...imageInfo, description: e.target.value })} />
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>Tags</Form.Label>
            <Form.Control type="text" value={imageInfo.tags} onChange={(e) => setImageInfo({ ...imageInfo, tags: e.target.value })} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveImage}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AlbumWallpaper;