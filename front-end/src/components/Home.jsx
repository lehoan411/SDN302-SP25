import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { HeartOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hovered, setHovered] = useState(false);
  const categories = ["All", "nature", "landscape", "abstract"];

  return (
    <div>
      {/* Banner */}
      <div
        style={{
          backgroundImage: `url('./background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h2>The best free images shared by creators.</h2>
        <Form className="d-flex mt-3" style={{ width: "50%" }}>
          <Form.Control type="text" placeholder="Search ..." className="me-2" />
        </Form>
      </div>

      {/* Filter Buttons */}
      <Container className="my-4">
        <Row className="justify-content-center">
          {categories.map((category) => (
            <Col key={category} xs="auto">
              <Button
                variant={selectedCategory === category ? "dark" : "outline-dark"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Sample Image Grid */}
      <Container>
        <Row>
          <Col md={3}>
            <Link to="/wallpaper/1" style={{ textDecoration: "none", color: "inherit" }}>
              <div
                className="position-relative rounded shadow overflow-hidden"
                style={{ cursor: "pointer", marginBottom: "20px" }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                {/* Ảnh chính */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Anatomy_of_a_Sunset-2.jpg/1200px-Anatomy_of_a_Sunset-2.jpg"
                  alt="sample"
                  className="img-fluid rounded"
                />

                {/* Lớp phủ khi hover */}
                {hovered && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-between p-3"
                    style={{
                      background: "rgba(0, 0, 0, 0.4)",
                      borderRadius: "10px",
                    }}
                  >
                    {/* Icon yêu thích */}
                    <div className="d-flex justify-content-start">
                      <Button variant="light" className="rounded-circle p-2 border-0" style={{width: "40px", height: "40px"}}>
                        <HeartOutlined style={{ fontSize: "18px" }} />
                      </Button>
                    </div>

                    {/* Thông tin bên dưới */}
                    <div className="d-flex justify-content-between align-items-center">
                      <Button variant="success" className="fw-bold">Download</Button>
                      <div className="text-white d-flex align-items-center">
                        <span className="me-2">lehoan</span>
                        <Button variant="light" className="rounded-circle p-2 border-0" style={{width: "40px", height: "40px"}}>
                          <UserOutlined style={{ fontSize: "18px" }} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;