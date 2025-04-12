import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Stack,
  Paper,
  FormHelperText,
  FormControl,
  Autocomplete,
  InputLabel,
  Select,
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import dayjs from 'dayjs';
import axios from "axios";
import ImageUpload from "./uploadImage";
import { departments, itemCategories, locations } from "../Utils/formData";
import useIsMobile from "./hooks/isMobile";
import Action from "../Utils/Action";
import CardLogo from '../assets/lost-and-found.png';

const LostItemForm = () => {
  const [formData, setFormData] = useState({
    item: "",
    type: "",
    category: "",
    date_lost: null,
    location: "",
    description: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    reward_offer: "",
    department: "",
  });

  const [images, setImages] = useState([]);
  const [locationValue, setLocationValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const isMobile = useIsMobile();
  const [user, setUser] = useState(null);


  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleDateChange = (date) => {
    setFormData({ ...formData, date_lost: date });
  };

  const handleChange = (e) => {
    const updatedData = { ...formData, [e.target.name]: e.target.value };
    setFormData(updatedData);
  };

  const handleCloseAlert = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert({ ...alert, open: false });
  };

  const handleFileSelect = (files) => {
    console.log("Files selected:", files);
    const selected = Array.from(files);
    console.log("Array from files:", selected);
    
    if (selected.length > 1) {
      console.log("Multiple files selected, showing error");
      setAlert({
        open: true,
        message: "Please upload only one image.",
        severity: "error"
      });
      return;
    }
    
    if (selected.length === 0) {
      console.log("No files selected");
      return;
    }
    
    console.log("Setting images state with:", selected);
    setImages(selected);
  };
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const validateForm = () => {
    const requiredFields = [
      "item", "type", "category", "date_lost", "location", "description",
      "contact_name", "contact_email", "contact_phone", "department"
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setAlert({
          open: true,
          message: `${field.replace('_', ' ')} is required`,
          severity: "error"
        });
        return false;
      }
    }
    
    if (images.length === 0) {
      setAlert({
        open: true,
        message: "Please upload an image of the lost item",
        severity: "error"
      });
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      setAlert({
        open: true,
        message: "Please enter a valid email address",
        severity: "error"
      });
      return false;
    }
    
    // Phone validation (simple)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.contact_phone.replace(/\D/g, ''))) {
      setAlert({
        open: true,
        message: "Please enter a valid 10-digit phone number",
        severity: "error"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (!user || !user._id) {
        throw new Error("User not logged in");
      }
      
      const formDataObj = new FormData();
      
      formDataObj.append("userId", user._id);
      formDataObj.append("item", formData.item);
      formDataObj.append("type", formData.type);
      formDataObj.append("category", formData.category);
      formDataObj.append("date_lost", dayjs(formData.date_lost).format('YYYY-MM-DD'));
      formDataObj.append("description", formData.description);
      formDataObj.append("location", formData.location);
      formDataObj.append("contact_name", formData.contact_name);
      formDataObj.append("contact_email", formData.contact_email);
      formDataObj.append("contact_phone", formData.contact_phone);
      formDataObj.append("reward_offer", formData.reward_offer || "None");
      formDataObj.append("department", formData.department);
      
      // Append image file and log it
      if (images.length > 0) {
        const imageFile = images[0];
        console.log("Image being uploaded:", {
          name: imageFile.name,
          type: imageFile.type,
          size: `${(imageFile.size / 1024).toFixed(2)} KB`,
          lastModified: new Date(imageFile.lastModified).toISOString()
        });
        formDataObj.append("image", imageFile);
      } else {
        console.log("No image selected for upload");
      }
      
      // Log form data entries
      console.log("Form data entries:");
      for (let [key, value] of formDataObj.entries()) {
        if (key !== 'image') {
          console.log(`${key}: ${value}`);
        } else {
          console.log(`${key}: [File object]`);
        }
      }
      
      console.log("Sending request to server...");
      
      // Submit the form
      const response = await axios.post("http://localhost:8000/api/forms/create", formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true
      });
      
      console.log("Server response:", response.data);
      
      // If the response includes Cloudinary info, log it
      if (response.data.cloudinaryResponse) {
        console.log("Cloudinary response:", response.data.cloudinaryResponse);
      }
      
      if (response.data.success) {
        // Clear form on success
        setFormData({
          item: "",
          type: "",
          category: "",
          date_lost: null,
          location: "",
          description: "",
          contact_name: "",
          contact_email: "",
          contact_phone: "",
          reward_offer: "",
          department: "",
        });
        setImages([]);
        setLocationValue(null);
        
        setAlert({
          open: true,
          message: "Lost item reported successfully!",
          severity: "success"
        });
      } else {
        throw new Error(response.data.message || "Failed to submit form");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      
      // Log more detailed error information
      if (error.response) {
        console.log("Error response status:", error.response.status);
        console.log("Error response data:", error.response.data);
      }
      
      setAlert({
        open: true,
        message: error.response?.data?.message || error.message || "An error occurred while submitting the form",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper sx={{ height: '100%', overflowY: 'auto', padding: '20px', borderTopLeftRadius: "20px" }}>
        <Action />

        <Box display="flex" flexDirection="column" alignItems="center">
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: '100%', maxWidth: '800px', paddingTop: '10px', marginBottom: '30px' }}
          >
            {/* Header Banner */}
            <Stack
              direction={isMobile ? "column" : "row"}
              spacing={2}
              sx={{
                background: 'linear-gradient(115deg, #62cff4, #2c67f2)',
                color: 'white',
                padding: '40px',
                borderRadius: '5px',
                alignItems: 'center'
              }}
            >
              <img src={CardLogo} alt="card logo" height="50px" />
              <Box>
                <Typography variant="h5" color="white">Report Lost / Found Item</Typography>
                <Typography variant="body2" sx={{ fontWeight: 100 }}>
                  Please provide detailed information to help us find your item
                </Typography>
              </Box>
            </Stack>

            <FormHelperText sx={{ color: '#3b3a3a', my: 2 }}>
              * Please fill all details carefully
            </FormHelperText>

            {/* Title, Type and Category */}
            <Stack direction={{ xs: 'column', sm: 'row', md: 'row' }} spacing={2} mb={2}>
              <TextField
                fullWidth
                name="item"
                label="Item"
                value={formData.item}
                onChange={handleChange}
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                >
                  <MenuItem value="Lost">Lost</MenuItem>
                  <MenuItem value="Found">Found</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {itemCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Date Lost */}
            <Stack direction={{ xs: 'column', sm: 'row', md: 'row' }} spacing={2} mb={2}>

              {/* Date Picker */}
              <Box sx={{ flex: 1 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date Lost / Found"
                    value={formData.date_lost}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>

              {/* Location Autocomplete */}
              <Box sx={{ flex: 1 }}>
                <Autocomplete
                  options={locations}
                  value={locationValue}
                  onChange={(e, newValue) => {
                    setLocationValue(newValue);
                    setFormData(prev => ({ ...prev, location: newValue || '' }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Location"
                      name="location"
                      required
                      fullWidth
                    />
                  )}
                />
              </Box>

            </Stack>


            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
              sx={{ mb: 2 }}
            />

            {/* Contact Details */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
              <TextField
                fullWidth
                name="contact_name"
                label="Contact Name"
                value={formData.contact_name}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'gray' }} />
                }}
              />
              <TextField
                fullWidth
                name="contact_email"
                label="Contact Email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'gray' }} />
                }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
              <TextField
                fullWidth
                name="contact_phone"
                label="Contact Phone"
                value={formData.contact_phone}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'gray' }} />
                }}
              />
              <Box width="100%" />
            </Stack>

            {/* Reward and Department */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
              <TextField
                fullWidth
                name="reward_offer"
                label="Reward (optional)"
                value={formData.reward_offer}
                onChange={handleChange}
              />
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <FormHelperText sx={{ mb: 1 }}>Upload item photo (required)</FormHelperText>
            <ImageUpload
              images={images}
              handleFileSelect={handleFileSelect}
              handleRemoveImage={handleRemoveImage}
            />

            <Button
              type="submit"
              variant="contained"
              endIcon={!loading && <SendIcon />}
              disabled={loading}
              sx={{ mt: 2, width: '150px' }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit'}
            </Button>
          </Box>
        </Box>

        <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Paper>
    </>
  );
};

export default LostItemForm;