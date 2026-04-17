import type { VercelRequest, VercelResponse } from "@vercel/node";

const ONEINCH_API = "https://api.1inch.io/v5.0";

// Get API key from env - Vercel uses NODE_ENV variables, not VITE_ prefix
const API_KEY = process.env.ONEINCH_API_KEY || process.env.VITE_ONEINCH_API_KEY || "";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const { src, dst, amount, chainId = "1" } = request.query;

  if (!src || !dst || !amount) {
    return response.status(400).json({ error: "Missing parameters" });
  }

  try {
    const chainIdNum = parseInt(chainId as string, 10);
    const url = `${ONEINCH_API}/${chainIdNum}/quote?fromTokenAddress=${src}&toTokenAddress=${dst}&amount=${amount}${API_KEY ? `&appId=${API_KEY}` : ""}`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return response.status(res.status).json({ 
        error: "1inch API error", 
        description: error.errorDescription || error.description || "Failed to get quote" 
      });
    }

    const data = await res.json();
    return response.json(data);
  } catch (error: any) {
    console.error("Swap quote error:", error);
    return response.status(500).json({ 
      error: "Server error", 
      description: error.message || "Failed to get quote" 
    });
  }
}