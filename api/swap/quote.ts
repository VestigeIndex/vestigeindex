export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ONEINCH_API = "https://api.1inch.io/v5.0";
const API_KEY = process.env.ONEINCH_API_KEY || process.env.VITE_ONEINCH_API_KEY || "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get("src");
  const dst = searchParams.get("dst");
  const amount = searchParams.get("amount");
  const chainId = searchParams.get("chainId") || "1";

  if (!src || !dst || !amount) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const chainIdNum = parseInt(chainId, 10);
    let url = `${ONEINCH_API}/${chainIdNum}/quote?fromTokenAddress=${src}&toTokenAddress=${dst}&amount=${amount}`;
    if (API_KEY) url += `&appId=${API_KEY}`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return Response.json({ 
        error: "1inch API error", 
        description: error.errorDescription || error.description || "Failed to get quote" 
      }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("Swap quote error:", error);
    return Response.json({ 
      error: "Server error", 
      description: error.message || "Failed to get quote" 
    }, { status: 500 });
  }
}