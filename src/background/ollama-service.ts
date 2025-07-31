import { ContentRating, Post } from '../utils/types';

interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    modified_at: string;
}

interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
}

export class OllamaService {
    private static instance: OllamaService;
    private baseUrl: string = 'http://localhost:11434';
    private isAvailable: boolean = false;
    private availableModels: OllamaModel[] = [];

    private constructor() {
        this.checkAvailability();
    }

    static getInstance(): OllamaService {
        if (!OllamaService.instance) {
            OllamaService.instance = new OllamaService();
        }
        return OllamaService.instance;
    }

    async checkAvailability(): Promise<boolean> {
        try {
            console.log('Checking Ollama availability at:', this.baseUrl);
            
            // Try the /api/tags endpoint first (lists models)
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.availableModels = data.models || [];
                this.isAvailable = true;
                console.log('Ollama is available with models:', this.availableModels.map(m => m.name));
                return true;
            } else {
                console.log('Ollama responded with status:', response.status);
            }
        } catch (error) {
            // If CORS fails, try a simple health check
            try {
                console.log('Initial check failed, trying alternative endpoint...');
                const healthResponse = await fetch(`${this.baseUrl}/api/version`, {
                    method: 'GET',
                    mode: 'no-cors' // This won't give us the response body but will tell us if the server exists
                });
                
                // If we get here without an error, Ollama is likely running but has CORS issues
                console.log('Ollama appears to be running but may have CORS restrictions');
                
                // Try to use it anyway - the actual API calls might work
                this.isAvailable = true;
                this.availableModels = [
                    { name: 'llama3.2', size: 0, digest: '', modified_at: '' },
                    { name: 'gemma3:4b', size: 0, digest: '', modified_at: '' },
                    { name: 'mistral', size: 0, digest: '', modified_at: '' },
                    { name: 'phi3', size: 0, digest: '', modified_at: '' }
                ];
                return true;
            } catch (innerError) {
                console.log('Ollama is not accessible:', innerError);
            }
        }
        
        this.isAvailable = false;
        return false;
    }

    getAvailableModels(): string[] {
        return this.availableModels.map(model => model.name);
    }

    isOllamaAvailable(): boolean {
        return this.isAvailable;
    }

    async analyzeContent(post: Post, modelName: string = 'llama3.2'): Promise<ContentRating> {
        if (!this.isAvailable) {
            throw new Error('Ollama service is not available');
        }

        const prompt = this.createAnalysisPrompt(post);
        
        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelName,
                    prompt: prompt,
                    stream: false,
                    format: 'json',
                    system: `You are a content quality analyzer. Analyze social media posts and provide ratings in JSON format.
                    
Rate each aspect on a scale of 1-10:
- Content Quality (writingQuality, informationDensity, sourceCredibility, originality)
- Emotional Impact (toxicityLevel, emotionalManipulation, socialHarmony)
- User Preferences (topicAlignment, sourcePreference, historicalInteraction)

Also classify the content into one of these categories:
personal, business, tech, finance, news, entertainment, education, promotion, politics, other

Respond ONLY with valid JSON in this exact format:
{
  "contentQuality": {
    "writingQuality": 7,
    "informationDensity": 6,
    "sourceCredibility": 8,
    "originality": 5
  },
  "emotionalImpact": {
    "toxicityLevel": 3,
    "emotionalManipulation": 4,
    "socialHarmony": 7
  },
  "userPreferences": {
    "topicAlignment": 6,
    "sourcePreference": 7,
    "historicalInteraction": 5
  },
  "contentType": {
    "category": "business",
    "confidence": 0.85
  }
}`
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data: OllamaResponse = await response.json();
            return this.parseOllamaResponse(data.response);
        } catch (error) {
            console.error('Error calling Ollama API:', error);
            throw error;
        }
    }

    private createAnalysisPrompt(post: Post): string {
        return `Analyze this social media post and rate it on multiple dimensions:

Content: "${post.content}"
Author: ${post.author}
Platform: ${post.platform}

Provide ratings in JSON format as specified.`;
    }

    private parseOllamaResponse(response: string): ContentRating {
        try {
            const ratings = JSON.parse(response);
            
            // Calculate weighted overall score
            const weights = { contentQuality: 0.4, emotionalImpact: 0.3, userPreferences: 0.3 };
            const contentQualityValues = Object.values(ratings.contentQuality) as number[];
            const emotionalImpactValues = Object.values(ratings.emotionalImpact) as number[];
            const userPreferencesValues = Object.values(ratings.userPreferences) as number[];
            
            const contentScore = contentQualityValues.reduce((a, b) => a + b, 0) / contentQualityValues.length;
            const emotionalScore = emotionalImpactValues.reduce((a, b) => a + b, 0) / emotionalImpactValues.length;
            const preferenceScore = userPreferencesValues.reduce((a, b) => a + b, 0) / userPreferencesValues.length;
            
            const overallScore = Math.round(
                (contentScore * weights.contentQuality +
                 emotionalScore * weights.emotionalImpact +
                 preferenceScore * weights.userPreferences) * 10
            );

            return {
                overallScore: Math.max(0, Math.min(100, overallScore)),
                contentQuality: ratings.contentQuality,
                emotionalImpact: ratings.emotionalImpact,
                userPreferences: ratings.userPreferences,
                contentType: ratings.contentType || { category: 'other', confidence: 0.5 },
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Failed to parse Ollama response:', error);
            throw new Error('Invalid response format from Ollama');
        }
    }

    async testConnection(): Promise<boolean> {
        return this.checkAvailability();
    }
}

export const ollamaService = OllamaService.getInstance();