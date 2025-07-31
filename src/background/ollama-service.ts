import { ContentRating, Post } from '../utils/types';
import { errorLogger } from '../utils/error-logger';

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
            
            // Try direct fetch first
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json'
                }
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
                await fetch(`${this.baseUrl}/api/version`, {
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
                await errorLogger.logError('ollama-service', 'check-availability', innerError as Error, 'medium', {
                    baseUrl: this.baseUrl,
                    attemptType: 'fallback-health-check'
                });
            }
        }
        
        this.isAvailable = false;
        await errorLogger.logMessage('ollama-service', 'check-availability', 'Ollama service is unavailable', 'medium', {
            baseUrl: this.baseUrl
        });
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
            const error = new Error('Ollama service is not available');
            await errorLogger.logError('ollama-service', 'analyze-content', error, 'high', {
                postId: post.id,
                platform: post.platform,
                modelName,
                ollamaAvailable: this.isAvailable
            });
            throw error;
        }

        const prompt = this.createAnalysisPrompt(post);
        
        try {
            // Use Chrome extension compatible fetch for localhost
            const requestBody = {
                model: modelName,
                prompt: prompt,
                stream: false,
                format: 'json',
                system: `You are a multilingual content quality analyzer. Analyze social media posts in ANY language (English, German, French, Spanish, etc.) and provide consistent ratings in JSON format.

IMPORTANT: You must analyze content and detect patterns regardless of language. Apply the same quality standards and classification logic to German, English, French, or any other language.

Rate each aspect on a scale of 1-10:
- Content Quality (writingQuality, informationDensity, sourceCredibility, originality)
- Emotional Impact (toxicityLevel, emotionalManipulation, socialHarmony)
- User Preferences (topicAlignment, sourcePreference, historicalInteraction)

CONTENT CLASSIFICATION GUIDE (apply to any language):
- personal: Personal stories, life updates, emotional experiences, opinions, casual conversations
- business: Business strategies, company updates, professional insights, entrepreneurship, management tips  
- tech: Technology news, software development, IT topics, gadgets, AI/ML, cybersecurity
- finance: Financial markets, investments, economic news, banking, cryptocurrency, trading
- news: Current events, journalism, breaking news, media reports from news organizations (NOT company PR)
- entertainment: Movies, music, games, sports, celebrity news, humor, memes
- education: Tutorials, courses, learning resources, how-to guides, academic content, skill development
- advertisement: Product promotions, sponsored content, commercial offers, sales pitches, marketing campaigns
- promotion: Personal branding, self-promotion, networking posts, achievements (non-commercial)
- politics: Political news, government policies, elections, political opinions, activism
- other: Content that doesn't clearly fit other categories

MULTILINGUAL CLASSIFICATION SIGNALS:
Detect these patterns in ANY language:
- Sponsored/promoted content indicators:
  * English: "Sponsored", "Promoted", "Ad"
  * German: "Anzeige", "Gesponsert", "Beworben", "Werbung"  
  * French: "Sponsorisé", "Publicité", "Annonce"
- Commercial language (English: "Buy now", German: "Jetzt kaufen", French: "Acheter maintenant")
- Call-to-action phrases (English: "Sign up", German: "Hier anmelden", French: "S'inscrire")
- Company promotional content vs. news reporting
- Personal achievements vs. commercial advertisements
- Educational content vs. sales pitches

CRITICAL: If you see "Anzeige" anywhere in German content, this is ALWAYS an advertisement, regardless of the content topic.

IMPORTANT DISTINCTIONS:
- Posts labeled "Anzeige" (German) or "Sponsored" (English) = ALWAYS "advertisement"  
- News articles from established media (t3n, BBC, CNN, etc.) = "news" even if they mention products
- Company posts selling products/services = "advertisement"
- Individuals sharing personal achievements = "promotion"  
- Product reviews by regular users = "personal" or relevant category (not "advertisement")
- Educational tutorials teaching skills = "education"

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
            };

            // Chrome extension compatible fetch - no explicit timeout needed as Chrome handles it
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorDetails = {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                    headers: Object.fromEntries(response.headers.entries())
                };
                
                let errorBody = '';
                try {
                    errorBody = await response.text();
                } catch (e) {
                    // Ignore if we can't read the body
                }
                
                const errorMessage = `Ollama API error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`;
                console.error('Ollama API response error:', errorDetails);
                
                throw new Error(errorMessage);
            }

            const data: OllamaResponse = await response.json();
            const rating = await this.parseOllamaResponse(data.response);
            
            // Add debug info to the rating object
            (rating as any).debugInfo = {
                prompt,
                response: data.response,
                timestamp: Date.now()
            };
            
            return rating;
        } catch (error) {
            console.error('Error calling Ollama API:', error);
            await errorLogger.logError('ollama-service', 'ollama-api-call', error as Error, 'high', {
                postId: post.id,
                platform: post.platform,
                modelName,
                baseUrl: this.baseUrl,
                promptLength: prompt.length
            });
            throw error;
        }
    }

    private createAnalysisPrompt(post: Post): string {
        const contextInfo = [];
        
        // Add title if available
        if (post.title) {
            contextInfo.push(`Title: "${post.title}"`);
        }
        
        // Add author profile information
        if (post.contextualInfo?.authorProfile) {
            contextInfo.push(`Author Profile: ${post.contextualInfo.authorProfile}`);
        }
        
        // Add post type context
        if (post.contextualInfo?.postType) {
            contextInfo.push(`Post Type: ${post.contextualInfo.postType}`);
        }
        
        // Add media and link information
        const mediaInfo = [];
        if (post.contextualInfo?.hasMedia) mediaInfo.push('contains media');
        if (post.contextualInfo?.hasLinks) mediaInfo.push('contains external links');
        if (mediaInfo.length > 0) {
            contextInfo.push(`Media: ${mediaInfo.join(', ')}`);
        }
        
        // Add engagement metrics if available
        if (post.contextualInfo?.engagementMetrics) {
            const metrics = post.contextualInfo.engagementMetrics;
            const engagementParts = [];
            if (metrics.likes) engagementParts.push(`${metrics.likes} likes`);
            if (metrics.comments) engagementParts.push(`${metrics.comments} comments`);
            if (metrics.shares) engagementParts.push(`${metrics.shares} shares`);
            if (engagementParts.length > 0) {
                contextInfo.push(`Engagement: ${engagementParts.join(', ')}`);
            }
        }
        
        // Add platform-specific hints (but let AI make final decision)
        if (post.contextualInfo?.platformSpecific) {
            const hints = [];
            const platformData = post.contextualInfo.platformSpecific;
            if (platformData.hasPromotedTag) hints.push('platform shows promoted/sponsored indicators');
            if (platformData.hasFollowersInfo) hints.push('author has follower count visible');
            if (platformData.hasExternalArticle) hints.push('links to external article');
            if (hints.length > 0) {
                contextInfo.push(`Platform Signals: ${hints.join(', ')}`);
            }
        }
        
        return `Analyze this social media post and provide comprehensive ratings. You must determine ALL classification aspects from the content itself, including whether it's sponsored, promotional, or commercial.

Content: "${post.content}"
Author: ${post.author}
Platform: ${post.platform}
${contextInfo.length > 0 ? '\nAdditional Context:\n' + contextInfo.map(info => `- ${info}`).join('\n') : ''}

Your task: Analyze this content in ANY language (English, German, French, etc.) and determine:
1. Content quality metrics
2. Emotional impact
3. User preference alignment  
4. Content category classification
5. Whether this is sponsored/promotional content (regardless of language)

Look for promotional language, commercial intent, sponsored indicators, and advertisement patterns in any language.

CRITICAL CLASSIFICATION RULES:
- If content contains "Anzeige" (German) or "Sponsored" (English) labels → MUST classify as "advertisement"
- If posted by a company account promoting their products/services → "advertisement"  
- If individual sharing personal achievements → "promotion"
- If news organization reporting → "news" (even if mentioning products)
- Commercial product promotions and sponsored content → "advertisement"

PAY SPECIAL ATTENTION to platform signals in the context - if marked as sponsored/promoted, classify accordingly.

Provide ratings in JSON format as specified.`;
    }

    private async parseOllamaResponse(response: string): Promise<ContentRating> {
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
            await errorLogger.logError('ollama-service', 'parse-response', error as Error, 'medium', {
                rawResponse: response.length > 1000 ? response.substring(0, 1000) + '...' : response
            });
            throw new Error('Invalid response format from Ollama');
        }
    }

    async testConnection(): Promise<boolean> {
        return this.checkAvailability();
    }
}

export const ollamaService = OllamaService.getInstance();