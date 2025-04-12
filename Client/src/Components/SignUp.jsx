import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  PersonAdd, 
  Email, 
  Lock,
  Person,
  Google as GoogleIcon
} from '@mui/icons-material';
import { handleError, handleSuccess } from '../Utils/tostify';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/signup',
        formData,
        { withCredentials: true } 
      );

      if (response.data.success) {
        handleSuccess(response.data.message || 'Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        handleError(response.data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      handleError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      // This would typically redirect to Google OAuth flow
      setTimeout(() => {
        handleSuccess('Google signup successful! Setting up your account...');
        navigate('/');
        setGoogleLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Google signup error:', err);
      handleError('Failed to sign up with Google. Please try again.');
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
          border: '1px solid rgba(0,0,0,0.05)'
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
            <PersonAdd fontSize="small" />
          </Avatar>
          <Typography 
            variant="h5" 
            component="h1" 
            gutterBottom 
            sx={{ fontWeight: 600, mb: 0.5, fontSize: '1.25rem' }}
          >
            Create an Account
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: '0.85rem' }}
          >
            Join us to get started with our service
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person fontSize="small" color="action" />
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
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            size="small"
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
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            size="small"
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
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1.5, fontSize: '0.7rem' }}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Typography>
          
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
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
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
            onClick={handleGoogleSignUp}
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
            {googleLoading ? <CircularProgress size={20} color="inherit" /> : 'Sign up with Google'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ 
                textDecoration: 'none', 
                color: '#1976d2', 
                fontWeight: 600 
              }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup;