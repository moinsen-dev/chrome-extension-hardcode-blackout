import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Slider,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Switch
} from '@mui/material';
import {
    Shield as ShieldIcon,
    Analytics as AnalyticsIcon,
    VisibilityOff as VisibilityOffIcon,
    Psychology as PsychologyIcon
} from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StorageData } from '../../utils/types';
import { errorLogger, ExtensionError } from '../../utils/error-logger';



const Options: React.FC = () => {
    const [settings, setSettings] = useState<StorageData['settings'] | null>(null);
    const [modelSettings, setModelSettings] = useState<StorageData['modelSettings'] | null>(null);
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [setupStep, setSetupStep] = useState(0); // 0: welcome, 1: setup
    const [tabValue, setTabValue] = useState(0);
    const [ollamaAvailable, setOllamaAvailable] = useState(false);
    const [ollamaModels, setOllamaModels] = useState<string[]>([]);
    const [analyticsData, setAnalyticsData] = useState<{
        totalPosts: number;
        uniqueAuthors: number;
        avgEngagement: number;
        topAuthors: Array<{ name: string; postCount: number; avgEngagement: number }>;
        contentTypeDistribution: Array<{ type: string; count: number }>;
        dailyStats: Array<{ date: string; postCount: number; avgScore: number }>;
    } | null>(null);
    const [debugData, setDebugData] = useState<{
        errors: ExtensionError[];
        stats: {
            total: number;
            byComponent: Record<string, number>;
            bySeverity: Record<string, number>;
            last24Hours: number;
        };
    } | null>(null);

    useEffect(() => {
        // Check if we're in setup mode
        const urlParams = new URLSearchParams(window.location.search);
        const setupMode = urlParams.get('setup') === 'true';
        setIsSetupMode(setupMode);

        // Load settings
        chrome.storage.local.get(['settings'], (result) => {
            if (result.settings) {
                setSettings(result.settings.settings);
                setModelSettings(result.settings.modelSettings);
            }
        });

        // Check Ollama availability
        chrome.runtime.sendMessage({ type: 'CHECK_OLLAMA' }, (response) => {
            if (response && response.success) {
                setOllamaAvailable(response.available);
                setOllamaModels(response.models || []);
            }
        });

    }, []);

    useEffect(() => {
        // Fetch analytics data when analytics tab is selected
        if (tabValue === 1) {
            fetchAnalyticsData();
        }
        // Fetch debug data when debug tab is selected
        if (tabValue === 2) {
            fetchDebugData();
        }
    }, [tabValue]);

    const fetchAnalyticsData = async () => {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'GET_STATISTICS' });
            if (response.success && response.stats) {
                // Process the raw stats into the format we need for display
                setAnalyticsData({
                    totalPosts: response.stats.totalPosts || 0,
                    uniqueAuthors: response.stats.uniqueAuthors || 0,
                    avgEngagement: response.stats.avgEngagement || 0,
                    topAuthors: response.stats.topAuthors || [],
                    contentTypeDistribution: response.stats.contentTypes || [],
                    dailyStats: response.stats.dailyStats || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
        }
    };

    const fetchDebugData = async () => {
        try {
            const errors = await errorLogger.getErrors();
            const stats = await errorLogger.getErrorStats();
            setDebugData({ errors, stats });
        } catch (error) {
            console.error('Failed to fetch debug data:', error);
            // Try to log this error too
            errorLogger.logError('options', 'fetch-debug-data', error as Error, 'medium');
        }
    };

    const clearErrorLogs = async () => {
        try {
            await errorLogger.clearErrors();
            await fetchDebugData(); // Refresh the display
        } catch (error) {
            console.error('Failed to clear error logs:', error);
        }
    };

    const exportErrorLogs = () => {
        if (!debugData?.errors) return;
        
        const errorData = {
            exportedAt: new Date().toISOString(),
            extensionVersion: chrome.runtime.getManifest().version,
            errors: debugData.errors,
            stats: debugData.stats
        };
        
        const blob = new Blob([JSON.stringify(errorData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hardcore-blackout-errors-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSettingChange = (key: string, value: number | string | boolean | string[]) => {
        if (!settings) return;

        const newSettings = {
            ...settings,
            [key]: value
        };
        setSettings(newSettings);
    };

    const handleModelSettingChange = (key: string, value: number | string) => {
        if (!modelSettings) return;

        if (key === 'maxTokens' || key === 'temperature') {
            const newSettings = {
                ...modelSettings,
                inferenceSettings: {
                    ...modelSettings.inferenceSettings,
                    [key]: value
                }
            };
            setModelSettings(newSettings);
        } else {
            const newSettings = {
                ...modelSettings,
                [key]: value
            };
            setModelSettings(newSettings);
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

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const exportAnalytics = (format: 'csv' | 'json') => {
        if (!analyticsData) return;

        let content: string;
        let filename: string;
        let mimeType: string;

        if (format === 'csv') {
            // Create CSV content
            const headers = ['Metric', 'Value'];
            const rows = [
                ['Total Posts', analyticsData.totalPosts.toString()],
                ['Unique Authors', analyticsData.uniqueAuthors.toString()],
                ['Average Engagement', analyticsData.avgEngagement.toFixed(2)]
            ];

            // Add top authors
            if (analyticsData.topAuthors.length > 0) {
                rows.push(['', '']); // Empty row
                rows.push(['Top Authors', '']);
                rows.push(['Author Name', 'Post Count']);
                analyticsData.topAuthors.forEach(author => {
                    rows.push([author.name, author.postCount.toString()]);
                });
            }

            content = [headers, ...rows].map(row => row.join(',')).join('\n');
            filename = `hardcore-blackout-analytics-${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        } else {
            // Create JSON content
            content = JSON.stringify(analyticsData, null, 2);
            filename = `hardcore-blackout-analytics-${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        }

        // Create and trigger download
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!settings || !modelSettings) return <div>Loading...</div>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {isSetupMode ? 'Welcome to Hardcore Blackout' : 'Hardcore Blackout Settings'}
                </Typography>
                {isSetupMode && setupStep === 0 && (
                    <Box>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%', boxShadow: 3 }}>
                                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                        <ShieldIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h5" gutterBottom>
                                            Smart Content Filtering
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Uses advanced AI to analyze and rate social media content in real-time. 
                                            Hide low-quality posts, dim questionable content, and highlight gems.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%', boxShadow: 3 }}>
                                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                        <PsychologyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h5" gutterBottom>
                                            100% Private AI
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            All processing happens locally on your device. Your data never leaves 
                                            your browser. Choose between WASM models or your local Ollama server.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%', boxShadow: 3 }}>
                                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                        <VisibilityOffIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h5" gutterBottom>
                                            Reduce Noise & Toxicity
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Automatically hide spam, clickbait, and toxic content. Customize 
                                            thresholds to match your preferences for a cleaner feed.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%', boxShadow: 3 }}>
                                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                        <AnalyticsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h5" gutterBottom>
                                            Feed Analytics
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Track your feed's quality over time. See top authors, content types, 
                                            and engagement patterns to optimize your social media experience.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography variant="h6" gutterBottom color="text.secondary">
                                Take control of your social media experience
                            </Typography>
                            <Button 
                                variant="contained" 
                                size="large" 
                                onClick={() => setSetupStep(1)}
                                sx={{ mt: 2 }}
                            >
                                Get Started
                            </Button>
                        </Box>
                    </Box>
                )}
                
                {isSetupMode && setupStep === 1 && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Initial Setup</Typography>
                        <Typography paragraph>
                            Let&apos;s configure your content filter. You&apos;ll need to:
                        </Typography>
                        <ol>
                            <Typography component="li">Ensure Ollama is running on your system</Typography>
                            <Typography component="li">Select your preferred Ollama model</Typography>
                            <Typography component="li">Configure your filtering preferences</Typography>
                        </ol>
                        <Typography paragraph color="text.secondary">
                            You can always change these settings later.
                        </Typography>
                    </Paper>
                )}
            </Box>

            {!isSetupMode && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Settings" />
                        <Tab label="Analytics" />
                        <Tab label="Debug" />
                    </Tabs>
                </Box>
            )}

            {((isSetupMode && setupStep === 1) || (!isSetupMode && tabValue === 0)) && (
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

                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography gutterBottom>Default View Mode</Typography>
                                <Tooltip title="Choose whether rating overlays start in expanded or condensed view">
                                    <Typography variant="caption" color="text.secondary">
                                        ℹ️ What&apos;s this?
                                    </Typography>
                                </Tooltip>
                            </Box>
                            <RadioGroup
                                value={settings.defaultViewMode || 'condensed'}
                                onChange={(e) => handleSettingChange('defaultViewMode', e.target.value)}
                                row
                            >
                                <FormControlLabel 
                                    value="condensed" 
                                    control={<Radio />} 
                                    label="Condensed (Recommended)" 
                                />
                                <FormControlLabel 
                                    value="expanded" 
                                    control={<Radio />} 
                                    label="Expanded" 
                                />
                            </RadioGroup>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Condensed view shows only the score and category icon. Click the toggle button to expand.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Content Preferences</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Customize how the AI evaluates content based on your interests
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Your Content Preferences"
                                value={settings.userPrompt || ''}
                                onChange={(e) => handleSettingChange('userPrompt', e.target.value)}
                                placeholder="Example: I&apos;m interested in cutting-edge technology, AI research, and software architecture. I prefer technical depth over surface-level coverage."
                                helperText="Describe what kind of content you find valuable. This helps the AI better align ratings with your interests."
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                label="Topics of Interest"
                                value={settings.interestKeywords?.join(', ') || ''}
                                onChange={(e) => {
                                    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                                    handleSettingChange('interestKeywords', keywords);
                                }}
                                placeholder="AI, machine learning, software architecture, data science"
                                helperText="Comma-separated keywords for topics you're interested in"
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                label="Topics to Avoid"
                                value={settings.avoidKeywords?.join(', ') || ''}
                                onChange={(e) => {
                                    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                                    handleSettingChange('avoidKeywords', keywords);
                                }}
                                placeholder="politics, gossip, motivational quotes"
                                helperText="Comma-separated keywords for topics you want to avoid"
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography gutterBottom>Prefer Original Content</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Prioritize original insights over reshared content
                                </Typography>
                            </Box>
                            <Switch
                                checked={settings.preferOriginalContent ?? true}
                                onChange={(e) => handleSettingChange('preferOriginalContent', e.target.checked)}
                            />
                        </Box>

                        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>Example Preference Templates:</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                <strong>For Tech Enthusiasts:</strong> &quot;Focus on original research and data-driven insights. Prioritize content about emerging technologies, software architecture, and AI. Avoid motivational posts and reshared news.&quot;
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>For Business Professionals:</strong> &quot;I value strategic insights, market analysis, and leadership perspectives. Prefer content with actionable takeaways over theoretical discussions.&quot;
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>AI Model Settings</Typography>

                        <Box sx={{ mb: 4 }}>
                            {/* Ollama Status */}
                            <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: ollamaAvailable ? 'success.main' : 'warning.main', borderRadius: 1 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Ollama Status: {ollamaAvailable ? '✅ Connected' : '⚠️ Not Connected'}
                                </Typography>
                                {!ollamaAvailable && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Make sure Ollama is running on localhost:11434
                                    </Typography>
                                )}
                            </Box>

                            {!ollamaAvailable && (
                                <Box sx={{ mb: 2 }}>
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        onClick={() => {
                                            chrome.runtime.sendMessage({ type: 'CHECK_OLLAMA' }, (response) => {
                                                if (response && response.success) {
                                                    setOllamaAvailable(response.available);
                                                    setOllamaModels(response.models || []);
                                                }
                                            });
                                        }}
                                    >
                                        Check Ollama Status
                                    </Button>
                                </Box>
                            )}

                            {ollamaAvailable && (
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel>Ollama Model</InputLabel>
                                    <Select
                                        value={modelSettings.ollamaModel || 'llama3.2'}
                                        onChange={(e) => {
                                            const updatedSettings = {
                                                ...modelSettings,
                                                ollamaModel: e.target.value
                                            };
                                            setModelSettings(updatedSettings);
                                            chrome.storage.local.get('settings', (result) => {
                                                chrome.storage.local.set({
                                                    settings: {
                                                        ...result.settings,
                                                        modelSettings: updatedSettings
                                                    }
                                                });
                                            });
                                        }}
                                        label="Ollama Model"
                                    >
                                        {ollamaModels.map((model) => (
                                            <MenuItem key={model} value={model}>
                                                {model}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}


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
                                    onChange={(_, value) => handleModelSettingChange('maxTokens', value as number)}
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
                                    onChange={(_, value) => handleModelSettingChange('temperature', value as number)}
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
            )}

            {tabValue === 1 && !isSetupMode && (
                <Box>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Feed Analytics Overview</Typography>
                        {analyticsData ? (
                            <>
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" color="primary">{analyticsData.totalPosts}</Typography>
                                            <Typography variant="body2" color="text.secondary">Total Posts Analyzed</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" color="primary">{analyticsData.uniqueAuthors}</Typography>
                                            <Typography variant="body2" color="text.secondary">Unique Authors</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" color="primary">{analyticsData.avgEngagement.toFixed(1)}</Typography>
                                            <Typography variant="body2" color="text.secondary">Avg. Engagement</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                No analytics data available yet. Start browsing LinkedIn to collect data.
                            </Typography>
                        )}
                    </Paper>

                    {analyticsData && analyticsData.topAuthors.length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Top Authors by Frequency</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Authors you see most often in your feed
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Author</TableCell>
                                            <TableCell align="right">Times Seen</TableCell>
                                            <TableCell align="right">Avg. Engagement</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {analyticsData.topAuthors.slice(0, 10).map((author, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{author.name}</TableCell>
                                                <TableCell align="right">{author.postCount}</TableCell>
                                                <TableCell align="right">{author.avgEngagement}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Export Analytics Data</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="outlined" onClick={() => exportAnalytics('csv')}>
                                Export as CSV
                            </Button>
                            <Button variant="outlined" onClick={() => exportAnalytics('json')}>
                                Export as JSON
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            )}

            {tabValue === 2 && !isSetupMode && (
                <Box>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Extension Debug Information</Typography>
                        {debugData ? (
                            <>
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" color="primary">{debugData.stats.total}</Typography>
                                            <Typography variant="body2" color="text.secondary">Total Errors</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" color="error">{debugData.stats.last24Hours}</Typography>
                                            <Typography variant="body2" color="text.secondary">Last 24 Hours</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" color="warning.main">
                                                {debugData.stats.bySeverity.critical || 0}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">Critical Errors</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" color="success.main">
                                                {chrome.runtime.getManifest().version}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">Extension Version</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {Object.keys(debugData.stats.byComponent).length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" gutterBottom>Errors by Component</Typography>
                                        <Grid container spacing={2}>
                                            {Object.entries(debugData.stats.byComponent).map(([component, count]) => (
                                                <Grid item xs={6} md={3} key={component}>
                                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                        <Typography variant="h5" color="primary">{count}</Typography>
                                                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                            {component}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                Loading debug information...
                            </Typography>
                        )}
                    </Paper>

                    {debugData && debugData.errors.length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Recent Errors</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="outlined" size="small" onClick={exportErrorLogs}>
                                        Export Logs
                                    </Button>
                                    <Button variant="outlined" size="small" color="error" onClick={clearErrorLogs}>
                                        Clear All
                                    </Button>
                                </Box>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Time</TableCell>
                                            <TableCell>Component</TableCell>
                                            <TableCell>Operation</TableCell>
                                            <TableCell>Severity</TableCell>
                                            <TableCell>Error</TableCell>
                                            <TableCell>Context</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {debugData.errors.slice(0, 20).map((error) => (
                                            <TableRow key={error.id}>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {new Date(error.timestamp).toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                        {error.component}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {error.operation}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography 
                                                        variant="body2" 
                                                        color={
                                                            error.severity === 'critical' ? 'error' :
                                                            error.severity === 'high' ? 'warning.main' :
                                                            error.severity === 'medium' ? 'info.main' : 'text.secondary'
                                                        }
                                                        sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
                                                    >
                                                        {error.severity}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title={error.error.stack || error.error.message}>
                                                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {error.error.message}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {error.context?.url ? new URL(error.context.url).hostname : 
                                                         error.context?.platform || 
                                                         'N/A'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {debugData.errors.length > 20 && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                    Showing 20 most recent errors out of {debugData.errors.length} total
                                </Typography>
                            )}
                        </Paper>
                    )}

                    {(!debugData || debugData.errors.length === 0) && (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6" color="success.main" gutterBottom>
                                🎉 No Errors Found!
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                The extension is running smoothly without any logged errors.
                            </Typography>
                        </Paper>
                    )}
                </Box>
            )}

            {((isSetupMode && setupStep === 1) || !isSetupMode) && (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                    {isSetupMode && setupStep === 1 && (
                        <Button
                            variant="outlined"
                            onClick={() => setSetupStep(0)}
                        >
                            Back
                        </Button>
                    )}
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
            )}

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