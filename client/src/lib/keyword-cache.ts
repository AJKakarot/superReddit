// client/src/lib/keyword-cache.ts

interface CachedKeyword {
  id: string;
  term: string;
  createdAt: string;
  lastAccessed: number;
}

class KeywordCache {
  private cache: Map<string, CachedKeyword> = new Map();
  private readonly CACHE_KEY = 'reddit_keywords_cache';
  private readonly MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 100; // Maximum keywords to cache

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CachedKeyword[];
        const now = Date.now();
        
        // Filter out expired entries and add to memory cache
        parsed
          .filter(item => (now - item.lastAccessed) < this.MAX_CACHE_AGE)
          .forEach(item => this.cache.set(item.id, item));
      }
    } catch (error) {
      console.warn('Failed to load keywords from localStorage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.values());
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save keywords to localStorage:', error);
    }
  }

  set(keyword: CachedKeyword): void {
    keyword.lastAccessed = Date.now();
    this.cache.set(keyword.id, keyword);
    
    // Enforce cache size limit
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const oldest = Array.from(this.cache.values())
        .sort((a, b) => a.lastAccessed - b.lastAccessed)[0];
      if (oldest) {
        this.cache.delete(oldest.id);
      }
    }
    
    this.saveToStorage();
  }

  get(id: string): CachedKeyword | undefined {
    const keyword = this.cache.get(id);
    if (keyword) {
      keyword.lastAccessed = Date.now();
      this.saveToStorage();
    }
    return keyword;
  }

  getAll(): CachedKeyword[] {
    return Array.from(this.cache.values())
      .sort((a, b) => a.term.localeCompare(b.term));
  }

  has(id: string): boolean {
    return this.cache.has(id);
  }

  delete(id: string): void {
    this.cache.delete(id);
    this.saveToStorage();
  }

  clear(): void {
    this.cache.clear();
    localStorage.removeItem(this.CACHE_KEY);
  }

  // Bulk operations
  setAll(keywords: CachedKeyword[]): void {
    keywords.forEach(keyword => this.set(keyword));
  }

  // Get keywords that need refresh (older than 1 hour)
  getStaleKeywords(): CachedKeyword[] {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return Array.from(this.cache.values())
      .filter(keyword => keyword.lastAccessed < oneHourAgo);
  }

  // Check if cache is fresh enough
  isCacheFresh(): boolean {
    if (this.cache.size === 0) return false;
    
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const oldestAccess = Math.min(...Array.from(this.cache.values()).map(k => k.lastAccessed));
    
    return oldestAccess > oneHourAgo;
  }
}

// Export singleton instance
export const keywordCache = new KeywordCache();
export type { CachedKeyword };
