import {
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Slider,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StorageData } from '../../utils/types';

interface ModelInfo {
    name: string;
    size: string;
    description: string;
    downloaded: boolean;
    downloading?: boolean;
}

const MODEL_INFO: { [key: string]: ModelInfo } = {
    'fast': {
        name: 'TinyLlama 1.1B',
        size: '~1GB',
        description: 'Fastest option, best for laptops and low-resource devices. Provides quick analysis with reasonable accuracy.',
        downloaded: false
    },
    'default': {
        name: 'Llama-2-7B',
        size: '~4GB',
        description: 'Balanced option recommended for most users. Good mix of speed and accuracy.',
        downloaded: false
    },
    'accurate': {
        name: 'Llama-2-13B',
        size: '~8GB',
        description: 'Most accurate option, but requires more resources. Best for desktop computers with 8GB+ RAM.',
        downloaded: false
    }
};

const Options: React.FC = () => {
    const [settings, setSettings] = useState<StorageData['settings'] | null>(null);
    const [modelSettings, setModelSettings] = useState<StorageData['modelSettings'] | null>(null);
    const [modelStates, setModelStates] = useState<{ [key: string]: ModelInfo }>(MODEL_INFO);
    const [isClearing, setIsClearing] = useState(false);
    const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<{ modelType: string; progress: number } | null>(null);

    useEffect(() => {
        // Check if we're in setup mode
        const urlParams = new URLSearchParams(window.location.search);
        const setupMode = urlParams.get('setup') === 'true';
        setIsSetupMode(setupMode);

        // Load settings and check model states
        chrome.storage.local.get(['settings', 'modelStates'], (result) => {
            setSettings(result.settings?.settings);
            setModelSettings(result.settings?.modelSettings);
            if (result.modelStates) {
                setModelStates(result.modelStates);
            }
        });

        // Add message listener for download progress
        const handleMessage = (message: any) => {
            if (message.type === 'DOWNLOAD_PROGRESS') {
                setDownloadProgress({
                    modelType: message.modelType,
                    progress: message.progress
                });
            } else if (message.type === 'DOWNLOAD_COMPLETE') {
                setDownloadProgress(null);
                setDownloadingModel(null);
                // Update model state
                const newModelStates = { ...modelStates };
                newModelStates[message.modelType].downloaded = true;
                setModelStates(newModelStates);
                chrome.storage.local.set({ modelStates: newModelStates });
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);

    const handleSettingChange = (key: string, value: number) => {
        if (!settings) return;

        const newSettings = {
            ...settings,
            [key]: value
        };
        setSettings(newSettings);
    };

    const handleModelTypeChange = (type: string) => {
        if (!modelSettings) return;

        const modelPaths = {
            'fast': 'models/tiny.gguf',
            'default': 'models/small.gguf',
            'accurate': 'models/medium.gguf'
        };

        const newModelSettings = {
            ...modelSettings,
            modelType: type,
            modelPath: modelPaths[type as keyof typeof modelPaths]
        };
        setModelSettings(newModelSettings);
    };

    const handleClearModels = async () => {
        setIsClearing(true);
        try {
            // Send message to background script to clear models
            await chrome.runtime.sendMessage({ type: 'CLEAR_MODELS' });
            // Update model states
            const newModelStates = { ...MODEL_INFO };  // Reset to initial state
            Object.keys(newModelStates).forEach(key => {
                newModelStates[key] = {
                    ...MODEL_INFO[key],
                    downloaded: false,
                    downloading: false
                };
            });
            setModelStates(newModelStates);
            chrome.storage.local.set({ modelStates: newModelStates });
        } catch (error) {
            console.error('Failed to clear models:', error);
        } finally {
            setIsClearing(false);
            setDownloadingModel(null);  // Reset downloading state
            setDownloadProgress(null);  // Reset progress state
        }
    };

    const handleDownloadModel = async (modelType: string) => {
        setDownloadingModel(modelType);
        try {
            await chrome.runtime.sendMessage({
                type: 'DOWNLOAD_MODEL',
                modelType
            });

            // Update model state
            const newModelStates = { ...modelStates };
            newModelStates[modelType].downloaded = true;
            setModelStates(newModelStates);
            chrome.storage.local.set({ modelStates: newModelStates });
        } catch (error) {
            console.error('Failed to download model:', error);
        } finally {
            setDownloadingModel(null);
        }
    };

    const handleSave = async () => {
        if (!settings || !modelSettings) return;

        // Create the complete settings object
        const completeSettings: StorageData = {
            settings: settings,
            modelSettings: modelSettings,
            cachedRatings: {},
            userFeedback: {},
            isInitialized: isSetupMode ? true : (await chrome.storage.local.get('settings')).settings?.isInitialized ?? false
        };

        // Save all settings
        await chrome.storage.local.set({ settings: completeSettings });

        // If in setup mode, notify background script that setup is complete
        if (isSetupMode) {
            await chrome.runtime.sendMessage({ type: 'SETUP_COMPLETE' });
            // Close the current tab instead of the window
            const currentTab = await chrome.tabs.getCurrent();
            if (currentTab?.id) {
                await chrome.tabs.remove(currentTab.id);
            }
        } else {
            window.close();
        }
    };

    const handleCancel = () => {
        window.close();
    };

    if (!settings || !modelSettings) return <div>Loading...</div>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {isSetupMode ? 'Welcome to Hardcore Blackout' : 'Hardcore Blackout Settings'}
                </Typography>
                {isSetupMode && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Initial Setup</Typography>
                        <Typography paragraph>
                            Welcome! Let&apos;s get your content filter set up. First, you&apos;ll need to:
                        </Typography>
                        <ol>
                            <Typography component="li">Choose your preferred AI model</Typography>
                            <Typography component="li">Download the selected model</Typography>
                            <Typography component="li">Configure your filtering preferences</Typography>
                        </ol>
                        <Typography paragraph color="text.secondary">
                            You can always change these settings later.
                        </Typography>
                    </Paper>
                )}
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Content Filtering</Typography>

                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography gutterBottom>Auto-Hide Threshold</Typography>
                                <Tooltip title="Posts with scores below this value will be automatically hidden from view">
                                    <Typography variant="caption" color="text.secondary">
                                        ℹ️ What&apos;s this?
                                    </Typography>
                                </Tooltip>
                            </Box>
                            <Slider
                                value={settings.autoHideThreshold}
                                onChange={(_, value) => handleSettingChange('autoHideThreshold', value as number)}
                                min={0}
                                max={100}
                                step={5}
                                marks
                                valueLabelDisplay="auto"
                            />
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Recommended: 20-30. Lower values mean fewer posts will be hidden.
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography gutterBottom>Dim Threshold</Typography>
                                <Tooltip title="Posts with scores below this value will appear dimmed but still visible">
                                    <Typography variant="caption" color="text.secondary">
                                        ℹ️ What&apos;s this?
                                    </Typography>
                                </Tooltip>
                            </Box>
                            <Slider
                                value={settings.dimThreshold}
                                onChange={(_, value) => handleSettingChange('dimThreshold', value as number)}
                                min={0}
                                max={100}
                                step={5}
                                marks
                                valueLabelDisplay="auto"
                            />
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Recommended: 40-50. Helps identify potentially low-quality content.
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography gutterBottom>Highlight Threshold</Typography>
                                <Tooltip title="Posts with scores above this value will be highlighted as high-quality content">
                                    <Typography variant="caption" color="text.secondary">
                                        ℹ️ What&apos;s this?
                                    </Typography>
                                </Tooltip>
                            </Box>
                            <Slider
                                value={settings.highlightThreshold}
                                onChange={(_, value) => handleSettingChange('highlightThreshold', value as number)}
                                min={0}
                                max={100}
                                step={5}
                                marks
                                valueLabelDisplay="auto"
                            />
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Recommended: 80-90. Only the highest quality content will be highlighted.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>AI Model Settings</Typography>

                        <Box sx={{ mb: 4 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Model Type</InputLabel>
                                <Select
                                    value={modelSettings.modelType}
                                    onChange={(e) => handleModelTypeChange(e.target.value)}
                                    label="Model Type"
                                >
                                    {Object.entries(modelStates).map(([key, info]) => (
                                        <MenuItem key={key} value={key}>
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle1">
                                                        {info.name} ({info.size})
                                                    </Typography>
                                                    {!info.downloaded && (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadModel(key);
                                                            }}
                                                            disabled={downloadingModel === key}
                                                        >
                                                            {downloadingModel === key ? (
                                                                <>
                                                                    <CircularProgress size={16} sx={{ mr: 1 }} />
                                                                    Downloading...
                                                                </>
                                                            ) : (
                                                                'Download Model'
                                                            )}
                                                        </Button>
                                                    )}
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {info.description}
                                                </Typography>
                                                <Typography variant="caption" color={info.downloaded ? "success.main" : "warning.main"}>
                                                    {info.downloaded ? "✓ Downloaded" : "⚠️ Not downloaded"}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={handleClearModels}
                                disabled={isClearing}
                                sx={{ mb: 3 }}
                            >
                                {isClearing ? "Clearing Models..." : "Clear Downloaded Models"}
                            </Button>

                            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Inference Settings</Typography>

                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography gutterBottom>Max Tokens</Typography>
                                    <Tooltip title="Controls the maximum length of the AI&apos;s analysis. Higher values mean more detailed analysis but slower processing.">
                                        <Typography variant="caption" color="text.secondary">
                                            ℹ️ What&apos;s this?
                                        </Typography>
                                    </Tooltip>
                                </Box>
                                <Slider
                                    value={modelSettings.inferenceSettings.maxTokens}
                                    onChange={(_, value) => handleSettingChange('maxTokens', value as number)}
                                    min={50}
                                    max={500}
                                    step={50}
                                    marks
                                    valueLabelDisplay="auto"
                                />
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    Recommended: 100. Increase for more detailed analysis, decrease for faster processing.
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography gutterBottom>Temperature</Typography>
                                    <Tooltip title="Controls how creative or conservative the AI&apos;s analysis is. Lower values mean more consistent ratings.">
                                        <Typography variant="caption" color="text.secondary">
                                            ℹ️ What&apos;s this?
                                        </Typography>
                                    </Tooltip>
                                </Box>
                                <Slider
                                    value={modelSettings.inferenceSettings.temperature}
                                    onChange={(_, value) => handleSettingChange('temperature', value as number)}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    marks
                                    valueLabelDisplay="auto"
                                />
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    Recommended: 0.7. Lower values (0.1-0.3) for more consistent ratings.
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                {!isSetupMode && (
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                >
                    {isSetupMode ? 'Complete Setup' : 'Save Settings'}
                </Button>
            </Box>

            {/* Add Progress Dialog */}
            <Dialog
                open={downloadProgress !== null}
                aria-labelledby="download-dialog-title"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="download-dialog-title">
                    Downloading Model
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            Downloading {downloadProgress?.modelType} model...
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={downloadProgress?.progress ?? 0}
                            sx={{ my: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary" align="right">
                            {Math.round(downloadProgress?.progress ?? 0)}%
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>
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