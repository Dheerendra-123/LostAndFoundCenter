import React, { useState } from 'react';
import axios from 'axios';
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
import { handleError, handleSuccess } from '../Utils/tostify';

const ItemCard = ({ item, onClaimed }) => {
    const [claimed, setClaimed] = useState(item.claimStatus || !!item.claimedBy);


    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleClaim = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?._id;

            if (!userId) {
                alert("User not logged in or ID missing.");
                return;
            }

            const res = await axios.patch(
                `http://localhost:8000/api/form/claim/${item.id}`,
                {
                    type: 'claim',
                    reportedBy: userId
                },
                { withCredentials: true }
            );

            handleSuccess(res.data.message);
            setClaimed(true);
            if (onClaimed) onClaimed();
        } catch (err) {
            console.error(err);
            handleError(
                err.response?.data?.message || "Failed to claim item. Please try again."
            );
        }
    };


    return (
        <Box display='flex' justifyContent='flex-start'>
            <Card
                sx={{
                    width: 340,
                    height: 480,
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

                        {/* ✅ Show who claimed it */}
                        {claimed && item.claimedBy && (
                            <Typography variant="caption" color="text.secondary">
                                Claimed by: {item.claimedBy.name || item.claimedBy.email || "User"}
                            </Typography>
                        )}
                    </Stack>
                </CardContent>

                <CardActions sx={{ padding: 2.5, paddingTop: 1 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        disabled={claimed}
                        onClick={handleClaim}
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
                        {claimed ? "Claimed" : "Claim This Item"}
                    </Button>
                </CardActions>
            </Card>
        </Box>
    );
};

export default ItemCard;

