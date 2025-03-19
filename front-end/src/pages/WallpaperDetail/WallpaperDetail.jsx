import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Container, Row, Col, Form, Modal } from "react-bootstrap";
import { HeartOutlined, HeartFilled, WarningOutlined, DownloadOutlined, DeleteOutlined, ToolOutlined } from "@ant-design/icons";

const WallpaperDetail = () => {
    const { wallpaperId } = useParams();
    const [wallpaper, setWallpaper] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [user, setUser] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedComment, setEditedComment] = useState("");
    const [favorited, setFavorited] = useState(false);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    useEffect(() => {
        fetchData();
    }, [wallpaperId]);

    const fetchData = async () => {
        try {
            const wallpaperResponse = await axios.get(`http://localhost:9999/wallpapers/${wallpaperId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setWallpaper(wallpaperResponse.data);

            if (token) {
                const userResponse = await axios.get("http://localhost:9999/users/get-by-id", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(userResponse.data);

                const isLiked = userResponse.data.favorited.some((fav) => fav._id === wallpaperId);
                setFavorited(isLiked);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    if (!wallpaper) {
        return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
    }

    const handleDownload = async () => {
        if (!token) {
            alert('Please Login to download this image!');
            return;
        }
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

            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Error downloading the image:", error);
        }
    };

    const handleLike = async () => {
        if (!token) {
            alert("Please login to like this image!");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:9999/wallpapers/${wallpaperId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setFavorited((prev) => !prev);
            setWallpaper((prev) => ({
                ...prev,
                likes: response.data.likes,
            }));
        } catch (error) {
            console.error("Error when liking image:", error);
        }
    };

    const handleCommentSubmit = async () => {
        if (!token) {
            alert("Please login to use this function!");
            return;
        }
        if (newComment.trim() === "") return;

        try {
            const response = await axios.post(`http://localhost:9999/wallpapers/${wallpaperId}/comment`, {
                body: newComment,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setWallpaper((prev) => ({
                ...prev,
                comments: response.data.comments,
            }));

            setNewComment("");
        } catch (error) {
            console.error("Error when sending comment:", error);
        }
    };

    const saveEditedComment = async (commentId) => {
        if (!editedComment.trim()) return;

        try {
            const response = await axios.put(
                `http://localhost:9999/wallpapers/${wallpaperId}/comment/${commentId}/edit`,
                { body: editedComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setWallpaper((prev) => ({
                ...prev,
                comments: prev.comments.map((c) =>
                    c._id === commentId ? { ...c, body: editedComment } : c
                ),
            }));

            setEditingCommentId(null);
        } catch (error) {
            console.error("Error when editing comment:", error);
        }
    };
    const startEditingComment = (comment) => {
        setEditingCommentId(comment._id);
        setEditedComment(comment.body);
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditedComment("");
    };

    const handleDeleteComment = async (commentId) => {
        const confirmDelete = window.confirm("Do you want to delete this comment?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:9999/wallpapers/${wallpaperId}/comment/${commentId}/delete`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Xóa comment khỏi state ngay lập tức
            setWallpaper((prev) => ({
                ...prev,
                comments: prev.comments.filter((comment) => comment._id !== commentId),
            }));

            alert("Comment deleted successfully!");
        } catch (error) {
            console.error("Error when deleting comment:", error);
        }
    };


    const handleReportSubmit = async () => {
        if (!token) {
            alert("Please login to report this image!");
            return;
        }

        if (reportReason.trim() === "") {
            alert("Please provide a reason for reporting!");
            return;
        }

        try {
            await axios.post(
                "http://localhost:9999/reports/create",
                {
                    reason: reportReason,
                    wallpaper: wallpaperId,  // Không cần gửi `reporter: user._id`, Backend sẽ lấy từ token
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert("Report submitted successfully!");
            setShowReportModal(false);
            setReportReason("");
        } catch (error) {
            console.error("Error sending report:", error);
            alert("Failed to send report. Please try again!");
        }
    };

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
                            {favorited ? (
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

                            <WarningOutlined className="text-danger" style={{ fontSize: "20px", cursor: "pointer" }} onClick={() => setShowReportModal(true)} />
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
                                <div key={comment._id} className="d-flex align-items-start bg-white p-2 rounded mb-2 shadow-sm">
                                    <img
                                        src={comment.user?.avatar || "https://via.placeholder.com/40"}
                                        alt="Avatar"
                                        className="rounded-circle me-2"
                                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                    />
                                    <div className="d-flex flex-column flex-grow-1">
                                        <strong>{comment.user?.name || "Anonymous"}</strong>
                                        {editingCommentId === comment._id ? (
                                            <Form.Control
                                                type="text"
                                                value={editedComment}
                                                onChange={(e) => setEditedComment(e.target.value)}
                                                className="mb-2"
                                            />
                                        ) : (
                                            <p className="mb-1 text-muted">{comment.body}</p>
                                        )}
                                        <small className="text-muted">{new Date(comment.date).toLocaleDateString()}</small>
                                    </div>

                                    {/* Hiển thị nút sửa/xóa chỉ khi là comment của user hiện tại */}
                                    {comment.user && comment.user._id === user?._id &&  (
                                        <div className="d-flex flex-column align-items-end ms-3">
                                            {editingCommentId === comment._id ? (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="mb-1"
                                                        onClick={() => saveEditedComment(comment._id)}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={cancelEditing}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <ToolOutlined
                                                        className="text-primary mb-2"
                                                        style={{ cursor: "pointer", fontSize: "18px" }}
                                                        onClick={() => startEditingComment(comment)}
                                                    />
                                                    <DeleteOutlined
                                                        className="text-danger"
                                                        style={{ cursor: "pointer", fontSize: "18px" }}
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Ô nhập bình luận */}
                        {token ? (
                            <div className="d-flex align-items-center mt-3">
                                <img
                                    src={user?.avatar || "https://via.placeholder.com/40"}
                                    alt="Your Avatar"
                                    className="rounded-circle me-2"
                                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="flex-grow-1 me-2"
                                />
                                <Button variant="success" onClick={handleCommentSubmit}>Send</Button>
                            </div>
                        ) : (
                            <Button variant="primary" onClick={() => navigate("/login")}>Login to comment</Button>
                        )}
                    </Col>
                </Row>
            </Card>

            {/* Popup Report */}
            <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
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
                    <Button variant="light" onClick={() => setShowReportModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleReportSubmit}>Report</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default WallpaperDetail;