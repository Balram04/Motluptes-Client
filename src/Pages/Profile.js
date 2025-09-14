import React, { useState, useContext, useEffect } from 'react';
import { PetContext } from '../Context/Context';
import { 
  MDBContainer, 
  MDBRow, 
  MDBCol, 
  MDBCard, 
  MDBCardBody, 
  MDBIcon, 
  MDBBtn,
  MDBInput,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter
} from 'mdb-react-ui-kit';
import toast from 'react-hot-toast';

export default function Profile() {
  const { loginStatus } = useContext(PetContext);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Initialize user info with automatic population from login data
  const [userInfo, setUserInfo] = useState(() => {
    const getLocalStorageData = () => {
      // Get basic data from login/signup
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      
      return {
        name: localStorage.getItem('name') || userName || '',
        email: localStorage.getItem('email') || userEmail || '',
        phone: localStorage.getItem('phone') || '',
        address: localStorage.getItem('address') || '',
        city: localStorage.getItem('city') || '',
        state: localStorage.getItem('state') || '',
        pincode: localStorage.getItem('pincode') || '',
        petName: localStorage.getItem('petName') || '',
        petType: localStorage.getItem('petType') || '',
        petBreed: localStorage.getItem('petBreed') || '',
        memberSince: localStorage.getItem('memberSince') || new Date().toISOString().split('T')[0]
      };
    };
    
    return getLocalStorageData();
  });

  const [editForm, setEditForm] = useState({ ...userInfo });

  useEffect(() => {
    if (!loginStatus) {
      toast.error('Please login to view your profile');
      return;
    }

    // Auto-populate profile with login data when login status changes
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    if (userName || userEmail) {
      setUserInfo(prevInfo => ({
        ...prevInfo,
        name: prevInfo.name || userName || '',
        email: prevInfo.email || userEmail || ''
      }));
      
      setEditForm(prevForm => ({
        ...prevForm,
        name: prevForm.name || userName || '',
        email: prevForm.email || userEmail || ''
      }));
    }
  }, [loginStatus]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    // Save to localStorage (in a real app, this would be an API call)
    Object.keys(editForm).forEach(key => {
      localStorage.setItem(key, editForm[key]);
    });
    
    // Also update the login storage keys for consistency
    if (editForm.name) {
      localStorage.setItem('userName', editForm.name);
    }
    if (editForm.email) {
      localStorage.setItem('userEmail', editForm.email);
    }
    
    setUserInfo(editForm);
    setShowEditModal(false);
    toast.success('Profile updated successfully!');
  };

  const profileStats = [
    {
      icon: 'shopping-bag',
      label: 'Total Orders',
      value: localStorage.getItem('totalOrders') || '0',
      color: '#ff6b35'
    },
    {
      icon: 'heart',
      label: 'Wishlist Items',
      value: localStorage.getItem('wishlistCount') || '0',
      color: '#e74c3c'
    },
    {
      icon: 'star',
      label: 'Loyalty Points',
      value: localStorage.getItem('loyaltyPoints') || '0',
      color: '#f39c12'
    },
    {
      icon: 'calendar-alt',
      label: 'Member Since',
      value: new Date(userInfo.memberSince).getFullYear(),
      color: '#3498db'
    }
  ];

  if (!loginStatus) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <MDBIcon fas icon="user-slash" size="4x" className="text-muted mb-3" />
          <h4>Please Login</h4>
          <p className="text-muted">You need to be logged in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '7rem', paddingBottom: '2rem' }}>
      <MDBContainer>
        {/* Profile Header */}
        <MDBRow className="mb-4">
          <MDBCol md="12">
            <MDBCard className="shadow-sm">
              <MDBCardBody className="p-4">
                <MDBRow className="align-items-center">
                  <MDBCol md="3" className="text-center mb-3 mb-md-0">
                    <div 
                      className="profile-avatar-xl mx-auto d-flex justify-content-center align-items-center"
                      style={{
                        width: '120px',
                        height: '120px',
                        backgroundColor: '#ff6b35',
                        borderRadius: '50%',
                        fontSize: '3rem',
                        color: 'white'
                      }}
                    >
                      <MDBIcon fas icon="user" />
                    </div>
                  </MDBCol>
                  <MDBCol md="6">
                    <h3 className="mb-2" style={{ color: '#2c3e50' }}>
                      {userInfo.name || 'Pet Lover'}
                    </h3>
                    <p className="text-muted mb-2">
                      <MDBIcon fas icon="envelope" className="me-2" style={{ color: '#ff6b35' }} />
                      {userInfo.email || 'No email provided'}
                    </p>
                    <p className="text-muted mb-2">
                      <MDBIcon fas icon="phone" className="me-2" style={{ color: '#ff6b35' }} />
                      {userInfo.phone || 'No phone provided'}
                    </p>
                    <p className="text-muted mb-0">
                      <MDBIcon fas icon="map-marker-alt" className="me-2" style={{ color: '#ff6b35' }} />
                      {userInfo.city && userInfo.state ? `${userInfo.city}, ${userInfo.state}` : 'Location not provided'}
                    </p>
                  </MDBCol>
                  <MDBCol md="3" className="text-center text-md-end">
                    <MDBBtn 
                      color="warning" 
                      onClick={() => setShowEditModal(true)}
                      className="mb-2"
                    >
                      <MDBIcon fas icon="edit" className="me-2" />
                      Edit Profile
                    </MDBBtn>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Stats Cards */}
        <MDBRow className="mb-4">
          {profileStats.map((stat, index) => (
            <MDBCol md="3" key={index} className="mb-3">
              <MDBCard className="h-100 shadow-sm">
                <MDBCardBody className="text-center p-3">
                  <MDBIcon 
                    fas 
                    icon={stat.icon} 
                    size="2x" 
                    className="mb-3" 
                    style={{ color: stat.color }} 
                  />
                  <h4 className="mb-1" style={{ color: '#2c3e50' }}>{stat.value}</h4>
                  <p className="text-muted mb-0 small">{stat.label}</p>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))}
        </MDBRow>

        <MDBRow>
          {/* Personal Information */}
          <MDBCol md="6" className="mb-4">
            <MDBCard className="h-100 shadow-sm">
              <MDBCardBody className="p-4">
                <h5 className="mb-3" style={{ color: '#2c3e50' }}>
                  <MDBIcon fas icon="user" className="me-2" style={{ color: '#ff6b35' }} />
                  Personal Information
                </h5>
                <div className="info-item mb-3">
                  <strong>Full Name:</strong>
                  <span className="ms-2 text-muted">{userInfo.name || 'Not provided'}</span>
                </div>
                <div className="info-item mb-3">
                  <strong>Email:</strong>
                  <span className="ms-2 text-muted">{userInfo.email || 'Not provided'}</span>
                </div>
                <div className="info-item mb-3">
                  <strong>Phone:</strong>
                  <span className="ms-2 text-muted">{userInfo.phone || 'Not provided'}</span>
                </div>
                <div className="info-item mb-3">
                  <strong>Address:</strong>
                  <span className="ms-2 text-muted">{userInfo.address || 'Not provided'}</span>
                </div>
                <div className="info-item mb-3">
                  <strong>City:</strong>
                  <span className="ms-2 text-muted">{userInfo.city || 'Not provided'}</span>
                </div>
                <div className="info-item mb-0">
                  <strong>State & Pincode:</strong>
                  <span className="ms-2 text-muted">
                    {userInfo.state && userInfo.pincode ? `${userInfo.state} - ${userInfo.pincode}` : 'Not provided'}
                  </span>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          {/* Pet Information */}
          <MDBCol md="6" className="mb-4">
            <MDBCard className="h-100 shadow-sm">
              <MDBCardBody className="p-4">
                <h5 className="mb-3" style={{ color: '#2c3e50' }}>
                  <MDBIcon fas icon="paw" className="me-2" style={{ color: '#ff6b35' }} />
                  Pet Information
                </h5>
                <div className="info-item mb-3">
                  <strong>Pet Name:</strong>
                  <span className="ms-2 text-muted">{userInfo.petName || 'Not provided'}</span>
                </div>
                <div className="info-item mb-3">
                  <strong>Pet Type:</strong>
                  <span className="ms-2 text-muted">{userInfo.petType || 'Not provided'}</span>
                </div>
                <div className="info-item mb-3">
                  <strong>Breed:</strong>
                  <span className="ms-2 text-muted">{userInfo.petBreed || 'Not provided'}</span>
                </div>
                <div className="text-center mt-4">
                  <div 
                    className="pet-icon-placeholder d-flex justify-content-center align-items-center mx-auto"
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '50%',
                      border: '2px dashed #ff6b35'
                    }}
                  >
                    <MDBIcon fas icon="paw" size="2x" style={{ color: '#ff6b35' }} />
                  </div>
                  <p className="text-muted mt-2 small">Pet Photo Coming Soon</p>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Edit Profile Modal */}
        <MDBModal show={showEditModal} setShow={setShowEditModal} size="lg">
          <MDBModalDialog>
            <MDBModalContent>
              <MDBModalHeader>
                <MDBModalTitle>Edit Profile</MDBModalTitle>
                <MDBBtn 
                  className="btn-close" 
                  color="none" 
                  onClick={() => setShowEditModal(false)}
                ></MDBBtn>
              </MDBModalHeader>
              <MDBModalBody>
                <MDBRow>
                  <MDBCol md="6" className="mb-3">
                    <MDBInput
                      label="Full Name"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                    />
                  </MDBCol>
                  <MDBCol md="6" className="mb-3">
                    <MDBInput
                      label="Email"
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                    />
                  </MDBCol>
                  <MDBCol md="6" className="mb-3">
                    <MDBInput
                      label="Phone Number"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                    />
                  </MDBCol>
                  <MDBCol md="6" className="mb-3">
                    <MDBInput
                      label="Address"
                      name="address"
                      value={editForm.address}
                      onChange={handleInputChange}
                    />
                  </MDBCol>
                  <MDBCol md="4" className="mb-3">
                    <MDBInput
                      label="City"
                      name="city"
                      value={editForm.city}
                      onChange={handleInputChange}
                    />
                  </MDBCol>
                  <MDBCol md="4" className="mb-3">
                    <MDBInput
                      label="State"
                      name="state"
                      value={editForm.state}
                      onChange={handleInputChange}
                    />
                  </MDBCol>
                  <MDBCol md="4" className="mb-3">
                    <MDBInput
                      label="Pincode"
                      name="pincode"
                      value={editForm.pincode}
                      onChange={handleInputChange}
                    />
                  </MDBCol>
                  <MDBCol md="4" className="mb-3">
                    <MDBInput
                      label="Pet Name"
                      name="petName"
                      value={editForm.petName}
                      onChange={handleInputChange}
                    />
                  </MDBCol>
                  <MDBCol md="4" className="mb-3">
                    <MDBInput
                      label="Pet Type"
                      name="petType"
                      value={editForm.petType}
                      onChange={handleInputChange}
                      placeholder="e.g., Dog, Cat, Bird"
                    />
                  </MDBCol>
                  <MDBCol md="4" className="mb-3">
                    <MDBInput
                      label="Pet Breed"
                      name="petBreed"
                      value={editForm.petBreed}
                      onChange={handleInputChange}
                    />
                  </MDBCol>
                </MDBRow>
              </MDBModalBody>
              <MDBModalFooter>
                <MDBBtn color="secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </MDBBtn>
                <MDBBtn color="primary" onClick={handleSaveProfile}>
                  Save Changes
                </MDBBtn>
              </MDBModalFooter>
            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
      </MDBContainer>
    </div>
  );
}
