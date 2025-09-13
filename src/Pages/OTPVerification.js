import React, { useState, useEffect } from 'react';
import { 
  MDBContainer, 
  MDBCard, 
  MDBCardBody, 
  MDBBtn, 
  MDBIcon,
  MDBSpinner,
  MDBRow,
  MDBCol
} from 'mdb-react-ui-kit';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { axios } from '../Utils/Axios';
import toast from 'react-hot-toast';
import { FaEnvelope, FaClock, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import OTPInput from '../Components/OTPInput';
import '../Styles/Auth.css';
import '../Styles/OTP.css';

function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes countdown
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState('');
  
  const email = location.state?.email;

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('No email provided. Please register first.');
      navigate('/registration');
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOTPChange = (value) => {
    setOtp(value);
    
    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      setTimeout(() => {
        handleVerification(value);
      }, 500);
    }
  };

  const handleVerification = async (otpValue = otp) => {
    if (loading) return; // Prevent double submission
    
    setLoading(true);

    if (!otpValue || otpValue.length !== 6) {
      setLoading(false);
      return toast.error('Please enter a valid 6-digit verification code');
    }

    try {
      const response = await axios.post('/api/users/verify-otp', {
        email,
        otp: otpValue
      });

      if (response?.data?.status === 'success') {
        toast.success('✅ Email verified successfully!');
        
        // Navigate to login page after verification
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Account verified! Please login to continue.',
              email,
              justVerified: true
            }
          });
        }, 1500);
        
      } else {
        throw new Error('Verification failed - invalid response');
      }
      
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error.response) {
        const message = error.response.data?.message;
        if (message?.includes('expired')) {
          toast.error('⏰ Verification code has expired. Please request a new one.');
          setCanResend(true);
          setCountdown(0);
        } else if (message?.includes('Invalid')) {
          toast.error('❌ Invalid verification code. Please try again.');
          setOtp(''); // Clear OTP input
        } else {
          toast.error(message || 'Verification failed');
        }
      } else if (error.request) {
        toast.error('🌐 Network error. Please check your connection.');
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleVerification();
  };

  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const response = await axios.post('/api/users/resend-otp', { email });

      if (response?.data?.status === 'success') {
        toast.success('📧 New verification code sent!');
        setCountdown(120); // Reset countdown
        setCanResend(false);
        setOtp(''); // Clear current OTP input
      } else {
        throw new Error('Failed to resend OTP');
      }
      
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      if (error.response) {
        const message = error.response.data?.message;
        toast.error(message || 'Failed to resend verification code');
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to resend verification code. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <MDBCard className="shadow-5 otp-verification-card">
              <div className="verification-header">
                <FaEnvelope size={50} className="mb-3" />
                <h2 className="fw-bold mb-2">Verify Your Email</h2>
                <p className="mb-0">
                  We've sent a 6-digit code to
                </p>
                <div className="email-display mt-2">
                  <strong>{email}</strong>
                </div>
              </div>

              <MDBCardBody className="p-4">
                <form onSubmit={handleSubmit}>
                  {/* OTP Input */}
                  <div className="text-center mb-4">
                    <label className="form-label fw-bold mb-3">
                      Enter Verification Code
                    </label>
                    <OTPInput
                      length={6}
                      onOTPChange={handleOTPChange}
                      value={otp}
                      disabled={loading}
                    />
                  </div>

                  {/* Countdown Timer */}
                  <div className={`countdown-timer ${countdown <= 0 ? 'expired' : ''}`}>
                    {countdown > 0 ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <FaClock className="me-2" />
                        <span>
                          Code expires in: <strong>{formatTime(countdown)}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="text-danger">
                        <FaClock className="me-2" />
                        Verification code has expired
                      </div>
                    )}
                  </div>

                  {/* Verify Button */}
                  <MDBBtn 
                    type="submit" 
                    color="success" 
                    size="lg" 
                    className="w-100 mb-3"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <MDBSpinner size="sm" role="status" tag="span" className="me-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="me-2" />
                        Verify Email
                      </>
                    )}
                  </MDBBtn>

                  {/* Resend Button */}
                  <MDBBtn 
                    type="button"
                    color="primary" 
                    size="lg" 
                    className="w-100 mb-4 resend-button"
                    outline
                    disabled={!canResend || resendLoading}
                    onClick={handleResendOTP}
                  >
                    {resendLoading ? (
                      <>
                        <MDBSpinner size="sm" role="status" tag="span" className="me-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MDBIcon fas icon="redo" className="me-2" />
                        {canResend ? 'Resend Code' : `Resend in ${formatTime(countdown)}`}
                      </>
                    )}
                  </MDBBtn>

                  {/* Security Notice */}
                  <div className="alert alert-info">
                    <small>
                      <FaShieldAlt className="me-2" />
                      <strong>Security tip:</strong> This code expires in 2 minutes. 
                      Check your spam folder if you don't see the email.
                    </small>
                  </div>

                  {/* Back to Registration */}
                  <div className="text-center">
                    <Link to="/registration" className="text-decoration-none">
                      <small>← Back to Registration</small>
                    </Link>
                  </div>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default OTPVerification;
