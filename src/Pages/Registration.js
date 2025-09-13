import React, { useState } from 'react';
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
import { useNavigate, Link } from 'react-router-dom';
import { axios } from '../Utils/Axios';
import toast from 'react-hot-toast';
import { FaPaw, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../Styles/Auth.css';

function Registration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

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
      return toast.error('Please fill in all fields');
    }

    if (trimmedName.length < 2) {
      setLoading(false);
      return toast.error('Name must be at least 2 characters long');
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setLoading(false);
      return toast.error('Name should only contain letters and spaces');
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setLoading(false);
      return toast.error('Please enter a valid email address');
    }

    if (trimmedPassword.length < 6) {
      setLoading(false);
      return toast.error('Password must be at least 6 characters long');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(trimmedPassword)) {
      setLoading(false);
      return toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    try {
      const userData = { 
        name: trimmedName, 
        email: trimmedEmail, 
        password: trimmedPassword 
      };
      
      const response = await axios.post('/api/users/register', userData);
      
      if (response?.data?.status === 'success') {
        toast.success('📧 Verification code sent! Please check your email.');
        
        // Clear form
        setFormData({ name: '', email: '', password: '' });
        
        // Navigate to OTP verification page immediately
        navigate('/verify-otp', { 
          state: { 
            email: trimmedEmail,
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
            toast.error('This email is already registered. Please use a different email or try logging in.');
          } else {
            toast.error(message || 'Invalid registration data');
          }
        } else if (status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(message || 'Registration failed');
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
      
      // Clear sensitive data on error
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      paddingTop: '100px',
      paddingBottom: '50px'
    }}>
      <MDBContainer>
        <MDBRow className="justify-content-center">
          <MDBCol md="6" lg="5" xl="4">
            <MDBCard className="shadow-5">
              <MDBCardBody className="p-5">
                {/* Logo Header */}
                <div className="text-center mb-4">
                  <FaPaw className="text-primary mb-3" size={40} />
                  <h2 className="fw-bold mb-2">Join MotluPets!</h2>
                  <p className="text-muted">Create your account to get started</p>
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
                      className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent me-3"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ zIndex: 5 }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="mb-4">
                    <small className="text-muted">
                      Password must be at least 6 characters with uppercase, lowercase, and number
                    </small>
                  </div>

                  {/* Register Button */}
                  <MDBBtn 
                    type="submit" 
                    color="primary" 
                    size="lg" 
                    className="w-100 mb-4"
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
                  <div className="text-center mb-4">
                    <p className="text-muted">Already have an account?</p>
                  </div>

                  {/* Login Link */}
                  <Link to="/login">
                    <MDBBtn 
                      color="secondary" 
                      size="lg" 
                      className="w-100" 
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
