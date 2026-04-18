import type { APIRoute } from 'astro';
import { getMarketData } from '../lib/marketData';

export const GET: APIRoute = async () => {
  try {
    const data = await getMarketData();
    console.log('API /market: returning', data.length, 'tokens');
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('API /market error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch market data',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}