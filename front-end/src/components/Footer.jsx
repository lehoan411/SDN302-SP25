import React from "react";
import { Container, Row, Col } from "react-bootstrap";
const Footer = () => {
    return (
        <footer className="bg-light py-4">
          <Container>
            <Row className="align-items-start">
              {/* Logo và mô tả */}
              <Col md={4}>
                <h3 className="fw-bold text-success">Get Images</h3>
                <p className="text-muted">
                  Ouality stock images shared by our talented community.
                </p>
              </Col>
    
              {/* Cột Discover */}
              <Col md={4}>
                <h5 className="fw-bold">Discover</h5>
                <ul className="list-unstyled">
                  <li><a href="#" className="text-decoration-none text-dark">Fully Wallpaper</a></li>
                  <li><a href="#" className="text-decoration-none text-dark">Mostly Liked Photos</a></li>
                  <li><a href="#" className="text-decoration-none text-dark">Our Contributors</a></li>
                  <li><a href="#" className="text-decoration-none text-dark">Collections/Albums</a></li>
                </ul>
              </Col>
    
              {/* Cột About Us */}
              <Col md={4}>
                <h5 className="fw-bold">About us</h5>
                <ul className="list-unstyled">
                  <li><a href="#" className="text-decoration-none text-dark">About Us</a></li>
                  <li><a href="#" className="text-decoration-none text-dark">Privacy Policy</a></li>
                  <li><a href="#" className="text-decoration-none text-dark">Terms of Service</a></li>
                </ul>
              </Col>
            </Row>
          </Container>
        </footer>
      );
}

export default Footer;