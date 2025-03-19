import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Modal, Form, Spinner} from "react-bootstrap";
import { UserOutlined, UploadOutlined, HeartOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const AlbumWallpaper = () => {
  const navigate = useNavigate();
  const { albumId } = useParams();
  const [wallpapers, setWallpapers] = useState([]);
  const [album, setAlbum] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "upload" hoặc "edit"
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageInfo, setImageInfo] = useState({ description: "", tags: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, [albumId]);

  const fetchData = async () => {
    try {
      const albumResponse = await axios.get(`http://localhost:9999/albums/${albumId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setAlbum(albumResponse.data);

      const wallpapersResponse = await axios.get(`http://localhost:9999/wallpapers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const filteredWallpapers = wallpapersResponse.data.filter((wp) => wp.fromAlbum?._id === albumId);
      setWallpapers(filteredWallpapers);
    } catch (error) {
      console.error("Error fetching album or wallpapers:", error);
    }
  };

  const handleUploadClick = () => {
    setModalType("upload");
    setSelectedImage(null);
    setImageFile(null);
    setPreviewImage(null);
    setImageInfo({ description: "", tags: "" });
    setShowModal(true);
  };

  const handleEditClick = (image) => {
    setModalType("edit");
    setSelectedImage(image);
    setImageInfo({ description: image.description, tags: image.tags.join(", ") });
    setPreviewImage(image.imageUrl);
    setShowModal(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (!token) {
      alert("Please login to perform this action.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("albumId", albumId);
    formData.append("description", imageInfo.description);
    formData.append("tags", imageInfo.tags);

    try {
      let response;
      if (modalType === "upload" && imageFile) {
        formData.append("imageUrl", imageFile);
        response = await axios.post(`http://localhost:9999/wallpapers/create`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setWallpapers([...wallpapers, response.data]);
        alert("Image uploaded successfully!");
      } else if (modalType === "edit" && selectedImage) {
        if (imageFile) formData.append("imageUrl", imageFile);
        response = await axios.put(`http://localhost:9999/wallpapers/${selectedImage._id}/edit-wallpaper`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setWallpapers(wallpapers.map((wp) => (wp._id === selectedImage._id ? response.data : wp)));
        alert("Image updated successfully!");
      }

      // Chỉ đóng modal nếu thao tác thành công
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Failed to process image. Please try again!");
      console.error("Error saving image:", error);
    }

    setLoading(false);
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image? This action cannot be undone!")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:9999/wallpapers/${imageId}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWallpapers(wallpapers.filter((img) => img._id !== imageId));
      alert("Image deleted successfully!");
      fetchData();
    } catch (error) {
      alert("Failed to delete image. Please try again!");
      console.error("Error deleting image:", error);
    }
  };

  if (!album) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  return (
    <Container className="mt-5">
      {/* Thông tin Album */}
      <Row className="justify-content-between align-items-center mb-4">
        <Col xs="auto" className="d-flex align-items-center gap-2">
          {album.author.avatar ? (
            <img
              src={album.author.avatar}
              alt="User Avatar"
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
          ) : (
            <UserOutlined style={{ fontSize: "40px" }} />
          )}
          <span className="fw-semibold">{album.author.name}</span>
        </Col>

        {/* Ảnh album + Tên album */}
        <Col xs="auto" className="text-center">
          <img src={album.albumImage} alt="Album Cover" style={{ width: "80px", height: "80px", borderRadius: "10px" }} />
          <h3 className="fw-bold">{album.albumName}</h3>
          <p className="text-muted">{album.wallpapers.length} images</p>
        </Col>

        {/* Nút Thêm Ảnh */}
        <Col xs="auto">
          <Button variant="success" onClick={handleUploadClick}>
            <UploadOutlined className="me-1" /> Upload Photo
          </Button>
        </Col>
      </Row>

      {/* Danh sách Ảnh */}
      <Row>
        {album.wallpapers.length > 0 ? (
          album.wallpapers.map((wallpaper) => (
            <Col md={3} sm={6} key={wallpaper._id} className="mb-4">
              <div
                className="image-container position-relative shadow-sm rounded overflow-hidden"
                style={{ cursor: "pointer", transition: "transform 0.3s ease-in-out" }}
                onClick={() => navigate(`/wallpaper/${wallpaper._id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector(".image-overlay").style.opacity = "1";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector(".image-overlay").style.opacity = "0";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Card className="border-0">
                  <Card.Img variant="top" src={wallpaper.imageUrl} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                  {/* Hiệu ứng hover */}
                  <div
                    className="image-overlay position-absolute w-100 h-100 d-flex flex-column justify-content-between p-2"
                    style={{ top: 0, left: 0, background: "rgba(0, 0, 0, 0.4)", opacity: 0, transition: "opacity 0.3s ease-in-out" }}
                  >
                    {/* Nút Delete */}
                    <Button variant="danger" size="sm" style={{ alignSelf: "flex-end" }} onClick={(e) => { e.stopPropagation(); handleDeleteImage(wallpaper._id); }}>
                      <DeleteOutlined />
                    </Button>
                    {/* Lượt thích và Nút Edit */}
                    <div className="d-flex justify-content-between">
                      <div className="text-white d-flex align-items-center">
                        <HeartOutlined style={{ fontSize: "18px", marginRight: "5px" }} />
                        <span>{wallpaper.likes}</span>
                      </div>
                      <Button variant="light" size="sm" onClick={(e) => { e.stopPropagation(); handleEditClick(wallpaper); }}>
                        <EditOutlined />
                      </Button>
                    </div>
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
      {/* Modal Upload / Edit Ảnh */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === "upload" ? "Upload New Photo" : "Edit Photo"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            {previewImage && <img src={previewImage} alt="Preview" style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }} />}
            <Form.Control type="file" accept="image/*" onChange={handleFileChange} className="mt-3" />
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
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveImage} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AlbumWallpaper;