import { Box, Button, Paper, Slider, Switch, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import packageJson from '../../../package.json';

const Popup: React.FC = () => {
    const [enabled, setEnabled] = useState(true);
    const [filterStrength, setFilterStrength] = useState<number>(20);
    const [stats, setStats] = useState({
        processedPosts: 0,
        averageScore: 0,
        blockedPosts: 0
    });
    const [analyticsStats, setAnalyticsStats] = useState({
        totalPosts: 0,
        uniqueAuthors: 0,
        avgEngagement: 0,
        enabled: false
    });

    // Add listener for storage changes
    useEffect(() => {
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.settings) {
                const newSettings = changes.settings.newValue;
                setFilterStrength(newSettings.settings?.autoHideThreshold || 20);
                setEnabled(newSettings.isInitialized || false);
            }
            if (changes.cachedRatings) {
                updateStats(changes.cachedRatings.newValue);
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, []);

    const updateStats = (cachedRatings: any) => {
        const ratings = Object.values(cachedRatings || {});
        if (ratings.length > 0) {
            const avgScore = Math.round(
                ratings.reduce((sum: number, rating: any) => sum + rating.overallScore, 0) / ratings.length
            );
            const blocked = ratings.filter((r: any) => r.overallScore < filterStrength).length;

            setStats({
                processedPosts: ratings.length,
                averageScore: avgScore,
                blockedPosts: blocked
            });
        }
    };

    const fetchAnalyticsStats = async () => {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'GET_STATISTICS' });
            if (response.success && response.stats) {
                setAnalyticsStats({
                    totalPosts: response.stats.totalPosts || 0,
                    uniqueAuthors: response.stats.uniqueAuthors || 0,
                    avgEngagement: response.stats.avgEngagement || 0,
                    enabled: true
                });
            }
        } catch (error) {
            console.error('Failed to fetch analytics stats:', error);
        }
    };

    useEffect(() => {
        // Load initial settings and stats
        chrome.storage.local.get(['settings', 'cachedRatings'], (result) => {
            if (result.settings) {
                setFilterStrength(result.settings.settings?.autoHideThreshold || 20);
                setEnabled(result.settings.isInitialized || false);
                
                // Check if analytics are enabled
                const analyticsEnabled = result.settings?.analytics?.enableFeedAnalytics ?? true;
                if (analyticsEnabled) {
                    fetchAnalyticsStats();
                }
            }
            if (result.cachedRatings) {
                updateStats(result.cachedRatings);
            }
        });
    }, []);

    const handleToggle = () => {
        const newEnabled = !enabled;
        setEnabled(newEnabled);

        chrome.storage.local.get('settings', (result) => {
            const updatedSettings = {
                ...result.settings,
                isInitialized: newEnabled
            };
            chrome.storage.local.set({ settings: updatedSettings });
            chrome.runtime.sendMessage({
                type: 'UPDATE_ENABLED_STATE',
                enabled: newEnabled
            });
        });
    };

    const handleFilterStrengthChange = (_event: Event, newValue: number | number[]) => {
        const value = Array.isArray(newValue) ? newValue[0] : newValue;
        setFilterStrength(value);

        chrome.storage.local.get('settings', (result) => {
            const updatedSettings = {
                ...result.settings,
                settings: {
                    ...result.settings?.settings,
                    autoHideThreshold: value
                }
            };
            chrome.storage.local.set({ settings: updatedSettings });
        });
    };

    return (
        <Box sx={{ width: 300, p: 2 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" sx={{ color: 'black' }}>Hardcore Blackout</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                            Version {packageJson.version}
                        </Typography>
                    </Box>
                    <Switch
                        checked={enabled}
                        onChange={handleToggle}
                        color="primary"
                    />
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ color: 'black', fontWeight: 600 }}>
                    Status
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'black' }}>
                        {enabled ? 'Active' : 'Inactive'} - {stats.processedPosts} posts processed
                    </Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom sx={{ color: 'black', fontWeight: 600 }}>Filtering Statistics</Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'black' }}>
                        Average Score: {stats.averageScore}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'black' }}>
                        Blocked Posts: {stats.blockedPosts}
                    </Typography>
                </Box>

                {analyticsStats.enabled && analyticsStats.totalPosts > 0 && (
                    <>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'black', fontWeight: 600 }}>LinkedIn Analytics</Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: 'black' }}>
                                Posts Captured: {analyticsStats.totalPosts}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'black' }}>
                                Unique Authors: {analyticsStats.uniqueAuthors}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'black' }}>
                                Avg. Engagement: {analyticsStats.avgEngagement}
                            </Typography>
                        </Box>
                    </>
                )}

                <Typography variant="subtitle2" gutterBottom sx={{ color: 'black', fontWeight: 600 }}>Quick Settings</Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'black' }}>Filter Strength</Typography>
                    <Slider
                        value={filterStrength}
                        onChange={handleFilterStrengthChange}
                        min={0}
                        max={100}
                        step={10}
                        marks
                        valueLabelDisplay="auto"
                        disabled={!enabled}
                        sx={{
                            '& .MuiSlider-markLabel': {
                                color: 'black'
                            }
                        }}
                    />
                </Box>

                <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => chrome.runtime.openOptionsPage()}
                    sx={{ color: 'black', borderColor: 'black' }}
                >
                    Open Settings
                </Button>
            </Paper>
        </Box>
    );
};

const container = document.getElementById('popup-root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <Popup />
        </React.StrictMode>
    );
}