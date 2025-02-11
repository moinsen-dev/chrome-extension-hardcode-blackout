import { Box, Button, Paper, Slider, Switch, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StorageData } from '../../utils/types';

const Popup: React.FC = () => {
    const [enabled, setEnabled] = useState(true);
    const [settings, setSettings] = useState<StorageData['settings'] | null>(null);
    const [stats, setStats] = useState({
        processedPosts: 0,
        averageScore: 0,
        blockedPosts: 0
    });

    useEffect(() => {
        // Load settings and stats
        chrome.storage.local.get(['settings', 'cachedRatings'], (result) => {
            setSettings(result.settings?.settings);

            const ratings = Object.values(result.cachedRatings || {}) as number[];
            if (ratings.length > 0) {
                setStats({
                    processedPosts: ratings.length,
                    averageScore: Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length),
                    blockedPosts: ratings.filter(r => r < (settings?.autoHideThreshold || 20)).length
                });
            }
        });
    }, []);

    const handleToggle = () => {
        setEnabled(!enabled);
        // TODO: Implement enable/disable functionality
    };

    return (
        <Box sx={{ width: 300, p: 2 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Hardcore Blackout</Typography>
                    <Switch
                        checked={enabled}
                        onChange={handleToggle}
                        color="primary"
                    />
                </Box>

                <Typography variant="subtitle2" gutterBottom>Statistics</Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        Processed Posts: {stats.processedPosts}
                    </Typography>
                    <Typography variant="body2">
                        Average Score: {stats.averageScore}
                    </Typography>
                    <Typography variant="body2">
                        Blocked Posts: {stats.blockedPosts}
                    </Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom>Quick Settings</Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Filter Strength</Typography>
                    <Slider
                        value={settings?.autoHideThreshold || 20}
                        min={0}
                        max={100}
                        step={10}
                        marks
                        valueLabelDisplay="auto"
                    />
                </Box>

                <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => chrome.runtime.openOptionsPage()}
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