import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Card,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import ItemCard from './ItemCard';
import lostAndFoundInmg from '../assets/lost-and-found.png';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Loading from '../Utils/Loading';
import { handleError } from '../Utils/tostify';
import api from '../../api/api';

const Display = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enableSearch, setEnableSearch] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8); // Initial number of items to show (2 rows of 4)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Category counts
  const [categoryCounts, setCategoryCounts] = useState({
    found: 0,
    lost: 0,
    claimed: 0
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setExpanded(false);
    setVisibleItems(8);
  };

  const handleExpandClick = () => {
    if (expanded) {
      setVisibleItems(8);
      setExpanded(false);
      // Scroll back to top of items section
      const itemsSection = document.getElementById("items-section");
      if (itemsSection) {
        itemsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setVisibleItems(itemsToDisplay.length);
      setExpanded(true);
    }
  };

  const handleSessionExpired = () => {
    if (!sessionExpired) {
      setSessionExpired(true);
      localStorage.removeItem("user");
      handleError("Session expired. Redirecting to login...");

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/forms/all');

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setItems(response.data.data);

        if (response.data.data.length > 0) {
          setDebugInfo(response.data.data[0]);
        }

        // Calculate category counts
        const foundCount = response.data.data.filter(item => {
          const isFound = (item.type === 'Found' || 
                           item.type === 'found' || 
                           item.formType === 'Found' || 
                           item.formType === 'found');
          const isNotClaimed = !item.claimStatus && !item.claimedBy;
          return isFound && isNotClaimed;
        }).length;

        const lostCount = response.data.data.filter(item => {
          const isLost = (item.type === 'Lost' || 
                          item.type === 'lost' || 
                          item.formType === 'Lost' || 
                          item.formType === 'lost');
          const isNotClaimed = !item.claimStatus && !item.claimedBy;
          return isLost && isNotClaimed;
        }).length;

        const claimedCount = response.data.data.filter(item => 
          item.claimStatus === true || 
          item.status === 'claimed' || 
          item.claimedBy
        ).length;

        setCategoryCounts({
          found: foundCount,
          lost: lostCount,
          claimed: claimedCount
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error("Error fetching items:", err);

      if (err.response?.status === 401) {
        handleSessionExpired();
      } else {
        handleError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle item claimed event
  const handleItemClaimed = (itemId) => {
    setItems(prevItems => prevItems.map(item =>
      item._id === itemId ? { ...item, claimStatus: true } : item
    ));

    fetchItems();
  };

  const getFilteredItems = () => {
    let filtered = [...items];

    switch (tabValue) {
      case 0: // Found Items tab
        filtered = filtered.filter(item => {
          // Check if type is explicitly 'Found'
          const isFound = (item.type === 'Found' ||
            item.type === 'found' ||
            item.formType === 'Found' ||
            item.formType === 'found');

          const isNotClaimed = !item.claimStatus && !item.claimedBy;

          return isFound && isNotClaimed;
        });
        break;

      case 1: // Lost Items tab
        filtered = filtered.filter(item => {
          const isLost = (item.type === 'Lost' ||
            item.type === 'lost' ||
            item.formType === 'Lost' ||
            item.formType === 'lost');

          const isNotClaimed = !item.claimStatus && !item.claimedBy;

          return isLost && isNotClaimed;
        });
        break;

      case 2: // Claimed Items tab
        filtered = filtered.filter(item =>
          item.claimStatus === true ||
          item.status === 'claimed' ||
          item.claimedBy
        );
        break;

      default:
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        (item.item && item.item.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();
  const itemsToDisplay = filteredItems;
  const showMoreButton = itemsToDisplay.length > visibleItems;

  // Get the total count for the current category
  const getCurrentCategoryTotal = () => {
    switch (tabValue) {
      case 0: return categoryCounts.found;
      case 1: return categoryCounts.lost;
      case 2: return categoryCounts.claimed;
      default: return 0;
    }
  };

  // Calculate items per row based on screen size
  const getItemsPerRow = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 4;
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Data
        </Typography>
        <Typography variant="body1">
          Please try again later.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => fetchItems()}
        >
          Retry
        </Button>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          No Items Found
        </Typography>
        <Typography variant="body1">
          There are currently no items in the database.
        </Typography>
        <Button
          component={RouterLink}
          to="/reportForm"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
        >
          Report an Item
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh' }} mb={3}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          backgroundImage: 'linear-gradient(115deg, #62cff4, #2c67f2)',
          color: 'primary.contrastText',
          mb: 4,
          p: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                component="h1"
                variant="h3"
                color="inherit"
                gutterBottom
                sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' } }}
              >
                Lost Something? Found Something?
              </Typography>
              <Typography
                variant="h5"
                color="inherit"
                paragraph
                sx={{ fontSize: { xs: '0.7rem', md: '1.1rem' }, opacity: 0.9 }}
              >
                Our centralized lost and found system helps connect people with their lost items quickly and efficiently.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  startIcon={<SearchIcon sx={{ color: 'rgb(156, 39, 176)' }} />}
                  sx={{ fontWeight: 600, color: 'white' }}
                  onClick={() => {
                    setEnableSearch(prev => {
                      const newValue = !prev;
                      if (newValue) {
                        setTimeout(() => {
                          const el = document.getElementById("search-box");
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }
                      return newValue;
                    });
                  }}
                >
                  Search Items
                </Button>

                <Button
                  component={RouterLink}
                  to="/reportForm"
                  variant="outlined"
                  color="secondary"
                  size="large"
                  startIcon={<AddIcon sx={{ color: 'rgb(156, 39, 176)' }} />}
                  sx={{ fontWeight: 600, color: 'white' }}
                >
                  Report Lost / Found Item
                </Button>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <img
                src={lostAndFoundInmg}
                alt="Lost and Found"
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Search Bar */}
      {enableSearch && <Container maxWidth="lg" sx={{ mb: 4 }} id="search-box">
        <Paper sx={{ p: 2, boxShadow: 2 }}>
          <TextField
            fullWidth
            placeholder="Search for lost items by name, category, location..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>
      </Container>}

      {/* Content Tabs & Items */}
      <Container maxWidth="lg">
        <Paper sx={{ boxShadow: 2, mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? "fullWidth" : "standard"}
            centered={!isMobile}
          >
            <Tab label={`Found Items (${categoryCounts.found})`} />
            <Tab label={`Lost Items (${categoryCounts.lost})`} />
            <Tab label={`Claimed Items (${categoryCounts.claimed})`} />
          </Tabs>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }} id="items-section">
          <Typography variant="h5" component="h2" fontWeight={600}>
            {tabValue === 0 ? 'Found Items' :
              tabValue === 1 ? 'Lost Items' : 'Claimed Items'}
          </Typography>
          <Button
            color="primary"
            onClick={fetchItems}
            variant='outlined'
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>

        {/* Items count info - In a highlighted card for better visibility */}
        <Card sx={{ mb: 3, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.08)', borderRadius: 2 }}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Showing {Math.min(visibleItems, itemsToDisplay.length)} of {getCurrentCategoryTotal()} total {tabValue === 0 ? 'found' : tabValue === 1 ? 'lost' : 'claimed'} items
          </Typography>
        </Card>

        {itemsToDisplay.length > 0 ? (
          <>
            <Grid container spacing={4} justifyContent="flex-start">
              {itemsToDisplay.slice(0, visibleItems).map((item) => (
                <Grid item key={item._id} xs={12} sm={6} md={3}>
                  <ItemCard
                    item={{
                      id: item._id,
                      item: item.item || "Unknown Item",
                      category: item.category || "Uncategorized",
                      type: item.type || item.formType || "Type not specified",
                      location: item.location || "Unknown Location",
                      date_lost: item.date_lost || item.date || new Date().toISOString().split('T')[0],
                      date: item.date || item.date_lost || new Date().toISOString().split('T')[0],
                      description: item.description || "No description provided",
                      status: item.status || "found",
                      image: item.image,
                      src: item.image?.url || "https://via.placeholder.com/150?text=No+Image",
                      contact: {
                        name: item.contact_name,
                        email: item.contact_email,
                        phone: item.contact_phone
                      },
                      reward: item.reward_offer,
                      department: item.department,
                      claimStatus: item.claimStatus || (item.status === 'claimed'),
                      claimedBy: item.claimedBy,
                      reportedBy: item.reportedBy || item.userId
                    }}
                    onClaimed={() => handleItemClaimed(item._id)}
                  />
                </Grid>
              ))}
            </Grid>
            
            {/* Show more/less button */}
            {itemsToDisplay.length > 8 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  onClick={handleExpandClick}
                  variant="outlined"
                  color="primary"
                  endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ 
                    borderRadius: 4,
                    px: 3,
                    py: 1,
                    boxShadow: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {expanded ? "Show Less" : `Show More (${itemsToDisplay.length - visibleItems} more)`}
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No items found in this category.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={fetchItems}
            >
              Refresh
            </Button>
          </Box>
        )}

        {tabValue === 0 && (
          <>
            <Box sx={{ mt: 6, mb: 4 }}>
              <Divider>
                <Chip
                  label="HOW IT WORKS"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Divider>
            </Box>

            <Grid container spacing={4} sx={{ mb: 6 }} direction='row' alignItems='center' justifyContent='center'>
              {[1, 2, 3].map((num, index) => (
                <Grid item xs={12} md={4} key={num}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'primary.main',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      {num}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {["Report Lost or Found Item", "Get Matched", "Claim & Verify"][index]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[
                        "Fill out a simple form with details and photos of the item you've lost or found.",
                        "Match lost items with found items based on descriptions, locations, and dates and Colect From Reporter",
                        "If you Claim the Item Email will be send from Your email to reporter And Verify ownership and arrange for pickup."
                      ][index]}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
      <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: '#f5f5f5',
        paddingTop:'5px',
        paddingRight:'5px',
        mt: 'auto', 
      }}
    >
      <Typography color="text.secondary" fontSize='10px'>
        Design And Developed By Dheerendra Dixit
      </Typography>
    </Box>
    </Box>
  );
};

export default Display;