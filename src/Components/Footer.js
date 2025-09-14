import React from 'react';
import { MDBRow, MDBCol, MDBFooter, MDBIcon, MDBContainer } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
          .footer-mobile-layout {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .footer-brand-mobile {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 8px;
          }
          
          .footer-links-mobile {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            margin: 8px 0;
          }
          
          .footer-contact-mobile {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
            margin: 8px 0;
          }
          
          .admin-btn-mobile {
            padding: 4px 12px !important;
            font-size: 10px !important;
            border-radius: 15px;
            border: 1px solid #ff6b35 !important;
            color: #ff6b35 !important;
            background: transparent !important;
            transition: all 0.3s ease;
          }
          
          .admin-btn-mobile:hover {
            background: #ff6b35 !important;
            color: white !important;
            transform: scale(1.05);
          }
          
          .footer-link-mobile {
            color: #ccc !important;
            font-size: 13px;
            text-decoration: none;
            transition: all 0.3s ease;
            position: relative;
          }
          
          .footer-link-mobile:hover {
            color: #ff6b35 !important;
            transform: translateY(-1px);
          }
          
          .contact-icon-mobile {
            color: #ff6b35;
            font-size: 14px;
          }
          
          .gradient-text {
            background: linear-gradient(45deg, #ff6b35, #ff8c42);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          @media (max-width: 768px) {
            .footer-container {
              padding: 20px 15px !important;
            }
            
            .logo-footer {
              font-size: 1.1rem !important;
              font-weight: 600;
            }
          }
        `}
      </style>
      
      <MDBFooter className="footer-color text-white" id="contact" style={{ backgroundColor: '#1a1a1a', minHeight: 'auto' }}>
        <section className="py-4">
          <MDBContainer className="footer-container">
            
            {/* Desktop Layout */}
            <MDBRow className="align-items-center d-none d-md-flex">
              {/* Left Side - Brand & Contact */}
              <MDBCol md="6" className="text-start">
                <div className="d-flex align-items-center justify-content-start mb-2">
                  <h5 className="logo-footer text-uppercase mb-0 me-3" style={{ color: '#ff6b35', fontSize: '1.2rem' }}>🐕 MotluPets</h5>
                  <button 
                    className="btn btn-outline-light btn-sm"
                    onClick={() => navigate('/admin/login')}
                    style={{ borderRadius: '20px', fontSize: '12px' }}
                  >
                    <MDBIcon fas icon="shield-alt" className="me-1" />
                    Admin
                  </button>
                </div>
                <div className="d-flex align-items-center text-muted justify-content-start">
                  <span className="me-4">
                    <MDBIcon icon="envelope" className="me-2" style={{ color: '#ff6b35' }} />
                    supportMotluPets@1.com
                  </span>
                  <span>
                    <MDBIcon icon="phone" className="me-2" style={{ color: '#ff6b35' }} />
                    (+91) 7489476604
                  </span>
                </div>
              </MDBCol>

              {/* Right Side - Quick Links */}
              <MDBCol md="6" className="text-end">
                <div className="d-flex justify-content-end align-items-center flex-wrap">
                  <button 
                    onClick={() => navigate('/about')}
                    className="text-light me-4 text-decoration-none footer-link bg-transparent border-0 p-0"
                    style={{ cursor: 'pointer' }}
                  >
                    About
                  </button>
                  <a href="#contact" className="text-light me-4 text-decoration-none footer-link">Contact</a>
                  <a href="#!" className="text-light me-4 text-decoration-none footer-link">Privacy</a>
                  <a href="#!" className="text-light text-decoration-none footer-link">Terms</a>
                </div>
              </MDBCol>
            </MDBRow>
            
            {/* Mobile Layout */}
            <div className="d-md-none footer-mobile-layout">
              {/* Brand with Admin Button */}
              <div className="footer-brand-mobile">
                <h5 className="logo-footer text-uppercase mb-0 gradient-text" style={{ fontSize: '1.1rem' }}>
                  🐕 MotluPets
                </h5>
                <button 
                  className="admin-btn-mobile"
                  onClick={() => navigate('/admin/login')}
                >
                  <MDBIcon fas icon="shield-alt" className="me-1" style={{ fontSize: '8px' }} />
                  Admin
                </button>
              </div>
              
              {/* Quick Links */}
              <div className="footer-links-mobile">
                <button 
                  onClick={() => navigate('/about')}
                  className="footer-link-mobile bg-transparent border-0 p-0"
                  style={{ cursor: 'pointer' }}
                >
                  About
                </button>
                <a href="#contact" className="footer-link-mobile">Contact</a>
                <a href="#!" className="footer-link-mobile">Privacy</a>
                <a href="#!" className="footer-link-mobile">Terms</a>
              </div>
              
              {/* Contact Info */}
              <div className="footer-contact-mobile">
                <span className="text-muted" style={{ fontSize: '12px' }}>
                  <MDBIcon icon="envelope" className="me-2 contact-icon-mobile" />
                  Email Us
                </span>
                <span className="text-muted" style={{ fontSize: '12px' }}>
                  <MDBIcon icon="phone" className="me-2 contact-icon-mobile" />
                  (+91) 7489476604
                </span>
              </div>
            </div>

            {/* Bottom Copyright */}
            <hr style={{ borderColor: '#333', margin: '0.75rem 0' }} className="d-none d-md-block" />
            <div className="text-center mt-3 mt-md-0">
              <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                © 2025 <span className="d-none d-sm-inline">MotluPets. Made with ❤️ for pet lovers</span>
                <span className="d-sm-none">MotluPets ❤️</span>
              </p>
            </div>
          </MDBContainer>
        </section>
      </MDBFooter>
    </>
  );
}
