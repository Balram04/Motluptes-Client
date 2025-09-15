import React, { useState, useEffect } from 'react';
import { 
  MDBContainer, 
  MDBCard, 
  MDBCardBody, 
  MDBInput, 
  MDBBtn, 
  MDBIcon,
  MDBSpinner,
  MDBRow,
  MDBCol
} from 'mdb-react-ui-kit';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { axios } from '../Utils/Axios';
import toast from 'react-hot-toast';
import { FaPaw, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../Styles/Auth.css';

function Registration() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Handle redirected email from login page
  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
      try {
        toast.info(location.state.message || 'Please create an account to continue');
      } catch (toastError) {
        console.error('Toast error:', toastError);
      }
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { name, email, password } = formData;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Enhanced Validation
    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setLoading(false);
      try {
        return toast.error('Please fill in all fields');
      } catch (toastError) {
        console.error('Toast error:', toastError);
        alert('Please fill in all fields');
        return;
      }
    }

    if (trimmedName.length < 2) {
      setLoading(false);
      try {
        return toast.error('Name must be at least 2 characters long');
      } catch (toastError) {
        console.error('Toast error:', toastError);
        alert('Name must be at least 2 characters long');
        return;
      }
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setLoading(false);
      try {
        return toast.error('Name should only contain letters and spaces');
      } catch (toastError) {
        console.error('Toast error:', toastError);
        alert('Name should only contain letters and spaces');
        return;
      }
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setLoading(false);
      try {
        return toast.error('Please enter a valid email address');
      } catch (toastError) {
        console.error('Toast error:', toastError);
        alert('Please enter a valid email address');
        return;
      }
    }

    if (trimmedPassword.length < 6) {
      setLoading(false);
      try {
        return toast.error('Password must be at least 6 characters long');
      } catch (toastError) {
        console.error('Toast error:', toastError);
        alert('Password must be at least 6 characters long');
        return;
      }
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(trimmedPassword)) {
      setLoading(false);
      try {
        return toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      } catch (toastError) {
        console.error('Toast error:', toastError);
        alert('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        return;
      }
    }

    try {
      const userData = { 
        name: trimmedName, 
        email: trimmedEmail, 
        password: trimmedPassword 
      };
      
      const response = await axios.post('/api/users/register', userData);
      
      if (response?.data?.status === 'success') {
        try {
          toast.success('📧 Verification code sent! Please check your email.');
        } catch (toastError) {
          console.error('Toast error:', toastError);
        }
        
        // Store user data temporarily for auto-fill after verification
        localStorage.setItem('tempUserName', trimmedName);
        localStorage.setItem('tempUserEmail', trimmedEmail);
        
        // Clear form
        setFormData({ name: '', email: '', password: '' });
        
        // Navigate to OTP verification page immediately
        navigate('/verify-otp', { 
          state: { 
            email: trimmedEmail,
            name: trimmedName,
            message: 'Please check your email for the verification code'
          }
        });
        
      } else {
        throw new Error('Registration failed - invalid response');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;
        
        if (status === 400) {
          if (message?.includes('email')) {
            try {
              toast.error('This email is already registered. Please use a different email or try logging in.');
            } catch (toastError) {
              console.error('Toast error:', toastError);
              alert('This email is already registered. Please use a different email or try logging in.');
            }
          } else {
            try {
              toast.error(message || 'Invalid registration data');
            } catch (toastError) {
              console.error('Toast error:', toastError);
              alert(message || 'Invalid registration data');
            }
          }
        } else if (status >= 500) {
          try {
            toast.error('Server error. Please try again later.');
          } catch (toastError) {
            console.error('Toast error:', toastError);
            alert('Server error. Please try again later.');
          }
        } else {
          try {
            toast.error(message || 'Registration failed');
          } catch (toastError) {
            console.error('Toast error:', toastError);
            alert(message || 'Registration failed');
          }
        }
      } else if (error.request) {
        try {
          toast.error('Network error. Please check your connection.');
        } catch (toastError) {
          console.error('Toast error:', toastError);
          alert('Network error. Please check your connection.');
        }
      } else {
        try {
          toast.error(error.message || 'Registration failed. Please try again.');
        } catch (toastError) {
          console.error('Toast error:', toastError);
          alert(error.message || 'Registration failed. Please try again.');
        }
      }
      
      // Clear sensitive data on error
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <MDBContainer>
        <MDBRow className="justify-content-center">
          <MDBCol md="6" lg="5" xl="4">
            <MDBCard className="auth-card shadow-5">
              <MDBCardBody className="p-5">
                {/* Logo Header */}
                <div className="auth-header text-center mb-4">
                  <FaPaw className="auth-icon text-primary mb-3" size={40} />
                  <h2 className="auth-title fw-bold mb-2">Join MotluPets!</h2>
                  <p className="auth-subtitle text-muted">Create your account to get started</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Name Input */}
                  <div className="mb-4">
                    <MDBInput
                      label="Full Name"
                      id="name"
                      name="name"
                      type="text"
                      size="lg"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Email Input */}
                  <div className="mb-4">
                    <MDBInput
                      label="Email Address"
                      id="email"
                      name="email"
                      type="email"
                      size="lg"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="mb-4 position-relative">
                    <MDBInput
                      label="Password"
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      size="lg"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="mb-4">
                    <small className="form-validation-text text-muted">
                      Password must be at least 6 characters with uppercase, lowercase, and number
                    </small>
                  </div>

                  {/* Register Button */}
                  <MDBBtn 
                    type="submit" 
                    color="primary" 
                    size="lg" 
                    className="auth-btn w-100 mb-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <MDBSpinner size="sm" role="status" tag="span" className="me-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <MDBIcon fas icon="user-plus" className="me-2" />
                        Create Account
                      </>
                    )}
                  </MDBBtn>

                  {/* Divider */}
                  <div className="auth-divider text-center mb-4">
                    <span>Already have an account?</span>
                  </div>

                  {/* Login Link */}
                  <Link to="/login">
                    <MDBBtn 
                      color="secondary" 
                      size="lg" 
                      className="auth-btn-outline w-100" 
                      outline
                      disabled={loading}
                    >
                      <MDBIcon fas icon="sign-in-alt" className="me-2" />
                      Sign In
                    </MDBBtn>
                  </Link>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default Registration;
