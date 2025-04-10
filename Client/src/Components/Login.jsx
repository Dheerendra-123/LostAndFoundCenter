import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { handleError, handleSuccess } from '../Utils/tostify';

const Login = () => {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
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
    console.log('Submitting form...', formData);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/login',
        formData,
        { withCredentials: true }
      );
      console.log('Response:', response.data.token);


      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user || { email: formData.email }));
        
        handleSuccess(response.data.message || 'Login successful!');
        setTimeout(() => navigate('/'), 1500);
      } else {
        handleError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.log('Error Response:', err.response);

      console.error('Login error:', err);
      handleError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', my: 4}}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Login
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          required
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
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
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Login
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Login;