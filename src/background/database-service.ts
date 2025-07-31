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
      // Initialize SQL.js with the WebAssembly file
      this.SQL = await initSqlJs({
        locateFile: (file: string) => {
          if (file === 'sql-wasm.wasm') {
            return chrome.runtime.getURL('sql-wasm.wasm');
          }
          return file;
        }
      });

      // Check if database exists in storage
      const stored = await chrome.storage.local.get('feedDatabase');
      
      if (stored.feedDatabase) {
        // Load existing database
        const buf = new Uint8Array(stored.feedDatabase);
        this.db = new this.SQL.Database(buf);
      } else {
        // Create new database
        this.db = new this.SQL.Database();
        await this.createTables();
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

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
        media_type, media_title, linkedin_timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      item.linkedinTimestamp
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

  async getStatistics(): Promise<{
    totalPosts: number;
    uniqueAuthors: number;
    avgEngagement: number;
    topAuthors: Array<{ name: string; postCount: number; avgEngagement: number }>;
    contentTypes: Array<{ type: string; count: number }>;
    dailyStats: Array<{ date: string; postCount: number; avgScore: number }>;
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
    
    return {
      totalPosts,
      uniqueAuthors,
      avgEngagement: Math.round(avgEngagement),
      topAuthors,
      contentTypes,
      dailyStats
    };
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
