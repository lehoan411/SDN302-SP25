import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, Button, Container, Row, Col, Form, Modal } from "react-bootstrap";
import { HeartOutlined, HeartFilled, WarningOutlined, DownloadOutlined, DeleteOutlined, ToolOutlined } from "@ant-design/icons";

const WallpaperDetail = () => {
    const { wallpaperId } = useParams();
    const [wallpaper, setWallpaper] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [user, setUser] = useState(null); // State lưu thông tin user
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedComment, setEditedComment] = useState("");
    const userId = localStorage.getItem("userId");
    const isFavorited = user?.favorited?.some(w => w._id === wallpaperId);
    const startEditing = (comment) => {
        setEditingCommentId(comment._id);
        setEditedComment(comment.body);
    };

    useEffect(() => {
        // Lấy thông tin wallpaper
        axios.get(`http://localhost:9999/wallpapers/${wallpaperId}`)
            .then(response => setWallpaper(response.data))
            .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));

        // Lấy thông tin user từ API
        if (userId) {
            axios.get(`http://localhost:9999/users/${userId}`)
                .then(response => {
                    setUser(response.data)
                    console.log("User data:", response.data);
                })
                .catch(error => console.error("Lỗi khi lấy user:", error));
        }
    }, [wallpaperId, userId]);

    if (!wallpaper || (userId && !user)) {
        return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
    }
    const handleDownload = async () => {
        try {
            const response = await fetch(wallpaper.imageUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = wallpaper.description ? `${wallpaper.description}.jpg` : "wallpaper.jpg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Giải phóng URL object
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Error downloading the image:", error);
        }
    };

    // Xử lý thích ảnh
    const handleLike = async () => {
        if (!userId) {
            alert("Please login to use this function!");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:9999/wallpapers/${wallpaperId}/like`, { userId });

            setUser(prev => {
                const isLiked = prev?.favorited?.some(w => w._id === wallpaperId);
                return {
                    ...prev,
                    favorited: isLiked
                        ? prev.favorited.filter(w => w._id !== wallpaperId) // Xóa nếu đã thích
                        : [...prev.favorited, { _id: wallpaperId }] // Thêm nếu chưa thích
                };
            });

            setWallpaper(prev => ({
                ...prev,
                likes: response.data.likes
            }));
        } catch (error) {
            console.error("Error when liking image:", error);
        }
    };
    // Gửi bình luận mới
    const handleCommentSubmit = async () => {
        if (!userId) {
            alert("Please login to use this function!");
            return;
        }
        if (newComment.trim() === "") return;

        try {
            const response = await axios.post(`http://localhost:9999/wallpapers/${wallpaperId}/comment`, {
                userId,
                body: newComment
            });

            setWallpaper(prev => ({
                ...prev,
                comments: response.data.comments
            }));

            setNewComment("");
        } catch (error) {
            console.error("Error when send comment", error);
        }
    };

    const saveEditedComment = async (commentId) => {
        if (!editedComment.trim()) return;

        try {
            const response = await axios.put(
                `http://localhost:9999/wallpapers/${wallpaperId}/comment/${commentId}/edit`,
                { body: editedComment }
            );

            setWallpaper(prev => ({ ...prev, comments: response.data.comments }));
            setEditingCommentId(null);
        } catch (error) {
            console.error("Lỗi khi chỉnh sửa comment:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const confirmDelete = window.confirm("Do you want to delete this comment?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`http://localhost:9999/wallpapers/${wallpaperId}/comment/${commentId}/delete`);
            setWallpaper(prev => ({
                ...prev,
                comments: response.data.comments
            }));
            alert("Delete comment successfully!");

        } catch (error) {
            console.error("Error when delete comment:", error);
        }
    };

    const handleReportSubmit = async () => {
        if (!userId) {
            alert("Please login to report this image!");
            return;
        }

        if (reportReason.trim() === "") {
            alert("Please provide a reason for reporting!");
            return;
        }

        try {
            await axios.post("http://localhost:9999/reports/create", {
                reason: reportReason,
                wallpaper: wallpaperId,
                reporter: userId,
            });

            alert("Report submitted successfully!");
            setShowReportModal(false);
            setReportReason("");
        } catch (error) {
            console.error("Error sending report:", error);
            alert("Failed to send report. Please try again!");
        }
    };


    // Gửi báo cáo
    const handleReportClick = () => setShowReportModal(true);
    const handleClose = () => setShowReportModal(false);

    return (
        <Container className="d-flex justify-content-center mt-4">
            <Card className="shadow-lg p-4 rounded-4" style={{ width: "80%", maxWidth: "900px", marginBottom: "50px" }}>
                <Row className="flex-column">
                    {/* Thông tin người đăng */}
                    <Col className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                            <img
                                src={wallpaper.createdBy?.avatar || "https://via.placeholder.com/40"}
                                alt="User Avatar"
                                className="rounded-circle me-2"
                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            />
                            <span className="fw-bold">{wallpaper.createdBy?.name || "Unknown"}</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <DownloadOutlined className="me-3 text-primary" onClick={handleDownload} style={{ fontSize: "22px", cursor: "pointer" }} />

                            {/* Nút tym */}
                            {isFavorited ? (
                                <HeartFilled
                                    className="me-2 text-danger"
                                    style={{ fontSize: "22px", cursor: "pointer" }}
                                    onClick={handleLike}
                                />
                            ) : (
                                <HeartOutlined
                                    className="me-2"
                                    style={{ fontSize: "22px", cursor: "pointer", color: "#aaa" }}
                                    onClick={handleLike}
                                />
                            )}
                            <span className="me-3">{wallpaper.likes}</span>

                            <WarningOutlined className="text-danger" style={{ fontSize: "20px", cursor: "pointer" }} onClick={handleReportClick} />
                        </div>
                    </Col>

                    {/* Mô tả ảnh */}
                    <Col className="mb-3">
                        <p className="text-start fw-bold">{wallpaper.description}</p>
                    </Col>

                    {/* Ảnh */}
                    <Col className="mb-3">
                        <img
                            src={wallpaper.imageUrl}
                            alt="Wallpaper"
                            className="img-fluid rounded-3"
                            style={{ height: "500px", width: "100%", objectFit: "cover" }}
                        />
                    </Col>

                    {/* Bình luận */}
                    <Col>
                        <h6 className="fw-bold">{wallpaper.comments.length} comments</h6>
                        <div className="bg-light p-3 rounded-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {wallpaper.comments.map((comment, index) => (
                                <div key={index} className="d-flex align-items-start bg-white p-2 rounded mb-2 shadow-sm">
                                    <img
                                        src={comment.user?.avatar || "https://via.placeholder.com/40"}
                                        alt="Avatar"
                                        className="rounded-circle me-2"
                                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                    />
                                    <div className="d-flex flex-column">
                                        <strong>{comment.user?.name || "Anonymous"}</strong>
                                        {editingCommentId === comment._id ? (
                                            <Form.Control
                                                type="text"
                                                value={editedComment}
                                                onChange={(e) => setEditedComment(e.target.value)}
                                                onBlur={() => saveEditedComment(comment._id)}
                                                autoFocus
                                            />
                                        ) : (
                                            <p className="mb-1 text-muted">{comment.body}</p>
                                        )}
                                        <small className="text-muted">{new Date(comment.date).toLocaleDateString()}</small>
                                    </div>
                                    {/* Nút xóa bình luận */}
                                    <div key={comment._id} className="d-flex align-items-center ms-auto">
                                        {comment.user._id === userId && (
                                            <div className="d-flex flex-column align-items-center ms-3">
                                                <ToolOutlined
                                                    className="text-primary mb-1"
                                                    style={{ cursor: "pointer", fontSize: "18px" }}
                                                    onClick={() => startEditing(comment)}
                                                />
                                                <DeleteOutlined
                                                    className="text-danger"
                                                    style={{ cursor: "pointer", fontSize: "18px" }}
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Ô nhập bình luận */}
                        {userId ? (
                            <div className="d-flex align-items-center mt-3">
                                <img
                                    src={user?.avatar || "https://via.placeholder.com/40"}
                                    alt="Your Avatar"
                                    className="rounded-circle me-2"
                                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                />
                                <div className="flex-grow-1">
                                    <Form.Control
                                        type="text"
                                        className="form-control"
                                        placeholder="Viết bình luận..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                </div>
                                <Button variant="success" className="fw-bold ms-2" onClick={handleCommentSubmit}>Send</Button>
                            </div>
                        ) : (
                            <Button variant="primary" className="fw-bold mt-2" onClick={() => alert("Chuyển đến trang đăng nhập!")}>Login to comment</Button>
                        )}
                    </Col>
                </Row>
            </Card>

            {/* Popup Report */}
            <Modal show={showReportModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Report description</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="reportReason">
                            <Form.Label>What is the issue?</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Please tell us why you are reporting this image"
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={handleClose}>Cancel</Button>
                    <Button variant="danger" onClick={handleReportSubmit}>Report</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default WallpaperDetail;