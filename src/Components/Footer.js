import React from 'react';
import { MDBRow, MDBCol, MDBFooter, MDBIcon, MDBContainer } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <>
      <MDBFooter className="footer-color text-white footer-sticky" id="contact" style={{ backgroundColor: '#1a1a1a', minHeight: 'auto' }}>
        <section className="py-4">
          <MDBContainer>
            <MDBRow className="align-items-center">
              {/* Left Side - Brand & Contact */}
              <MDBCol md="6" className="mb-3 mb-md-0 text-center text-md-start">
                <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                  <h5 className="logo-footer text-uppercase mb-0 me-3" style={{ color: '#ff6b35', fontSize: '1.2rem' }}>🐕 MotluPets</h5>
                  <button 
                    className="btn btn-outline-light btn-sm d-none d-md-inline-block"
                    onClick={() => navigate('/admin/login')}
                    style={{ borderRadius: '20px', fontSize: '12px' }}
                  >
                    <MDBIcon fas icon="shield-alt" className="me-1" />
                    Admin
                  </button>
                </div>
                <div className="d-flex align-items-center text-muted justify-content-center justify-content-md-start flex-column flex-md-row">
                  <span className="me-md-4 mb-1 mb-md-0">
                    <MDBIcon icon="envelope" className="me-2" style={{ color: '#ff6b35' }} />
                    <span className="d-none d-sm-inline">supportMotluPets@1.com</span>
                    <span className="d-sm-none">Email Us</span>
                  </span>
                  <span>
                    <MDBIcon icon="phone" className="me-2" style={{ color: '#ff6b35' }} />
                    (+91) 7489476604
                  </span>
                </div>
              </MDBCol>

              {/* Right Side - Quick Links */}
              <MDBCol md="6" className="text-center text-md-end">
                <div className="d-flex justify-content-center justify-content-md-end align-items-center flex-wrap">
                  <button 
                    onClick={() => navigate('/about')}
                    className="text-light me-3 me-md-4 text-decoration-none footer-link bg-transparent border-0 p-0"
                    style={{ cursor: 'pointer' }}
                  >
                    About
                  </button>
                  <a href="#contact" className="text-light me-3 me-md-4 text-decoration-none footer-link d-none d-sm-inline">Contact</a>
                  <a href="#!" className="text-light me-3 me-md-4 text-decoration-none footer-link d-none d-md-inline">Privacy</a>
                  <a href="#!" className="text-light text-decoration-none footer-link d-none d-md-inline">Terms</a>
                </div>
                {/* Mobile Admin Button */}
                <div className="mt-2 d-md-none">
                  <button 
                    className="btn btn-outline-light btn-sm"
                    onClick={() => navigate('/admin/login')}
                    style={{ borderRadius: '20px', fontSize: '12px' }}
                  >
                    <MDBIcon fas icon="shield-alt" className="me-1" />
                    Admin
                  </button>
                </div>
              </MDBCol>
            </MDBRow>

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
