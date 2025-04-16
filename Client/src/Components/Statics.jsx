import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    CircularProgress,
    Alert,
    Divider,
    Card,
    CardContent,
    useTheme,
    Button,
    Skeleton
} from '@mui/material';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import RefreshIcon from '@mui/icons-material/Refresh';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import api from '../../api/api';

const Statistics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();

    // Stats derived from data
    const [stats, setStats] = useState({
        totalItems: 0,
        lostItems: 0,
        foundItems: 0,
        claimedItems: 0,
        categoryData: [],
        monthlyData: [],
        statusData: []
    });

    useEffect(() => {
        fetchStatisticsData();
    }, []);

    const fetchStatisticsData = async () => {
        try {
            setLoading(true);
            setRefreshing(true);
            console.log("Fetching statistics data...");

            // Using the corrected API endpoint
            const response = await api.get('/api/forms/all');
            console.log("API Response:", response);

            if (!response || !response.data) {
                console.error('Invalid API response format');
                setError('Received invalid data format from server.');
                setLoading(false);
                setRefreshing(false);
                return;
            }

            const items = response.data.data;

            if (!Array.isArray(items)) {
                console.error('Expected an array of items, received:', items);
                setError('Data format error: Expected an array of items.');
                setLoading(false);
                setRefreshing(false);
                return;
            }

            setData(items);
            processData(items);
            setLoading(false);
            setRefreshing(false);
        } catch (err) {
            console.error('Error fetching statistics:', err);
            setError(`Failed to load statistics data: ${err.message || 'Unknown error'}`);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const processData = (items) => {
        if (!items || !items.length) {
            console.log("No items to process");
            setStats({
                totalItems: 0,
                lostItems: 0,
                foundItems: 0,
                claimedItems: 0,
                categoryData: [],
                monthlyData: getEmptyMonthlyData(),
                statusData: [
                    { name: 'Claimed', value: 0 },
                    { name: 'Unclaimed', value: 0 }
                ]
            });
            return;
        }

        console.log("Processing", items.length, "items");

        // Basic counts
        const lostItems = items.filter(item => item.type === 'Lost');
        const foundItems = items.filter(item => item.type === 'Found');
        const claimedItems = items.filter(item => item.claimedBy);

        console.log(`Found ${lostItems.length} lost items, ${foundItems.length} found items, ${claimedItems.length} claimed items`);

        // Category data for pie chart
        const categories = {};
        items.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = 1;
            } else {
                categories[category]++;
            }
        });

        const categoryData = Object.keys(categories).map(key => ({
            name: key,
            value: categories[key]
        }));

        // Monthly data for bar chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyStats = {};

        months.forEach(month => {
            monthlyStats[month] = { lost: 0, found: 0, claimed: 0 };
        });

        items.forEach(item => {
            try {
                const dateField = item.date || item.date_lost || item.createdAt;
                if (!dateField) {
                    console.log("Item missing date field:", item);
                    return;
                }

                const date = new Date(dateField);
                if (isNaN(date.getTime())) {
                    console.log("Invalid date:", dateField);
                    return;
                }

                const month = months[date.getMonth()];

                if (item.type === 'Lost') {
                    monthlyStats[month].lost++;
                } else if (item.type === 'Found') {
                    monthlyStats[month].found++;
                }

                if (item.claimedBy) {
                    monthlyStats[month].claimed++;
                }
            } catch (err) {
                console.error("Error processing item date:", err);
            }
        });

        const monthlyData = months.map(month => ({
            name: month,
            Lost: monthlyStats[month].lost,
            Found: monthlyStats[month].found,
            Claimed: monthlyStats[month].claimed
        }));

        // Status data for pie chart (claimed vs unclaimed)
        const statusData = [
            { name: 'Claimed', value: claimedItems.length },
            { name: 'Unclaimed', value: items.length - claimedItems.length }
        ];

        setStats({
            totalItems: items.length,
            lostItems: lostItems.length,
            foundItems: foundItems.length,
            claimedItems: claimedItems.length,
            categoryData,
            monthlyData,
            statusData
        });
    };

    const getEmptyMonthlyData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map(month => ({
            name: month,
            Lost: 0,
            Found: 0,
            Claimed: 0
        }));
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
    const STATUS_COLORS = ['#4CAF50', '#F44336'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Paper sx={{ padding: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                    <Typography variant="body2">{`${label} : ${payload[0].value}`}</Typography>
                </Paper>
            );
        }
        return null;
    };

    const renderSectionTitle = (icon, title, description) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {icon}
                <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ ml: 1 }}>
                    {title}
                </Typography>
            </Box>
            {description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {description}
                </Typography>
            )}
        </Box>
    );

    if (loading && !refreshing) {
        return (
            <Container maxWidth={false} sx={{ py: 8, textAlign: 'center', width: '90%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography mt={3} variant="h6" color="text.secondary">
                        Loading statistics...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth={false} sx={{ py: 8, width: '90%' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                        <EqualizerIcon sx={{ mr: 2, fontSize: 35, color: 'primary.main' }} />
                        Lost & Found Statistics
                    </Typography>
                    <Divider sx={{ mt: 2 }} />
                </Box>

                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>Troubleshooting Steps:</Typography>
                    <ol>
                        <li>
                            <Typography variant="body1" paragraph>
                                Check if your API server is running and accessible.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" paragraph>
                                Verify that the API endpoint '/api/forms/all' exists and returns the expected data format.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" paragraph>
                                Check your browser console for more detailed error information.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" paragraph>
                                Ensure you have proper authentication to access this endpoint.
                            </Typography>
                        </li>
                    </ol>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RefreshIcon />}
                        onClick={() => fetchStatisticsData()}
                        sx={{ mt: 2 }}
                    >
                        Try Again
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth={false} sx={{ py: 4, width: '90%', mx: 'auto' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                        <EqualizerIcon sx={{ mr: 2, fontSize: 35, color: 'primary.main' }} />
                        Lost & Found Statistics
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Overview of all lost, found, and claimed items in the system
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={fetchStatisticsData}
                    disabled={refreshing}
                >
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
            </Box>
            <Divider sx={{ mb: 4 }} />

            {/* Summary Cards - Spread to use more width */}
            <Typography variant="h6" sx={{ mb: 2 }}>Key Metrics</Typography>
            <Grid container spacing={21} sx={{ mb: 5 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            height: '100%',
                            width: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            color: 'white',
                            borderRadius: 2,
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 20px -10px rgba(33, 150, 243, 0.4)'
                            }
                        }}
                    >
                        <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography
                                variant="h6"
                                fontWeight="medium"
                                gutterBottom
                                textAlign="center"
                            >
                                Total Items
                            </Typography>
                            {refreshing ? (
                                <Skeleton variant="text" width="60%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)', margin: '0 auto' }} />
                            ) : (
                                <Typography variant="h3" fontWeight="bold" textAlign="center">
                                    {stats.totalItems}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            height: '100%',
                            width: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'linear-gradient(45deg, #FF5252 30%, #FF8A80 90%)',
                            color: 'white',
                            borderRadius: 2,
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 20px -10px rgba(255, 82, 82, 0.4)'
                            }
                        }}
                    >
                        <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography
                                variant="h6"
                                fontWeight="medium"
                                gutterBottom
                                textAlign="center"
                            >
                                Lost Items
                            </Typography>
                            {refreshing ? (
                                <Skeleton variant="text" width="60%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)', margin: '0 auto' }} />
                            ) : (
                                <Typography variant="h3" fontWeight="bold" textAlign="center">
                                    {stats.lostItems}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            height: '100%',
                            width: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'linear-gradient(45deg, #69F0AE 30%, #B9F6CA 90%)',
                            color: 'white',
                            borderRadius: 2,
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 20px -10px rgba(105, 240, 174, 0.4)'
                            }
                        }}
                    >
                        <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography
                                variant="h6"
                                fontWeight="medium"
                                gutterBottom
                                textAlign="center"
                            >
                                Found Items
                            </Typography>
                            {refreshing ? (
                                <Skeleton variant="text" width="60%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)', margin: '0 auto' }} />
                            ) : (
                                <Typography variant="h3" fontWeight="bold" textAlign="center">
                                    {stats.foundItems}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            height: '100%',
                            width: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'linear-gradient(45deg, #FFC107 30%, #FFECB3 90%)',
                            color: 'white',
                            borderRadius: 2,
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 20px -10px rgba(255, 193, 7, 0.4)'
                            }
                        }}
                    >
                        <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography
                                variant="h6"
                                fontWeight="medium"
                                gutterBottom
                                textAlign="center"
                            >
                                Claimed Items
                            </Typography>
                            {refreshing ? (
                                <Skeleton variant="text" width="60%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)', margin: '0 auto' }} />
                            ) : (
                                <Typography variant="h3" fontWeight="bold" textAlign="center">
                                    {stats.claimedItems}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts - Improved layout with matching heights */}
            <Typography variant="h6" sx={{ mb: 2 }}>Detailed Analytics</Typography>
            <Grid container spacing={5}>
                {/* Bar Chart */}
                <Grid item xs={12} lg={8}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: '500px',
                            width: '400px',
                            borderRadius: 2,
                            backgroundColor: theme.palette.background.paper,
                            transition: 'box-shadow 0.3s',
                            '&:hover': {
                                boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        {renderSectionTitle(
                            <TimelineIcon color="primary" />,
                            "Monthly Statistics",
                            "Tracking lost, found, and claimed items by month"
                        )}

                        <Box sx={{ height: 'calc(100% - 60px)', width: '100%' }}>
                            {refreshing ? (
                                <Skeleton variant="rectangular" width="100%" height="100%" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={stats.monthlyData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                        <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary }} />
                                        <YAxis tick={{ fill: theme.palette.text.secondary }} />
                                        <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }} />
                                        <Legend wrapperStyle={{ paddingTop: 15 }} />
                                        <Bar dataKey="Lost" fill="#FF5252" />
                                        <Bar dataKey="Found" fill="#69F0AE" />
                                        <Bar dataKey="Claimed" fill="#FFC107" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Pie Charts */}
                <Grid item xs={12} lg={4}>
                    <Grid container spacing={4} sx={{ height: '500px' }}>
                        {/* Top Pie Chart */}
                        <Grid item xs={12} sx={{ height: '50%' }}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 3,
                                    height: '500px',
                                    width: '420px',
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.background.paper,
                                    transition: 'box-shadow 0.3s',
                                    '&:hover': {
                                        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)'
                                    },
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {renderSectionTitle(
                                    <PieChartIcon color="primary" />,
                                    "Item Categories"
                                )}
                                <Box sx={{ flex: 1, position: 'relative' }}>
                                    {refreshing ? (
                                        <Skeleton
                                            variant="circular"
                                            width="80%"
                                            height="80%"
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.categoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent, cx, cy }) => {
                                                        const labelX = cx - 100;
                                                        const labelY = cy - 130;

                                                        return (
                                                            <text
                                                                x={labelX}
                                                                y={labelY}
                                                                fill="#000"
                                                                textAnchor="start"
                                                                dominantBaseline="hanging"
                                                            >
                                                                {`${name}: ${(percent * 100).toFixed(0)}%`}
                                                            </text>
                                                        );
                                                    }}
                                                    outerRadius="60%"
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {stats.categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>

                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Bottom Pie Chart */}
                        <Grid item xs={12} sx={{ height: '50%' }}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 3,
                                    height: '500px',
                                    width: '420px',
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.background.paper,
                                    transition: 'box-shadow 0.3s',
                                    '&:hover': {
                                        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)'
                                    },
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {renderSectionTitle(
                                    <PieChartIcon color="primary" />,
                                    "Item Status"
                                )}
                                <Box sx={{ flex: 1, position: 'relative' }}>
                                    {refreshing ? (
                                        <Skeleton
                                            variant="circular"
                                            width="80%"
                                            height="80%"
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.statusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={true}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius="60%"
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {stats.statusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* Empty State */}
            {!error && stats.totalItems === 0 && !loading && (
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        mt: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper
                    }}
                >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Data Available
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        There are currently no items in the system to display statistics for.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RefreshIcon />}
                        onClick={() => fetchStatisticsData()}
                        sx={{ mt: 3 }}
                    >
                        Refresh Data
                    </Button>
                </Paper>
            )}
        </Container>
    );
};

export default Statistics;