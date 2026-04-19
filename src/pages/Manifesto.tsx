import React from 'react';
import { BookOpen, Target, Shield, Users, Zap, Globe } from 'lucide-react';

export default function Manifesto() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Manifesto</h1>
              <p className="text-sm text-gray-400 mt-1">Our vision and principles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Building the Future of
            <span className="text-blue-400"> Decentralized Finance</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Vestige Index is committed to revolutionizing how people interact with digital assets 
            through transparency, innovation, and community-driven development.
          </p>
        </div>

        {/* Core Principles */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Our Core Principles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Shield className="text-blue-400" size={24} />
                </div>
                <h4 className="text-lg font-bold text-white">Security First</h4>
              </div>
              <p className="text-gray-400">
                We prioritize the security of user assets above all else. Every protocol and integration 
                undergoes rigorous security audits and continuous monitoring.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Users className="text-green-400" size={24} />
                </div>
                <h4 className="text-lg font-bold text-white">Community Driven</h4>
              </div>
              <p className="text-gray-400">
                Our platform is built by the community, for the community. Every decision, feature, 
                and improvement is shaped by user feedback and collective wisdom.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Zap className="text-purple-400" size={24} />
                </div>
                <h4 className="text-lg font-bold text-white">Innovation</h4>
              </div>
              <p className="text-gray-400">
                We constantly push the boundaries of what's possible in DeFi, bringing cutting-edge 
                technology and novel financial instruments to our users.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <Target className="text-yellow-400" size={24} />
                </div>
                <h4 className="text-lg font-bold text-white">Accessibility</h4>
              </div>
              <p className="text-gray-400">
                Financial freedom should be accessible to everyone. We design intuitive interfaces and 
                provide educational resources to empower users of all experience levels.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-600/20 rounded-lg">
                  <BookOpen className="text-red-400" size={24} />
                </div>
                <h4 className="text-lg font-bold text-white">Transparency</h4>
              </div>
              <p className="text-gray-400">
                Open source code, public audits, and clear communication. We believe in radical 
                transparency to build trust and accountability in the ecosystem.
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-600/20 rounded-lg">
                  <Globe className="text-cyan-400" size={24} />
                </div>
                <h4 className="text-lg font-bold text-white">Decentralization</h4>
              </div>
              <p className="text-gray-400">
                True decentralization is our north star. We work towards reducing single points 
                of failure and distributing power across the network.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-8 border border-blue-600/30">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Our Mission</h3>
            <p className="text-lg text-gray-300 leading-relaxed text-center">
              To democratize access to sophisticated financial instruments and create a more inclusive 
              financial system where anyone, anywhere can participate in the global economy on equal terms. 
              We bridge the gap between traditional finance and decentralized technologies, making 
              DeFi accessible, secure, and beneficial for all humanity.
            </p>
          </div>
        </div>

        {/* Vision */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Our Vision</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h4 className="text-xl font-bold text-blue-400 mb-4">Short Term</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Launch comprehensive index products for major crypto sectors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Build the most user-friendly DeFi interface in the market</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Establish strategic partnerships with leading protocols</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Achieve 100,000 active users and $1B in TVL</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h4 className="text-xl font-bold text-purple-400 mb-4">Long Term</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Become the leading platform for tokenized real-world assets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Power the next generation of decentralized applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Establish Vestige as a foundational DeFi infrastructure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Enable millions to achieve financial sovereignty through crypto</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Values That Guide Us</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-6 p-6 bg-gray-900 rounded-lg border border-gray-800">
              <div className="text-3xl font-bold text-blue-400">01</div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">User Empowerment</h4>
                <p className="text-gray-400">
                  Every feature we build is designed to give users more control, more options, and 
                  more power over their financial future.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 p-6 bg-gray-900 rounded-lg border border-gray-800">
              <div className="text-3xl font-bold text-green-400">02</div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Technical Excellence</h4>
                <p className="text-gray-400">
                  We pursue engineering excellence in everything we build, from smart contracts to user interfaces, 
                  ensuring reliability and performance at scale.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 p-6 bg-gray-900 rounded-lg border border-gray-800">
              <div className="text-3xl font-bold text-purple-400">03</div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Sustainable Growth</h4>
                <p className="text-gray-400">
                  We build for long-term sustainability, not short-term gains. Our success is measured 
                  by the lasting value we create for our users and the ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Join the Revolution</h3>
            <p className="text-lg text-gray-200 mb-6 max-w-2xl mx-auto">
              Be part of the movement that's reshaping finance. Whether you're a developer, 
              trader, or enthusiast, there's a place for you in the Vestige ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-100 transition-colors">
                Start Building
              </button>
              <button className="px-8 py-3 bg-black/20 text-white rounded-lg font-bold hover:bg-black/30 transition-colors border border-white/20">
                Join Community
              </button>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-16 text-center">
          <blockquote className="text-xl text-gray-400 italic max-w-3xl mx-auto">
            "The future of finance is not being built by banks in tall buildings, 
            but by communities in decentralized networks. We're here to accelerate that future."
          </blockquote>
          <div className="mt-4 text-gray-500">
            — Vestige Index Team
          </div>
        </div>
      </div>
    </div>
  );
}
