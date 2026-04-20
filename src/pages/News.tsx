import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, TrendingUp, MessageCircle } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  image_url?: string;
  categories: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'market', 'defi', 'nft', 'regulation', 'technology'];

  // Fetch news from CryptoCompare API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const API_KEY = '82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f';
        
        const response = await fetch(
          `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest&limit=50&api_key=${API_KEY}`
        );
        const data = await response.json();
        
        if (data.Data) {
          const processedNews: NewsItem[] = data.Data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.body,
            url: item.url,
            source: item.source_info?.name || 'Unknown',
            published_at: item.published_on,
            image_url: item.imageurl,
            categories: item.categories || [],
            sentiment: item.sentiment
          }));
          
          setNews(processedNews);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        // Fallback news data
        setNews(getFallbackNews());
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getFallbackNews = (): NewsItem[] => [
    {
      id: '1',
      title: 'Bitcoin Reaches New All-Time High',
      description: 'Bitcoin surged past $70,000 for the first time ever, driven by institutional adoption and ETF approvals.',
      url: '#',
      source: 'Crypto News',
      published_at: new Date().toISOString(),
      categories: ['market'],
      sentiment: 'positive'
    },
    {
      id: '2',
      title: 'DeFi TVL Surpasses $100 Billion',
      description: 'Total Value Locked in DeFi protocols has exceeded $100 billion, signaling strong growth in the sector.',
      url: '#',
      source: 'DeFi Pulse',
      published_at: new Date(Date.now() - 3600000).toISOString(),
      categories: ['defi'],
      sentiment: 'positive'
    },
    {
      id: '3',
      title: 'New Regulatory Framework Proposed',
      description: 'Regulators propose new framework for digital assets that could provide clarity for the industry.',
      url: '#',
      source: 'Regulatory News',
      published_at: new Date(Date.now() - 7200000).toISOString(),
      categories: ['regulation'],
      sentiment: 'neutral'
    }
  ];

  // Filter news
  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categories.includes(selectedCategory);
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp size={16} />;
      case 'negative': return <TrendingUp size={16} className="rotate-180" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Crypto News</h1>
              <p className="text-sm text-gray-400 mt-1">Latest cryptocurrency and blockchain news</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <MessageCircle size={16} />
                </div>
              </div>

              {/* Categories */}
              <div className="flex bg-gray-900 rounded-lg p-1">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Loading news...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNews.map((item) => (
              <article
                key={item.id}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors"
              >
                {/* Image */}
                {item.image_url && (
                  <div className="relative h-48 bg-gray-800">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{item.source}</span>
                      <div className={`flex items-center gap-1 ${getSentimentColor(item.sentiment)}`}>
                        {getSentimentIcon(item.sentiment)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{formatDate(item.published_at)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 capitalize"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span className="text-sm font-medium">Read more</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400">
              No news found matching "{searchTerm}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
