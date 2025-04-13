import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Avatar,
  Card,
  IconButton,
  Container
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Today as TodayIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkIcon,
} from '@mui/icons-material';
import { handleError, handleSuccess } from '../Utils/tostify';
import userName from './hooks/userName';

const BlogPost = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState(location.state?.item || null);
  const [loading, setLoading] = useState(!location.state?.item);
  const [error, setError] = useState(null);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!item && id) {
      fetchItemDetails();
    } else if (item) {
      setClaimed(item.claimStatus || !!item.claimedBy);
    }
  }, [id, item]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      // Add your fetch logic here
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load item details");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleClaimDialogOpen = () => {
    setClaimDialogOpen(true);
  };

  const handleClaimDialogClose = () => {
    setClaimDialogOpen(false);
  };

  const handleConfirmClaim = async () => {
    try {
      setClaiming(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?._id;

      if (!userId) {
        handleError("User not logged in or ID missing.");
        setClaiming(false);
        setClaimDialogOpen(false);
        return;
      }

      const res = await axios.patch(
        `http://localhost:8000/api/form/claim/${id}`,
        {
          type: 'claim',
          reportedBy: userId
        },
        { withCredentials: true }
      );

      handleSuccess(res.data.message || "Item claimed successfully!");

      setClaiming(false);
      setClaimDialogOpen(false);
      navigate('/');

    } catch (err) {
      console.error(err);
      handleError(
        err.response?.data?.message || "Failed to claim item. Please try again."
      );
      setClaiming(false);
      setClaimDialogOpen(false);
    }
  };

   const name=userName();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography mt={3} variant="h6" color="text.secondary">
            Loading item details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !item) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Alert
            severity="error"
            variant="filled"
            sx={{ mb: 3 }}
          >
            {error || "Item not found"}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back to Listings
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box mb={3}>
      </Box>

      {/* Fixed width containers wrapper */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'center',
        alignItems: { xs: 'center', md: 'stretch' },
        gap: 3
      }}>
        {/* First container: Image with description - FIXED WIDTH */}
        <Box sx={{
          width: { xs: '100%', md: '500px' },
          maxWidth: '100%',
          flexShrink: 0,
          flexGrow: 0
        }}>
          <Paper
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: 6
              }
            }}
          >
            {/* Image with overlay */}
            <Box
              sx={{
                height: { xs: 200, sm: 250, md: 300 },
                width: '100%',
                backgroundImage: `url(${item.image?.url || item.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  p: { xs: 2, md: 3 }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={item.category}
                    size="medium"
                    color="primary"
                    sx={{
                      borderRadius: '16px',
                      fontWeight: 600,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      backgroundColor: 'rgba(25, 118, 210, 0.9)',
                      maxWidth: '120px'
                    }}
                  />

                  <Chip
                    label={item.type}
                    size="medium"
                    color={item.type === 'Lost' ? 'error' : 'success'}
                    sx={{
                      borderRadius: '16px',
                      fontWeight: 600,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </Box>

                <Typography
                  variant="h4"
                  color="white"
                  fontWeight="bold"
                  sx={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {item.item}
                </Typography>
              </Box>
            </Box>

            {/* Content section */}
            <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              {/* Basic details */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ color: 'primary.main', mr: 0.5, fontSize: '1.2rem' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '150px'
                    }}
                  >
                    {item.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TodayIcon sx={{ color: 'primary.main', mr: 0.5, fontSize: '1.2rem' }} />
                  <Typography variant="body2">
                    {formatDate(item.date_lost || item.date)}
                  </Typography>
                </Box>
              </Box>

              {/* Description section - Fixed height with scrollbar */}
              <Box sx={{ mb: 3, flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="bold"
                  color="primary.main"
                >
                  Description
                </Typography>
                <Box
                  sx={{
                    height: '150px', // Fixed height
                    overflow: 'auto',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c1c1c1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#a1a1a1',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    paragraph
                    sx={{
                      lineHeight: 1.6,
                      color: 'text.primary',
                      wordBreak: 'break-word',
                      mb: 0,
                      pr: 1 // Add padding for scrollbar
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </Box>

              {/* Item details grid */}
              <Typography
                variant="h6"
                gutterBottom
                fontWeight="bold"
                color="primary.main"
              >
                Item Details
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Reported by card */}
                {item.reportedBy && (
                  <Grid item xs={12} sm={6}>
                    <Card
                      elevation={1}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 3,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar sx={{ bgcolor: 'primary.light', mr: 1.5, flexShrink: 0, width: 32, height: 32 }}>
                          <PersonIcon sx={{ fontSize: '1rem' }} />
                        </Avatar>
                        <Box sx={{ width: '100%', overflow: 'hidden' }}>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            Reported By
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              width: '100%'
                            }}
                          >
                            {item.reportedBy.name || item.reportedBy.email || "User"}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )}

                {/* Date card */}
                <Grid item xs={12} sm={6}>
                  <Card
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3,
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mr: 1.5, flexShrink: 0, width: 32, height: 32 }}>
                        <TodayIcon sx={{ fontSize: '1rem' }} />
                      </Avatar>
                      <Box sx={{ width: '100%', overflow: 'hidden' }}>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {item.type === 'Lost' ? 'Date Lost' : 'Date Found'}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatDate(item.date_lost || item.date)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              {/* Actions */}
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  size="small"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>

                <Box>
                  <IconButton color="primary" size="small">
                    <ShareIcon />
                  </IconButton>
                  <IconButton color="primary" size="small">
                    <BookmarkIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Second container: Claim/View Details/Status - FIXED WIDTH */}
        <Box sx={{
          width: { xs: '100%', md: '500px' },
          maxWidth: '100%',
          flexShrink: 0,
          flexGrow: 0
        }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(to bottom right, #ffffff, #f5f7fa)',
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: 6
              }
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              fontWeight="bold"
              color="primary.main"
              sx={{
                mb: 3,
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
              }}
            >
              {claimed
                ? "Item Status"
                : item.type === 'Lost'
                  ? ""
                  : "Claim This Item"}
            </Typography>

            {/* Status banner */}
            {claimed && (
              <Alert
                severity="success"
                variant="filled"
                sx={{
                  borderRadius: 2,
                  mb: 3
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {item.type === 'Lost'
                    ? "Contact information is available below"
                    : `This item has been claimed by ${item.claimedBy?.name || item.claimedBy?.email || "a user"}`}
                </Typography>
              </Alert>
            )}

            {/* Main content based on status */}
            {!claimed ? (
              <>
                <Box sx={{ mb: 4, flexGrow: 1 }}>
                  <Typography variant="body1" paragraph>
                    {item.type === 'Lost'
                      ? "If you found this item, you can view the contact information of the person who reported it lost by clicking the button below."
                      : "If this item belongs to you, please use the button below to claim it. You'll need to verify your identity and provide additional information as required."}
                  </Typography>

                  <Box sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 3
                  }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom style={{ textAlign: 'center' }}>
                      Item Information
                    </Typography>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body1" gutterBottom>
                        Item Name:
                      </Typography>
                      <Typography
                        color="text.secondary"
                        variant="body1"
                        fontWeight="medium"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.item}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body1" gutterBottom>
                        Category:
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ maxWidth: '100%' }}>

                        {item.category}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body1" gutterBottom>
                        {item.type === 'Lost' ? "Item Loast at This Loaction" : "Item Found at This Location"}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        color="text.secondary" 
                        gutterBottom
                      >
                        {item.location}
                      </Typography>
                    </Box>
              

                  </Box>

                  {item.type === 'Found' && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        When claiming this item, be prepared to describe specific details or provide proof of ownership that will help verify it belongs to you.
                      </Typography>
                    </Alert>
                  )}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleClaimDialogOpen}
                  sx={{
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 2,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(to right, #1976d2, #2196f3)',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                      background: 'linear-gradient(to right, #1565c0, #1976d2)'
                    }
                  }}
                >
                  {item.type === 'Lost' ? "View Contact Info" : "Claim This Item"}
                </Button>
              </>
            ) : (
              <>
                {/* Content when item is claimed */}
                <Box sx={{ flexGrow: 1 }}>
                  <Card sx={{ mb: 3, p: 2.5, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary.dark">
                      {item.type === 'Lost' ? "Contact Information" : "Claim Details"}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.light',
                          mr: 2
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ width: '100%', overflow: 'hidden' }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.type === 'Lost' ? "Reported by:" : "Claimed by:"}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.type === 'Lost'
                            ? (item.reportedBy?.name || "User")
                            : (item.claimedBy?.name || "User")}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

           

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Email:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.type === 'Lost'
                          ? (item.reportedBy?.email || "Not provided")
                          : (item.claimedBy?.email || "Not provided")}
                      </Typography>
                    </Box>

          
                  </Card>

                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      {item.type === 'Lost'
                        ? "Please contact the owner as soon as possible to arrange returning the item."
                        : "The item has been matched with its owner. Thank you for using our service!"}
                    </Typography>
                  </Alert>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Item Status:
                  </Typography>
                  <Chip
                    label={claimed ? "Claimed" : "Unclaimed"}
                    color={claimed ? "success" : "warning"}
                    size="medium"
                    sx={{ fontWeight: 'medium' }}
                  />
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Dialog for both Lost and Found items */}
      <Dialog
        open={claimDialogOpen}
        onClose={handleClaimDialogClose}
        aria-labelledby="action-dialog-title"
        PaperProps={{
          elevation: 5,
          sx: {
            borderRadius: 3,
            width: '100%',
            maxWidth: 500,
            m: 2
          }
        }}
      >
        <DialogTitle
          id="action-dialog-title"
          sx={{
            pb: 1,
            pt: 3,
            fontWeight: 'bold',
            fontSize: '1.5rem',
            textAlign: 'center',
            color: 'primary.main'
          }}
        >
          {item.type === 'Lost' ? "Contact Information" : "Confirm Claim Request"}
        </DialogTitle>
        <DialogContent
          sx={{
            px: 4,
            pb: 2,
            pt: 2,
            overflowX: 'hidden',
          }}
        >
          <Alert severity="info" sx={{ mb: 3 }}>
            {item.type === 'Lost'
              ? "Contact the reporter to arrange return of the lost item."
              : "Please read carefully before confirming."}
          </Alert>

          {item.type === 'Lost' ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                <strong>{item.reportedBy?.name || "User"}</strong> reported this item as lost. You can use the following information to contact them:
              </DialogContentText>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    display: 'flex'
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 'bold', minWidth: '60px', flexShrink: 0 }}>Name:</Box>
                  <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.reportedBy?.name || "Not provided"}
                  </Box>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    display: 'flex'
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 'bold', minWidth: '60px', flexShrink: 0 }}>Email:</Box>
                  <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', wordBreak: 'break-all' }}>
                    {item.reportedBy?.email || "Not provided"}
                  </Box>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    display: 'flex'
                  }}
                  gutterBottom
                >
                  <Box component="span" sx={{ fontWeight: 'bold', minWidth: '60px', flexShrink: 0 }}>Phone:</Box>
                  <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.contact.phone || item.contact?.phone || "phone Number"}
                  </Box>
                </Typography>
                  <Typography
                  variant="body2"
                  sx={{
                    display: 'flex'
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 'bold', minWidth: '60px', flexShrink: 0 }}>Department:</Box>
                  <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.department || item?.department || "Departmrnt"}
                  </Box>
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                You are about to claim <strong>{item.item}</strong>. By confirming, you declare that:
              </DialogContentText>
              <Box component="ul" sx={{ pl: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    This item belongs to you or you are authorized to claim it
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    You can provide proof of ownership if required
                  </Typography>
                </Box>
                <Box component="li">
                  <Typography variant="body2">
                    You will pick up the item within the specified timeframe
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3, justifyContent: 'space-between' }}>
          <Button
            onClick={handleClaimDialogClose}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            {item.type === 'Lost' ? "Close" : "Cancel"}
          </Button>

          {item.type !== 'Lost' && (
            <Button
              onClick={handleConfirmClaim}
              color="primary"
              variant="contained"
              disabled={claiming}
              sx={{
                borderRadius: 2,
                px: 3,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                background: claiming ? '' : 'linear-gradient(to right, #1976d2, #2196f3)',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                  background: 'linear-gradient(to right, #1565c0, #1976d2)'
                }
              }}
            >
              {claiming ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Processing...
                </>
              ) : (
                "Confirm Claim"
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BlogPost;