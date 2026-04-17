import type { VercelRequest, VercelResponse } from "@vercel/node";

const ONEINCH_API = "https://api.1inch.io/v5.0";
const API_KEY = process.env.VITE_ONEINCH_API_KEY || "";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const { src, dst, amount, chainId = "1", fromAddress, slippage = "1" } = request.body || request.query;

  if (!src || !dst || !amount || !fromAddress) {
    return response.status(400).json({ error: "Missing parameters" });
  }

  try {
    const chainIdNum = parseInt(chainId as string, 10);
    
    // First get the swap data
    const params = new URLSearchParams({
      fromTokenAddress: src,
      toTokenAddress: dst,
      amount: amount,
      fromAddress: fromAddress,
      slippage: slippage as string,
      disableEstimate: "true",
    });
    if (API_KEY) params.append("appId", API_KEY);

    const url = `${ONEINCH_API}/${chainIdNum}/swap?${params}`;
    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return response.status(res.status).json({ 
        error: "1inch API error", 
        description: error.errorDescription || error.description || "Failed to get swap data" 
      });
    }

    const data = await res.json();
    return response.json(data);
  } catch (error: any) {
    console.error("Swap error:", error);
    return response.status(500).json({ 
      error: "Server error", 
      description: error.message || "Failed to execute swap" 
    });
  }
}
