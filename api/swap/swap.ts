export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ONEINCH_API = "https://api.1inch.io/v5.0";
const API_KEY = process.env.ONEINCH_API_KEY || process.env.VITE_ONEINCH_API_KEY || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { src, dst, amount, chainId = "1", fromAddress, slippage = "1" } = body;

    if (!src || !dst || !amount || !fromAddress) {
      return Response.json({ error: "Missing parameters" }, { status: 400 });
    }

    const chainIdNum = parseInt(chainId, 10);
    
    const params = new URLSearchParams({
      fromTokenAddress: src,
      toTokenAddress: dst,
      amount: amount,
      fromAddress: fromAddress,
      slippage: slippage.toString(),
      disableEstimate: "true",
    });
    if (API_KEY) params.append("appId", API_KEY);

    const url = `${ONEINCH_API}/${chainIdNum}/swap?${params}`;
    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return Response.json({ 
        error: "1inch API error", 
        description: error.errorDescription || error.description || "Failed to get swap data" 
      }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("Swap error:", error);
    return Response.json({ 
      error: "Server error", 
      description: error.message || "Failed to execute swap" 
    }, { status: 500 });
  }
}