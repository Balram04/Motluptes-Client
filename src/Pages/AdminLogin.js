import React, { useState, useContext } from 'react';
import { MDBContainer, MDBIcon } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import { Input } from '../Components/Input';
import { axios } from '../Utils/Axios';
import Button from '../Components/Button';
import toast from 'react-hot-toast';

function AdminLogin() {
  const navigate = useNavigate();
  const { setLoginStatus } = useContext(PetContext);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value.trim().toLowerCase();
    const password = e.target.password.value;

    if (!email || !password) {
      toast.error('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/admin/login', { email, password });
      
      if (response?.data?.data) {
        // Store admin credentials
        localStorage.setItem('role', 'admin');
        localStorage.setItem('name', response.data.data.name);
        localStorage.setItem('jwt_token', response.data.data.jwt_token);
        
        toast.success('Welcome to Admin Dashboard!');
        setLoginStatus(true);
        navigate('/dashboard');
      } else {
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      <MDBContainer className="d-flex justify-content-center">
        <div className="admin-login-card" style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '15px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
          maxWidth: '450px',
          width: '100%'
        }}>
          <div className="text-center mb-4">
            <MDBIcon 
              fas 
              icon="shield-alt" 
              size="3x" 
              style={{ color: '#667eea' }}
              className="mb-3"
            />
            <h2 className="mb-1" style={{ color: '#333' }}>Admin Login</h2>
            <p className="text-muted">Access the MotluPets Admin Dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Input 
                type="email" 
                label="Admin Email" 
                name="email"
                required
                value={"balramprajapati3263@gmail.com"}
                placeholder="admin@doghub.com"
              />
            </div>
            
            <div className="mb-4">
              <Input 
                type="password" 
                label="Password" 
                name="password"
                value={"admin@123"}
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="d-grid mb-4">
              <Button 
                type="submit" 
                color="primary"
                disabled={loading}
                className="py-3"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <MDBIcon fas icon="sign-in-alt" className="me-2" />
                    Sign In to Dashboard
                  </>
                )}
              </Button>
            </div>

            

            <hr className="my-4" />
            
            <div className="text-center">
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={() => navigate('/')}
                style={{ color: '#667eea' }}
              >
                <MDBIcon fas icon="arrow-left" className="me-2" />
                Back to Main Site
              </button>
            </div>
          </form>
        </div>
      </MDBContainer>
    </div>
  );
}

export default AdminLogin;
