
import React, { useState, useContext, useEffect } from 'react';
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
import { PetContext } from '../Context/Context';
import { axios } from '../Utils/Axios';
import toast from 'react-hot-toast';
import { FaPaw, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../Styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoginStatus, handleLoginSuccess } = useContext(PetContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Check if user just verified their email
  useEffect(() => {
    if (location.state?.justVerified) {
      toast.success('🎉 Email verified successfully! Please login to continue.');
      // Pre-fill email if available
      if (location.state?.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
    } else if (location.state?.message) {
      toast.info(location.state.message);
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

    const { email, password } = formData;
    const trimmedEmail = email.trim().toLowerCase();
    const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;

    // Enhanced Validation
    if (!trimmedEmail || !password) {
      setLoading(false);
      return toast.error('Please fill in all fields');
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setLoading(false);
      return toast.error('Please enter a valid email address');
    }

    if (password.length < 3) {
      setLoading(false);
      return toast.error('Password must be at least 3 characters long');
    }

    const endpoint = trimmedEmail === adminEmail ? '/api/admin/login' : '/api/users/login';
    const loginData = { email: trimmedEmail, password };

    try {
      const response = await axios.post(endpoint, loginData);
      
      // Check if response is successful
      if (response?.data?.status === 'success' && response?.data?.data) {
        const { data } = response.data;
        
        // Store authentication data (no JWT token needed - it's in HTTP-only cookies)
        if (trimmedEmail === adminEmail) {
          localStorage.setItem('role', 'admin');
          localStorage.setItem('userName', data.name || 'Admin');
          localStorage.setItem('userEmail', trimmedEmail);
        } else {
          if (!data.userID) {
            throw new Error('User ID not received from server');
          }
          localStorage.setItem('userID', data.userID);
          localStorage.setItem('userName', data.name || 'User');
          localStorage.setItem('userEmail', data.email || trimmedEmail);
          
          // Store user data for profile auto-fill if not already stored
          if (data.name && !localStorage.getItem('name')) {
            localStorage.setItem('name', data.name);
          }
          if ((data.email || trimmedEmail) && !localStorage.getItem('email')) {
            localStorage.setItem('email', data.email || trimmedEmail);
          }
        }

        toast.success(response.data?.message || 'Login successful!');
        setLoginStatus(true);
        
        // Update context with user data
        if (data.userID) {
          handleLoginSuccess(data);
        }
        
        // Clear form data
        setFormData({ email: '', password: '' });
        
        // Navigate based on role
        setTimeout(() => {
          navigate(trimmedEmail === adminEmail ? '/dashboard' : '/');
        }, 1000);
        
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message;
        const requiresVerification = error.response.data?.requiresVerification;
        const requiresRegistration = error.response.data?.requiresRegistration;
        
        if (status === 404 && requiresRegistration) {
          // User not registered - show signup prompt
          toast.error('Email not registered. Please sign up to create an account.');
          setTimeout(() => {
            navigate('/registration', { 
              state: { 
                email: trimmedEmail,
                message: 'Please create an account to continue'
              }
            });
          }, 2000);
        } else if (status === 401) {
          if (requiresVerification) {
            toast.error('Please verify your email before logging in.');
            // Navigate to OTP verification page
            setTimeout(() => {
              navigate('/verify-otp', { 
                state: { 
                  email: trimmedEmail,
                  message: 'Please verify your email to continue'
                }
              });
            }, 2000);
          } else {
            toast.error(message || 'Invalid email or password');
          }
        } else if (status === 400) {
          toast.error(message || 'Invalid input data');
        } else if (status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(message || 'Login failed');
        }
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection.');
      } else {
        // Other errors
        toast.error(error.message || 'Login failed. Please try again.');
      }
      
      // Clear sensitive form data on error
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
                  <h2 className="auth-title fw-bold mb-2">Welcome Back!</h2>
                  <p className="auth-subtitle text-muted">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit}>
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

                  {/* Login Button */}
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
                        Signing In...
                      </>
                    ) : (
                      <>
                        <MDBIcon fas icon="sign-in-alt" className="me-2" />
                        Sign In
                      </>
                    )}
                  </MDBBtn>

                  {/* Divider */}
                  <div className="auth-divider text-center mb-4">
                    <span>Don't have an account?</span>
                  </div>

                  {/* Registration Link */}
                  <Link to="/registration">
                    <MDBBtn 
                      color="secondary" 
                      size="lg" 
                      className="auth-btn-outline w-100" 
                      outline
                      disabled={loading}
                    >
                      <MDBIcon fas icon="user-plus" className="me-2" />
                      Create Account
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

export default Login;
