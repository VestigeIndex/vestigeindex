import React, { useState } from 'react';
import { Users, MessageSquare, Trophy, Calendar, Star, ExternalLink } from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  author: string;
  avatar: string;
  content: string;
  replies: number;
  likes: number;
  timestamp: string;
  category: string;
}

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  reputation: number;
  joined: string;
}

export default function Community() {
  const [activeTab, setActiveTab] = useState<'forum' | 'members' | 'events'>('forum');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'trading', 'defi', 'nft', 'technical', 'general'];

  const forumPosts: ForumPost[] = [
    {
      id: '1',
      title: 'Best strategies for DeFi yield farming',
      author: 'CryptoTrader99',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoTrader99',
      content: 'Looking for insights on the most profitable yield farming strategies in the current market...',
      replies: 23,
      likes: 45,
      timestamp: '2 hours ago',
      category: 'defi'
    },
    {
      id: '2',
      title: 'Technical analysis: BTC support levels',
      author: 'ChartMaster',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChartMaster',
      content: 'Breaking down key support and resistance levels for Bitcoin in the coming weeks...',
      replies: 18,
      likes: 67,
      timestamp: '4 hours ago',
      category: 'technical'
    },
    {
      id: '3',
      title: 'New NFT project analysis',
      author: 'NFTCollector',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NFTCollector',
      content: 'Deep dive into the latest NFT collection and its potential for long-term value...',
      replies: 31,
      likes: 89,
      timestamp: '6 hours ago',
      category: 'nft'
    },
    {
      id: '4',
      title: 'Market sentiment discussion',
      author: 'MarketGuru',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarketGuru',
      content: 'What are your thoughts on the current market sentiment? Bullish or bearish?',
      replies: 56,
      likes: 124,
      timestamp: '1 day ago',
      category: 'trading'
    }
  ];

  const communityMembers: CommunityMember[] = [
    {
      id: '1',
      name: 'Alex Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexChen',
      role: 'Moderator',
      reputation: 2847,
      joined: 'January 2023'
    },
    {
      id: '2',
      name: 'Sarah Williams',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahWilliams',
      role: 'Top Contributor',
      reputation: 1923,
      joined: 'March 2023'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MikeJohnson',
      role: 'Expert Trader',
      reputation: 1654,
      joined: 'February 2023'
    }
  ];

  const upcomingEvents = [
    {
      title: 'DeFi Strategies Webinar',
      date: 'Dec 15, 2024',
      time: '3:00 PM UTC',
      type: 'webinar',
      attendees: 234
    },
    {
      title: 'Community AMA with Industry Experts',
      date: 'Dec 18, 2024',
      time: '5:00 PM UTC',
      type: 'ama',
      attendees: 567
    },
    {
      title: 'Trading Competition',
      date: 'Dec 20, 2024',
      time: '9:00 AM UTC',
      type: 'competition',
      attendees: 892
    }
  ];

  const filteredPosts = forumPosts.filter(post => 
    selectedCategory === 'all' || post.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Community</h1>
              <p className="text-sm text-gray-400 mt-1">Connect with fellow crypto enthusiasts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex bg-gray-900 rounded-lg p-1 mb-6">
          {[
            { key: 'forum', label: 'Forum', icon: MessageSquare },
            { key: 'members', label: 'Members', icon: Users },
            { key: 'events', label: 'Events', icon: Calendar }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Forum Tab */}
        {activeTab === 'forum' && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-400">Filter by:</span>
              <div className="flex gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Forum Posts */}
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-white text-lg mb-1">{post.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{post.author}</span>
                            <span>•</span>
                            <span>{post.timestamp}</span>
                            <span className="px-2 py-0.5 bg-gray-800 rounded text-xs capitalize">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 mb-4 line-clamp-2">{post.content}</p>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                          <MessageSquare size={14} />
                          <span>{post.replies} replies</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                          <Star size={14} />
                          <span>{post.likes} likes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityMembers.map(member => (
              <div
                key={member.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-bold text-white">{member.name}</h3>
                    <span className="text-sm text-blue-400">{member.role}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reputation</span>
                    <span className="text-white font-medium">{member.reputation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Joined</span>
                    <span className="text-white">{member.joined}</span>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Upcoming Events</h2>
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-2">{event.title}</h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      event.type === 'webinar' ? 'bg-green-600/20 text-green-400' :
                      event.type === 'ama' ? 'bg-blue-600/20 text-blue-400' :
                      'bg-purple-600/20 text-purple-400'
                    }`}>
                      {event.type.toUpperCase()}
                    </span>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Register
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Community Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
            <Users className="mx-auto text-blue-400 mb-3" size={32} />
            <div className="text-2xl font-bold text-white">12,453</div>
            <div className="text-sm text-gray-400">Active Members</div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
            <MessageSquare className="mx-auto text-green-400 mb-3" size={32} />
            <div className="text-2xl font-bold text-white">3,892</div>
            <div className="text-sm text-gray-400">Forum Posts</div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
            <Trophy className="mx-auto text-yellow-400 mb-3" size={32} />
            <div className="text-2xl font-bold text-white">156</div>
            <div className="text-sm text-gray-400">Trading Competitions</div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
            <Star className="mx-auto text-purple-400 mb-3" size={32} />
            <div className="text-2xl font-bold text-white">98.2%</div>
            <div className="text-sm text-gray-400">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
