import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Button,
    Chip,
    CardActions,
    Stack
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Today as TodayIcon
} from '@mui/icons-material';

const ItemCard = ({ item, onClaimed }) => {
    console.log("CliamedBy", item.claimedBy);
    const [claimed, setClaimed] = useState(item.claimStatus || !!item.claimedBy);
    const navigate = useNavigate(); 

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleViewBlogPost = () => {
        navigate(`/blog-post/${item.id}`, { state: { item } });
    };

    return (
        <Box display='flex' justifyContent='flex-start'>
            <Card
                sx={{
                    width: 340,
                    height: 490,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-4px)'
                    },
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        sx={{
                            height: 185,
                            width: '100%',
                            objectFit: 'cover'
                        }}
                        image={item.image?.url || item.src}
                        alt={item.title}
                    />
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Chip
                            label={item.category}
                            size="small"
                            color="primary"
                            sx={{
                                fontWeight: 'medium',
                                backdropFilter: 'blur(4px)',
                                backgroundColor: 'rgba(25, 118, 210, 0.85)'
                            }}
                        />
                    </Box>
                </Box>

                <CardContent
                    sx={{
                        flexGrow: 1,
                        padding: 2.5,
                        paddingBottom: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 600,
                            height: 52,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}
                    >
                        {item.item}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            height: 40
                        }}
                    >
                        {item.description}
                    </Typography>

                    <Stack spacing={1.2} sx={{ mb: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationIcon fontSize="small" sx={{ mr: 1, color: 'primary.light' }} />
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {item.location}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TodayIcon fontSize="small" sx={{ mr: 1, color: 'primary.light' }} />
                            <Typography variant="body2" color="text.secondary">
                                {formatDate(item.date_lost || item.date)}
                            </Typography>
                        </Box>

                        {item.reportedBy && (
                            <Typography variant="caption" color="text.secondary">
                                Reported by: {item.reportedBy.name || item.reportedBy.email || "User"}
                            </Typography>
                        )}
                         { item.contact?.phone && (
                            <Typography variant="caption" color="text.secondary">
                                Mobile No: {item.contact.phone|| item.contact?.phone || "phone Number"}
                            </Typography>
                        )}

                    </Stack>
                </CardContent>

                <CardActions sx={{ padding: 2.5, paddingTop: 1}}>
                    {item.type !== 'Lost' ? (
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleViewBlogPost} // Change to navigate to blog post
                            sx={{
                                borderRadius: 1.5,
                                textTransform: 'none',
                                py: 1,
                                fontWeight: 600,
                                boxShadow: 2,
                                transition: 'all 0.2s',
                                '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            {claimed ? "View Claimed Item" : "Claim This Item"}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleViewBlogPost} // Add navigation for lost items too
                            sx={{
                                borderRadius: 1.5,
                                textTransform: 'none',
                                py: 1,
                                fontWeight: 600,
                                boxShadow: 2,
                                transition: 'all 0.2s',
                                '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            View Details
                        </Button>
                    )}
                </CardActions>
            </Card>
        </Box>
    );
};

export default ItemCard;