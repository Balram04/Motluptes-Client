import React from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBIcon } from 'mdb-react-ui-kit';

export default function About() {
  return (
    <div className="about-page" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <MDBContainer>
        {/* Hero Section */}
        <MDBRow className="justify-content-center mb-5">
          <MDBCol md="10" lg="8" className="text-center">
            <h1 className="display-4 mb-4" style={{ color: '#ff6b35', fontWeight: 'bold' }}>
              🐕 About MottluPets
            </h1>
            <p className="lead text-muted">
              Your trusted companion in providing the best care and nutrition for your beloved pets
            </p>
          </MDBCol>
        </MDBRow>

        {/* Main Content */}
        <MDBRow className="mb-5">
          <MDBCol lg="6" className="mb-4">
            <MDBCard className="h-100 shadow-sm">
              <MDBCardBody className="p-4">
                <div className="text-center mb-3">
                  <MDBIcon fas icon="heart" size="3x" style={{ color: '#ff6b35' }} />
                </div>
                <h3 className="text-center mb-3" style={{ color: '#2c3e50' }}>Our Mission</h3>
                <p className="text-muted">
                  At MottluPets, we believe that every pet deserves the highest quality of care and nutrition. 
                  Our mission is to provide pet owners with premium products that enhance the health, happiness, 
                  and well-being of their furry family members.
                </p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol lg="6" className="mb-4">
            <MDBCard className="h-100 shadow-sm">
              <MDBCardBody className="p-4">
                <div className="text-center mb-3">
                  <MDBIcon fas icon="award" size="3x" style={{ color: '#ff6b35' }} />
                </div>
                <h3 className="text-center mb-3" style={{ color: '#2c3e50' }}>Our Values</h3>
                <p className="text-muted">
                  Quality, trust, and compassion are at the heart of everything we do. We carefully curate 
                  our products to ensure they meet the highest standards of safety and nutrition, because 
                  your pet's health is our priority.
                </p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Features Section */}
        <MDBRow className="mb-5">
          <MDBCol md="12">
            <h2 className="text-center mb-4" style={{ color: '#2c3e50' }}>Why Choose MottluPets?</h2>
          </MDBCol>
          
          <MDBCol md="4" className="mb-3">
            <div className="text-center">
              <MDBIcon fas icon="shield-alt" size="2x" className="mb-3" style={{ color: '#ff6b35' }} />
              <h5 style={{ color: '#2c3e50' }}>Premium Quality</h5>
              <p className="text-muted">
                All our products are sourced from trusted manufacturers and undergo rigorous quality checks.
              </p>
            </div>
          </MDBCol>

          <MDBCol md="4" className="mb-3">
            <div className="text-center">
              <MDBIcon fas icon="truck" size="2x" className="mb-3" style={{ color: '#ff6b35' }} />
              <h5 style={{ color: '#2c3e50' }}>Fast Delivery</h5>
              <p className="text-muted">
                Quick and reliable delivery service to ensure your pets never run out of their favorite food.
              </p>
            </div>
          </MDBCol>

          <MDBCol md="4" className="mb-3">
            <div className="text-center">
              <MDBIcon fas icon="phone-alt" size="2x" className="mb-3" style={{ color: '#ff6b35' }} />
              <h5 style={{ color: '#2c3e50' }}>24/7 Support</h5>
              <p className="text-muted">
                Our dedicated customer support team is always ready to help you with any questions or concerns.
              </p>
            </div>
          </MDBCol>
        </MDBRow>

        {/* Company Story */}
        <MDBRow className="mb-5">
          <MDBCol md="12">
            <MDBCard className="shadow-sm">
              <MDBCardBody className="p-4">
                <h3 className="text-center mb-4" style={{ color: '#2c3e50' }}>Our Story</h3>
                <p className="text-muted text-center">
                  Founded with a passion for pets and their well-being, MottluPets started as a small initiative 
                  to provide quality pet food and accessories. Over the years, we've grown into a trusted brand 
                  that serves thousands of happy pet families across the country.
                </p>
                <p className="text-muted text-center">
                  Our team consists of pet lovers, veterinary experts, and nutrition specialists who work 
                  tirelessly to ensure that every product we offer meets the unique needs of different pets 
                  and their owners.
                </p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Contact Information */}
        <MDBRow className="justify-content-center">
          <MDBCol md="8">
            <MDBCard className="shadow-sm" style={{ backgroundColor: '#ff6b35' }}>
              <MDBCardBody className="p-4 text-center text-white">
                <h4 className="mb-3">Get in Touch</h4>
                <div className="d-flex justify-content-center align-items-center flex-wrap">
                  <div className="me-4 mb-2">
                    <MDBIcon icon="envelope" className="me-2" />
                    supportMotluPets@doghub.com
                  </div>
                  <div className="mb-2">
                    <MDBIcon icon="phone" className="me-2" />
                    (+91) 7489476604
                  </div>
                </div>
                <p className="mt-3 mb-0">
                  Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}
