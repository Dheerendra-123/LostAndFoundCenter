import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Container,
  Divider,
  CircularProgress,
  Avatar
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  Google as GoogleIcon
} from '@mui/icons-material';
import { handleError, handleSuccess } from '../Utils/tostify';
import api from '../../api/api';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post(
        '/api/auth/login',
        formData
      );
      
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user || { email: formData.email }));
        handleSuccess(response.data.message || 'Login successful!');
        setTimeout(() => navigate('/'), 1500);
      } else {
        handleError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      handleError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // This would typically redirect to Google OAuth flow
      setTimeout(() => {
        handleSuccess('Google authentication successful!');
        navigate('/');
        setGoogleLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Google login error:', err);
      handleError('Failed to authenticate with Google. Please try again.');
      setGoogleLoading(false);
    }
  };
  
  return (
    <Container maxWidth="xs" sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '90vh',
      py: 2
    }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2.5, sm: 3 }, 
          width: '100%', 
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              width: 44, 
              height: 44, 
              bgcolor: 'primary.main', 
              mx: 'auto', 
              mb: 1.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Lock fontSize="small" />
          </Avatar>
          <Typography 
            variant="h5" 
            component="h1" 
            gutterBottom 
            sx={{ fontWeight: 600, mb: 0.5, fontSize: '1.25rem' }}
          >
            Welcome Back
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: '0.85rem' }}
          >
            Enter your credentials to access your account
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            size="small"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              } 
            }}
          />
          
          <TextField
            required
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            size="small"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 0.75,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              } 
            }}
          />
          
          <Box sx={{ textAlign: 'right', mb: 1.5 }}>
            <Link to="/forgot-password" style={{ 
              textDecoration: 'none', 
              color: '#1976d2', 
              fontSize: '0.8rem',
              fontWeight: 500
            }}>
              Forgot password?
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ 
              mt: 1, 
              mb: 2, 
              py: 1,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 1.5,
              boxShadow: '0 3px 8px rgba(25, 118, 210, 0.25)',
            }}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
          </Button>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ px: 1, fontSize: '0.75rem' }}>
              OR
            </Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FcGoogle />}
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            sx={{ 
              py: 1,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: 1.5,
              borderWidth: 1,
              color: 'text.primary',
              borderColor: 'rgba(0,0,0,0.15)',
            }}
          >
            {googleLoading ? <CircularProgress size={20} color="inherit" /> : 'Sign in with Google'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ 
                textDecoration: 'none', 
                color: '#1976d2', 
                fontWeight: 600 
              }}>
                Create an Account
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;