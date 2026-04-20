// News Service using CryptoCompare API
const CRYPTOCOMPARE_API = 'https://min-api.cryptocompare.com/data';
const CRYPTOCOMPARE_API_KEY = '82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  source: string;
  timestamp: number;
  tags: string[];
}

const NEWS_CACHE_KEY = 'vestige_news_cache';
const NEWS_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function getLatestNews(): Promise<NewsArticle[]> {
  // Check cache first
  const cached = localStorage.getItem(NEWS_CACHE_KEY);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < NEWS_CACHE_DURATION) {
        return data;
      }
    } catch (e) {
      console.warn('News cache corrupted');
    }
  }

  try {
    // CryptoCompare News endpoint
    const url = `${CRYPTOCOMPARE_API}/news?lang=EN&sortOrder=latest&api_key=${CRYPTOCOMPARE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch news:', response.statusText);
      return [];
    }

    const result = await response.json();
    const articles = (result.Data || [])
      .slice(0, 50) // Limit to 50 articles
      .map((article: any) => ({
        id: article.id?.toString() || Math.random().toString(),
        title: article.title || '',
        description: article.body?.substring(0, 200) || article.title || '',
        url: article.url || '',
        imageUrl: article.imageurl || '',
        source: article.source || 'CryptoCompare',
        timestamp: (article.published_on || Math.floor(Date.now() / 1000)) * 1000,
        tags: article.categories ? article.categories.split('|').slice(0, 3) : [],
      }))
      .filter((article: NewsArticle) => article.title && article.url);

    // Cache the results
    localStorage.setItem(
      NEWS_CACHE_KEY,
      JSON.stringify({ data: articles, timestamp: Date.now() })
    );

    return articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function getNewsForCrypto(symbol: string): Promise<NewsArticle[]> {
  try {
    const url = `${CRYPTOCOMPARE_API}/news?lang=EN&sortOrder=latest&api_key=${CRYPTOCOMPARE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    const articles = (result.Data || [])
      .filter((article: any) => {
        const categories = (article.categories || '').toUpperCase();
        return categories.includes(symbol.toUpperCase());
      })
      .slice(0, 20)
      .map((article: any) => ({
        id: article.id?.toString() || Math.random().toString(),
        title: article.title || '',
        description: article.body?.substring(0, 200) || article.title || '',
        url: article.url || '',
        imageUrl: article.imageurl || '',
        source: article.source || 'CryptoCompare',
        timestamp: (article.published_on || Math.floor(Date.now() / 1000)) * 1000,
        tags: article.categories ? article.categories.split('|').slice(0, 3) : [],
      }));

    return articles;
  } catch (error) {
    console.error('Error fetching news for symbol:', symbol, error);
    return [];
  }
}
