import initSqlJs, { Database } from 'sql.js';

export interface Author {
  id: string;
  name: string;
  headline: string;
  profileUrl: string;
  verified: boolean;
}

export interface FeedItem {
  id: string;
  authorId: string;
  content: string;
  postType: 'post' | 'article' | 'video' | 'document';
  reactionCount: number;
  commentCount: number;
  repostCount: number;
  reactionTypes: string[];
  hasMedia: boolean;
  mediaType?: string;
  mediaTitle?: string;
  linkedinTimestamp: string;
  capturedAt?: string;
  // Enhanced fields for AI analysis
  overallScore?: number;
  contentCategory?: string;
  categoryConfidence?: number;
  contentQualityScore?: number;
  emotionalImpactScore?: number;
  userPreferenceScore?: number;
  isAIGenerated?: boolean;
  aiConfidence?: number;
}

export interface EngagementSnapshot {
  feedItemId: string;
  reactionCount: number;
  commentCount: number;
  repostCount: number;
  capturedAt: string;
}

export class DatabaseService {
  private db: Database | null = null;
  private SQL: any = null;

  async initialize(): Promise<void> {
    try {
      console.log('DatabaseService: Starting initialization...');
      
      // Initialize SQL.js with the WebAssembly file
      this.SQL = await initSqlJs({
        locateFile: (file: string) => {
          if (file === 'sql-wasm.wasm') {
            return chrome.runtime.getURL('sql-wasm.wasm');
          }
          return file;
        }
      });

      console.log('DatabaseService: SQL.js initialized');

      // Check if database exists in storage
      const stored = await chrome.storage.local.get('feedDatabase');
      
      if (stored.feedDatabase) {
        // Load existing database
        console.log('DatabaseService: Loading existing database');
        const buf = new Uint8Array(stored.feedDatabase);
        if (!this.SQL) throw new Error('SQL.js not initialized');
        this.db = new this.SQL.Database(buf);
        
        // Verify tables exist
        if (this.db) {
          const tables = this.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
          console.log('DatabaseService: Existing tables:', tables && tables[0] ? tables[0].values : 'none');
        }
      } else {
        // Create new database
        console.log('DatabaseService: Creating new database');
        if (!this.SQL) throw new Error('SQL.js not initialized');
        this.db = new this.SQL.Database();
        await this.createTables();
      }

      // Check and upgrade schema if needed
      await this.upgradeSchema();
      
      console.log('DatabaseService: Initialization complete');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('DatabaseService: Creating tables with enhanced schema...');

    const schema = `
      CREATE TABLE IF NOT EXISTS authors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        headline TEXT,
        profile_url TEXT,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feed_items (
        id TEXT PRIMARY KEY,
        author_id TEXT NOT NULL,
        content TEXT,
        post_type TEXT,
        reaction_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        repost_count INTEGER DEFAULT 0,
        reaction_types TEXT,
        has_media BOOLEAN DEFAULT FALSE,
        media_type TEXT,
        media_title TEXT,
        linkedin_timestamp TIMESTAMP,
        captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- AI Analysis fields
        overall_score INTEGER,
        content_category TEXT,
        category_confidence REAL,
        content_quality_score REAL,
        emotional_impact_score REAL,
        user_preference_score REAL,
        is_ai_generated BOOLEAN,
        ai_confidence REAL,
        FOREIGN KEY (author_id) REFERENCES authors(id)
      );

      CREATE TABLE IF NOT EXISTS engagement_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feed_item_id TEXT NOT NULL,
        reaction_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        repost_count INTEGER DEFAULT 0,
        captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (feed_item_id) REFERENCES feed_items(id)
      );

      CREATE INDEX IF NOT EXISTS idx_feed_items_captured_at ON feed_items(captured_at);
      CREATE INDEX IF NOT EXISTS idx_feed_items_author_id ON feed_items(author_id);
      CREATE INDEX IF NOT EXISTS idx_engagement_feed_item ON engagement_snapshots(feed_item_id);
    `;

    this.db.run(schema);
    await this.saveDatabase();
    console.log('DatabaseService: Tables created successfully');
  }

  private async upgradeSchema(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log('DatabaseService: Checking for schema upgrades...');

      // Check if new AI analysis columns exist
      const tableInfo = this.db.exec("PRAGMA table_info(feed_items)");
      const columns = tableInfo[0]?.values.map(row => row[1] as string) || [];
      
      const newColumns = [
        'overall_score', 'content_category', 'category_confidence',
        'content_quality_score', 'emotional_impact_score', 'user_preference_score',
        'is_ai_generated', 'ai_confidence'
      ];

      let needsUpgrade = false;
      for (const col of newColumns) {
        if (!columns.includes(col)) {
          console.log(`DatabaseService: Missing column: ${col}`);
          needsUpgrade = true;
        }
      }

      if (needsUpgrade) {
        console.log('DatabaseService: Upgrading schema...');
        
        // Add missing columns
        const alterStatements = [
          'ALTER TABLE feed_items ADD COLUMN overall_score INTEGER',
          'ALTER TABLE feed_items ADD COLUMN content_category TEXT',
          'ALTER TABLE feed_items ADD COLUMN category_confidence REAL',
          'ALTER TABLE feed_items ADD COLUMN content_quality_score REAL',
          'ALTER TABLE feed_items ADD COLUMN emotional_impact_score REAL',
          'ALTER TABLE feed_items ADD COLUMN user_preference_score REAL',
          'ALTER TABLE feed_items ADD COLUMN is_ai_generated BOOLEAN',
          'ALTER TABLE feed_items ADD COLUMN ai_confidence REAL'
        ];

        for (const statement of alterStatements) {
          try {
            this.db.run(statement);
          } catch (error) {
            // Column might already exist, that's okay
            console.log(`DatabaseService: Column alter skipped (might exist): ${error}`);
          }
        }

        await this.saveDatabase();
        console.log('DatabaseService: Schema upgrade completed');
      } else {
        console.log('DatabaseService: Schema is up to date');
      }
    } catch (error) {
      console.error('DatabaseService: Schema upgrade failed:', error);
      // Don't throw - let the database work with whatever schema it has
    }
  }

