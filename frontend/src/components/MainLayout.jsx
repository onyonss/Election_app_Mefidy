import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const MainLayout = ({ sidebar: Sidebar, children }) => (
  <Container
    fluid
    className="vh-100 d-flex p-0 m-0"
    style={{ fontFamily: 'Arial Rounded MT', overflow: 'hidden', width: '100vw' }}
  >
    <Col xs={12} md={3} className="p-0">
      <Sidebar />
    </Col>
    <Col
      xs={12}
      md={9}
      className="p-3 p-md-5"
      style={{
        backgroundColor: '#f1f3f6',
        overflowY: 'auto',
        maxHeight: '100vh',
        width: '78%',
      }}
    >
      {children}
    </Col>
    <style jsx>{`
      @media (max-width: 767px) {
        .p-3 {
          padding: 1rem !important;
        }
      }
    `}</style>
  </Container>
);

export default MainLayout;