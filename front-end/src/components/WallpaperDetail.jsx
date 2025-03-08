import React, { useState } from "react";
import { Card, Button, Container, Row, Col, Modal, Form } from "react-bootstrap";
import { HeartOutlined, WarningOutlined, UserOutlined, RollbackOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
const WallpaperDetail = () => {
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");

    const handleReportClick = () => setShowReportModal(true);
    const handleClose = () => setShowReportModal(false);
    return (
        <Container className="d-flex justify-content-center mt-4">
            <Card className="shadow-lg p-4 rounded-4" style={{ width: "80%", maxWidth: "900px", border: "none", marginBottom: "50px" }}>
                <Row className="flex-column">
                    {/* Phần thông tin trên đầu ảnh */}
                    <Col className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                            <UserOutlined className="fs-4 border me-2 p-2 rounded-circle" />
                            <span className="fw-bold">lehoan</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <HeartOutlined className="me-2" style={{ fontSize: "20px", cursor: "pointer" }} />
                            <span className="me-3">150</span>
                            <WarningOutlined className="text-danger" style={{ fontSize: "20px", cursor: "pointer" }} onClick={handleReportClick} />
                        </div>

                    </Col>
                    {/* Mô tả ảnh */}
                    <Col className="mb-3">
                        <p className="text-start fw-bold">A beautiful sunset over the mountains</p>
                    </Col>

                    {/* Hình ảnh */}
                    <Col className="mb-3">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Anatomy_of_a_Sunset-2.jpg/1200px-Anatomy_of_a_Sunset-2.jpg"
                            alt="Wallpaper"
                            className="img-fluid rounded-3"
                        />
                    </Col>



                    {/* Bình luận */}
                    <Col>
                        <h6 className="fw-bold">1 comment</h6>

                        <div className="d-flex align-items-start bg-light p-2 rounded mb-2">
                            <span className="me-2">🌄</span>
                            <div>
                                <strong>commenter</strong>
                                <p className="mb-1">Absolutely stunning!</p>
                                <small className="text-muted">a year ago <Link><RollbackOutlined className="ms-2" /> Reply</Link></small>
                            </div>
                        </div>

                        {/* Nút đăng nhập để bình luận */}
                        <Button variant="success" className="fw-bold mt-2">Login to comment</Button>
                        <input type="text" className="form-control mt-2" placeholder="Write a comment..." />
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
                    <Button variant="light" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => { handleClose(); alert("Report submitted!"); }}>
                        Report
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default WallpaperDetail;