  private async saveDatabase(): Promise<void> {
    if (!this.db) return;
    
    const data = this.db.export();
    await chrome.storage.local.set({ feedDatabase: Array.from(data) });
  }

  async feedItemExists(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare("SELECT 1 FROM feed_items WHERE id = ?");
    const result = stmt.get([id]);
    stmt.free();
    return !!result;
  }

  async upsertAuthor(author: Author): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO authors (id, name, headline, profile_url, verified)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        headline = excluded.headline,
        profile_url = excluded.profile_url,
        verified = excluded.verified,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run([author.id, author.name, author.headline, author.profileUrl, author.verified ? 1 : 0]);
    stmt.free();
    await this.saveDatabase();
  }

  async insertFeedItem(item: FeedItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO feed_items (
        id, author_id, content, post_type, reaction_count, 
        comment_count, repost_count, reaction_types, has_media, 
        media_type, media_title, linkedin_timestamp,
        overall_score, content_category, category_confidence,
        content_quality_score, emotional_impact_score, user_preference_score,
        is_ai_generated, ai_confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      item.id, 
      item.authorId, 
      item.content, 
      item.postType,
      item.reactionCount, 
      item.commentCount, 
      item.repostCount,
      JSON.stringify(item.reactionTypes), 
      item.hasMedia ? 1 : 0, 
      item.mediaType || null,
      item.mediaTitle || null, 
      item.linkedinTimestamp,
      // AI Analysis fields
      item.overallScore || null,
      item.contentCategory || null,
      item.categoryConfidence || null,
      item.contentQualityScore || null,
      item.emotionalImpactScore || null,
      item.userPreferenceScore || null,
      item.isAIGenerated ? 1 : 0,
      item.aiConfidence || null
    ]);
    stmt.free();
    
    // Create initial engagement snapshot
    await this.createEngagementSnapshot({
      feedItemId: item.id,
      reactionCount: item.reactionCount,
      commentCount: item.commentCount,
      repostCount: item.repostCount,
      capturedAt: new Date().toISOString()
    });
    
    await this.saveDatabase();
  }

  async createEngagementSnapshot(snapshot: EngagementSnapshot): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO engagement_snapshots (feed_item_id, reaction_count, comment_count, repost_count)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run([
      snapshot.feedItemId, 
      snapshot.reactionCount, 
      snapshot.commentCount, 
      snapshot.repostCount
    ]);
    stmt.free();
  }

  async processFeedItem(data: any): Promise<{ status: string }> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('DatabaseService: Processing feed item:', data.id);

    // Convert from feed analyzer format to database format
    const author: Author = data.author;
    const feedItem: FeedItem = {
      id: data.id,
      authorId: author.id,
      content: data.content,
      postType: data.postType,
      reactionCount: data.reactionCount,
      commentCount: data.commentCount,
      repostCount: data.repostCount,
      reactionTypes: data.reactionTypes,
      hasMedia: data.hasMedia,
      mediaType: data.mediaType,
      mediaTitle: data.mediaTitle,
      linkedinTimestamp: data.timestamp
    };

    // Check if item already exists
    const exists = await this.feedItemExists(feedItem.id);
    if (exists) {
      console.log('DatabaseService: Feed item already exists, updating engagement snapshot');
      // Update engagement snapshot for existing item
      await this.createEngagementSnapshot({
        feedItemId: feedItem.id,
        reactionCount: feedItem.reactionCount,
        commentCount: feedItem.commentCount,
        repostCount: feedItem.repostCount,
        capturedAt: new Date().toISOString()
      });
      return { status: 'updated' };
    }

    console.log('DatabaseService: Inserting new feed item');
    
    // Insert new author or update existing
    await this.upsertAuthor(author);

    // Insert new feed item
    await this.insertFeedItem(feedItem);

    // Create initial engagement snapshot
    await this.createEngagementSnapshot({
      feedItemId: feedItem.id,
      reactionCount: feedItem.reactionCount,
      commentCount: feedItem.commentCount,
      repostCount: feedItem.repostCount,
      capturedAt: new Date().toISOString()
    });

    console.log('DatabaseService: Feed item inserted successfully');
    return { status: 'inserted' };
  }

  async getStatistics(): Promise<{
    totalPosts: number;
    uniqueAuthors: number;
    avgEngagement: number;
    topAuthors: Array<{ name: string; postCount: number; avgEngagement: number }>;
    contentTypes: Array<{ type: string; count: number }>;
    dailyStats: Array<{ date: string; postCount: number; avgScore: number }>;
    // Enhanced Author Analytics
    authorCategoryAnalysis: Array<{
      authorName: string;
      authorId: string;
      postCount: number;
      categories: Array<{ category: string; count: number; percentage: number }>;
      avgScore: number;
      scoreRange: { min: number; max: number };
      scoreDistribution: { excellent: number; good: number; fair: number; poor: number };
      avgEngagement: number;
      aiGeneratedCount: number;
      aiGeneratedPercentage: number;
      postingFrequency: string;
      verified: boolean;
    }>;
    categoryOverview: Array<{ category: string; count: number; avgScore: number; topAuthors: string[] }>;
    scoreRangeAnalysis: {
      excellent: { count: number; authors: string[] };
      good: { count: number; authors: string[] };
      fair: { count: number; authors: string[] };
      poor: { count: number; authors: string[] };
    };
  }> {
    if (!this.db) throw new Error('Database not initialized');

    // Basic counts
    const totalPosts = this.db.exec("SELECT COUNT(*) as count FROM feed_items")[0]?.values[0][0] as number || 0;
    const uniqueAuthors = this.db.exec("SELECT COUNT(*) as count FROM authors")[0]?.values[0][0] as number || 0;
    
    // Average engagement
    const avgEngagementResult = this.db.exec(`
      SELECT AVG(reaction_count + comment_count + repost_count) as avg_engagement 
      FROM feed_items
    `)[0];
    const avgEngagement = avgEngagementResult?.values[0][0] as number || 0;
    
    // Top authors with post count and average engagement
    const topAuthorsResult = this.db.exec(`
      SELECT 
        a.name,
        COUNT(f.id) as post_count,
        AVG(f.reaction_count + f.comment_count + f.repost_count) as avg_engagement
      FROM authors a
      JOIN feed_items f ON a.id = f.author_id
      GROUP BY a.id, a.name
      ORDER BY post_count DESC
      LIMIT 10
    `)[0];
    
    const topAuthors: Array<{ name: string; postCount: number; avgEngagement: number }> = [];
    if (topAuthorsResult) {
      topAuthorsResult.values.forEach((row: any[]) => {
        topAuthors.push({
          name: row[0] as string,
          postCount: row[1] as number,
          avgEngagement: Math.round(row[2] as number || 0)
        });
      });
    }
    
    // Content type distribution
    const contentTypesResult = this.db.exec(`
      SELECT post_type, COUNT(*) as count
      FROM feed_items
      WHERE post_type IS NOT NULL
      GROUP BY post_type
      ORDER BY count DESC
    `)[0];
    
    const contentTypes: Array<{ type: string; count: number }> = [];
    if (contentTypesResult) {
      contentTypesResult.values.forEach((row: any[]) => {
        contentTypes.push({
          type: row[0] as string,
          count: row[1] as number
        });
      });
    }
    
    // Daily stats (last 7 days)
    const dailyStatsResult = this.db.exec(`
      SELECT 
        DATE(captured_at) as date,
        COUNT(*) as post_count,
        AVG(reaction_count + comment_count + repost_count) as avg_score
      FROM feed_items
      WHERE captured_at >= datetime('now', '-7 days')
      GROUP BY DATE(captured_at)
      ORDER BY date DESC
    `)[0];
    
    const dailyStats: Array<{ date: string; postCount: number; avgScore: number }> = [];
    if (dailyStatsResult) {
      dailyStatsResult.values.forEach((row: any[]) => {
        dailyStats.push({
          date: row[0] as string,
          postCount: row[1] as number,
          avgScore: Math.round(row[2] as number || 0)
        });
      });
    }
    
    // Enhanced Author Category Analysis
    const authorCategoryAnalysis: Array<{
      authorName: string;
      authorId: string;
      postCount: number;
      categories: Array<{ category: string; count: number; percentage: number }>;
      avgScore: number;
      scoreRange: { min: number; max: number };
      scoreDistribution: { excellent: number; good: number; fair: number; poor: number };
      avgEngagement: number;
      aiGeneratedCount: number;
      aiGeneratedPercentage: number;
      postingFrequency: string;
      verified: boolean;
    }> = [];

    // Get detailed author analysis
    const authorAnalysisResult = this.db.exec(`
      SELECT 
        a.id as author_id,
        a.name as author_name,
        a.verified,
        COUNT(f.id) as post_count,
        AVG(COALESCE(f.overall_score, 0)) as avg_score,
        MIN(COALESCE(f.overall_score, 0)) as min_score,
        MAX(COALESCE(f.overall_score, 0)) as max_score,
        AVG(f.reaction_count + f.comment_count + f.repost_count) as avg_engagement,
        COUNT(CASE WHEN f.is_ai_generated = 1 THEN 1 END) as ai_generated_count,
        COUNT(CASE WHEN f.overall_score >= 80 THEN 1 END) as excellent_count,
        COUNT(CASE WHEN f.overall_score >= 60 AND f.overall_score < 80 THEN 1 END) as good_count,
        COUNT(CASE WHEN f.overall_score >= 40 AND f.overall_score < 60 THEN 1 END) as fair_count,
        COUNT(CASE WHEN f.overall_score < 40 THEN 1 END) as poor_count,
        MIN(DATE(f.captured_at)) as first_post_date,
        MAX(DATE(f.captured_at)) as last_post_date
      FROM authors a
      LEFT JOIN feed_items f ON a.id = f.author_id
      WHERE f.id IS NOT NULL
      GROUP BY a.id, a.name, a.verified
      ORDER BY post_count DESC
      LIMIT 20
    `)[0];

    if (authorAnalysisResult) {
      for (const row of authorAnalysisResult.values) {
        const authorId = row[0] as string;
        const authorName = row[1] as string;
        const verified = row[2] as number;
        const postCount = row[3] as number;
        const avgScore = row[4] as number;
        const minScore = row[5] as number;
        const maxScore = row[6] as number;
        const avgEngagement = row[7] as number;
        const aiGeneratedCount = row[8] as number;
        const excellentCount = row[9] as number;
        const goodCount = row[10] as number;
        const fairCount = row[11] as number;
        const poorCount = row[12] as number;
        const firstPostDate = row[13] as string;
        const lastPostDate = row[14] as string;

        // Get category breakdown for this author
        const stmt = this.db.prepare("SELECT content_category, COUNT(*) as count FROM feed_items WHERE author_id = ? AND content_category IS NOT NULL GROUP BY content_category ORDER BY count DESC");
        const categories: Array<{ category: string; count: number; percentage: number }> = [];
        
        try {
          stmt.bind([authorId]);
          while (stmt.step()) {
            const row = stmt.getAsObject();
            categories.push({
              category: row.content_category as string,
              count: row.count as number,
              percentage: Math.round(((row.count as number) / postCount) * 100)
            });
          }
        } finally {
          stmt.free();
        }

        // Calculate posting frequency
        let postingFrequency = 'Unknown';
        if (firstPostDate && lastPostDate && postCount > 1) {
          const daysDiff = Math.max(1, Math.ceil((new Date(lastPostDate).getTime() - new Date(firstPostDate).getTime()) / (1000 * 60 * 60 * 24)));
          const postsPerDay = postCount / daysDiff;
          if (postsPerDay >= 1) {
            postingFrequency = `${Math.round(postsPerDay * 10) / 10} posts/day`;
          } else {
            const daysPerPost = Math.round(daysDiff / postCount);
            postingFrequency = `1 post/${daysPerPost} days`;
          }
        }

        authorCategoryAnalysis.push({
          authorName,
          authorId,
          postCount,
          categories,
          avgScore: Math.round(avgScore),
          scoreRange: { min: Math.round(minScore), max: Math.round(maxScore) },
          scoreDistribution: {
            excellent: excellentCount,
            good: goodCount,
            fair: fairCount,
            poor: poorCount
          },
          avgEngagement: Math.round(avgEngagement),
          aiGeneratedCount,
          aiGeneratedPercentage: Math.round((aiGeneratedCount / postCount) * 100),
          postingFrequency,
          verified: verified === 1
        });
      }
    }

    // Category Overview
    const categoryOverviewResult = this.db.exec(`
      SELECT 
        content_category,
        COUNT(*) as count,
        AVG(COALESCE(overall_score, 0)) as avg_score,
        GROUP_CONCAT(a.name) as authors
      FROM feed_items f
      JOIN authors a ON f.author_id = a.id
      WHERE content_category IS NOT NULL
      GROUP BY content_category
      ORDER BY count DESC
    `)[0];

    const categoryOverview: Array<{ category: string; count: number; avgScore: number; topAuthors: string[] }> = [];
    if (categoryOverviewResult) {
      categoryOverviewResult.values.forEach((row: any[]) => {
        const authors = (row[3] as string || '').split(', ').slice(0, 5); // Top 5 authors
        categoryOverview.push({
          category: row[0] as string,
          count: row[1] as number,
          avgScore: Math.round(row[2] as number || 0),
          topAuthors: authors.filter(author => author.length > 0)
        });
      });
    }

    // Score Range Analysis
    const scoreRangeResult = this.db.exec(`
      SELECT 
        CASE 
          WHEN overall_score >= 80 THEN 'excellent'
          WHEN overall_score >= 60 THEN 'good'
          WHEN overall_score >= 40 THEN 'fair'
          ELSE 'poor'
        END as score_range,
        COUNT(*) as count,
        GROUP_CONCAT(a.name) as authors
      FROM feed_items f
      JOIN authors a ON f.author_id = a.id
      WHERE overall_score IS NOT NULL
      GROUP BY score_range
      ORDER BY count DESC
    `)[0];

    const scoreRangeAnalysis = {
      excellent: { count: 0, authors: [] as string[] },
      good: { count: 0, authors: [] as string[] },
      fair: { count: 0, authors: [] as string[] },
      poor: { count: 0, authors: [] as string[] }
    };

    if (scoreRangeResult) {
      scoreRangeResult.values.forEach((row: any[]) => {
        const range = row[0] as string;
        const count = row[1] as number;
        const authors = (row[2] as string || '').split(', ').slice(0, 10);
        
        if (range in scoreRangeAnalysis) {
          (scoreRangeAnalysis as any)[range] = {
            count,
            authors: authors.filter((author: string) => author.length > 0)
          };
        }
      });
    }

    return {
      totalPosts,
      uniqueAuthors,
      avgEngagement: Math.round(avgEngagement),
      topAuthors,
      contentTypes,
      dailyStats,
      authorCategoryAnalysis,
      categoryOverview,
      scoreRangeAnalysis
    };
  }

  async getDebugInfo(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const debugInfo: any = {
      tables: [],
      counts: {},
      recentItems: [],
      sampleData: {}
    };

    try {
      // Get all tables
      const tablesResult = this.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      if (tablesResult.length > 0) {
        debugInfo.tables = tablesResult[0].values.map(row => row[0]);
      }

      // Get counts for each table
      for (const tableName of debugInfo.tables) {
        try {
          const countResult = this.db.exec(`SELECT COUNT(*) as count FROM ${tableName}`);
          debugInfo.counts[tableName] = countResult[0]?.values[0][0] || 0;
        } catch (error) {
          debugInfo.counts[tableName] = `error: ${error}`;
        }
      }

      // Get recent feed items
      try {
        const recentResult = this.db.exec(`
          SELECT id, content, author_id, overall_score, content_category, captured_at
          FROM feed_items 
          ORDER BY captured_at DESC 
          LIMIT 5
        `);
        if (recentResult.length > 0) {
          debugInfo.recentItems = recentResult[0].values.map(row => ({
            id: row[0],
            content: (row[1] as string)?.substring(0, 100) + '...',
            authorId: row[2],
            score: row[3],
            category: row[4],
            capturedAt: row[5]
          }));
        }
      } catch (error) {
        debugInfo.recentItems = `error: ${error}`;
      }

      // Sample data from each main table
      try {
        const authorsResult = this.db.exec("SELECT COUNT(*), GROUP_CONCAT(name) as names FROM authors LIMIT 5");
        if (authorsResult.length > 0) {
          debugInfo.sampleData.authors = {
            count: authorsResult[0].values[0][0],
            sampleNames: authorsResult[0].values[0][1]
          };
        }
      } catch (error) {
        debugInfo.sampleData.authors = `error: ${error}`;
      }

    } catch (error) {
      debugInfo.error = error instanceof Error ? error.message : String(error);
    }

    return debugInfo;
  }

  async exportData(): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const feedItems = this.db.exec(`
      SELECT 
        fi.*, 
        a.name as author_name, 
        a.headline as author_headline,
        a.verified as author_verified
      FROM feed_items fi
      JOIN authors a ON fi.author_id = a.id
      ORDER BY fi.captured_at DESC
    `);

    if (feedItems.length === 0) {
      return JSON.stringify({ feedItems: [], authors: [] }, null, 2);
    }

    const columns = feedItems[0].columns;
    const rows = feedItems[0].values;

    const formattedItems = rows.map((row: any[]) => {
      const item: any = {};
      columns.forEach((col: string, index: number) => {
        item[col] = row[index];
      });
      return item;
    });

    return JSON.stringify({ feedItems: formattedItems }, null, 2);
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
