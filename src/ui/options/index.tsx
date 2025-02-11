import {
    Box,
    Button,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Slider,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StorageData } from '../../utils/types';

const Options: React.FC = () => {
    const [settings, setSettings] = useState<StorageData['settings'] | null>(null);
    const [modelSettings, setModelSettings] = useState<StorageData['modelSettings'] | null>(null);

    useEffect(() => {
        // Load settings
        chrome.storage.local.get(['settings'], (result) => {
            setSettings(result.settings?.settings);
            setModelSettings(result.settings?.modelSettings);
        });
    }, []);

    const handleSettingChange = (key: string, value: number) => {
        if (!settings) return;

        const newSettings = {
            ...settings,
            [key]: value
        };
        setSettings(newSettings);
        chrome.storage.local.set({ settings: { settings: newSettings, modelSettings } });
    };

    const handleModelSettingChange = (key: string, value: any) => {
        if (!modelSettings) return;

        const newModelSettings = {
            ...modelSettings,
            [key]: value
        };
        setModelSettings(newModelSettings);
        chrome.storage.local.set({ settings: { settings, modelSettings: newModelSettings } });
    };

    if (!settings || !modelSettings) return <div>Loading...</div>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Hardcore Blackout Settings</Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Content Filtering</Typography>

                        <Box sx={{ mb: 3 }}>
                            <Typography gutterBottom>Auto-Hide Threshold</Typography>
                            <Slider
                                value={settings.autoHideThreshold}
                                onChange={(_, value) => handleSettingChange('autoHideThreshold', value as number)}
                                min={0}
                                max={100}
                                step={5}
                                marks
                                valueLabelDisplay="auto"
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography gutterBottom>Dim Threshold</Typography>
                            <Slider
                                value={settings.dimThreshold}
                                onChange={(_, value) => handleSettingChange('dimThreshold', value as number)}
                                min={0}
                                max={100}
                                step={5}
                                marks
                                valueLabelDisplay="auto"
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography gutterBottom>Highlight Threshold</Typography>
                            <Slider
                                value={settings.highlightThreshold}
                                onChange={(_, value) => handleSettingChange('highlightThreshold', value as number)}
                                min={0}
                                max={100}
                                step={5}
                                marks
                                valueLabelDisplay="auto"
                            />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>AI Model Settings</Typography>

                        <Box sx={{ mb: 3 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Model Type</InputLabel>
                                <Select
                                    value={modelSettings.modelType}
                                    onChange={(e) => handleModelSettingChange('modelType', e.target.value)}
                                    label="Model Type"
                                >
                                    <MenuItem value="default">Default</MenuItem>
                                    <MenuItem value="fast">Fast (Smaller)</MenuItem>
                                    <MenuItem value="accurate">Accurate (Larger)</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Model Path"
                                value={modelSettings.modelPath}
                                onChange={(e) => handleModelSettingChange('modelPath', e.target.value)}
                                sx={{ mb: 2 }}
                            />

                            <Typography variant="subtitle2" gutterBottom>Inference Settings</Typography>

                            <Box sx={{ mb: 2 }}>
                                <Typography gutterBottom>Max Tokens</Typography>
                                <Slider
                                    value={modelSettings.inferenceSettings.maxTokens}
                                    onChange={(_, value) => handleModelSettingChange('inferenceSettings', {
                                        ...modelSettings.inferenceSettings,
                                        maxTokens: value as number
                                    })}
                                    min={50}
                                    max={500}
                                    step={50}
                                    marks
                                    valueLabelDisplay="auto"
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography gutterBottom>Temperature</Typography>
                                <Slider
                                    value={modelSettings.inferenceSettings.temperature}
                                    onChange={(_, value) => handleModelSettingChange('inferenceSettings', {
                                        ...modelSettings.inferenceSettings,
                                        temperature: value as number
                                    })}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    marks
                                    valueLabelDisplay="auto"
                                />
                            </Box>
                        </Box>

                        <Button variant="contained" color="primary" fullWidth>
                            Save Settings
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

const container = document.getElementById('options-root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <Options />
        </React.StrictMode>
    );
}