export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SWAP_API = "https://api.swapapi.dev/v1";

// Fee recipient (EVM)
const FEE_ADDRESS = "0xa1131edb7A6d5E816BF8548078A88a6bF3D91C7F";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenIn = searchParams.get("tokenIn");
  const tokenOut = searchParams.get("tokenOut");
  const amount = searchParams.get("amount");
  const sender = searchParams.get("sender");
  const chainId = searchParams.get("chainId") || "1";

  if (!tokenIn || !tokenOut || !amount || !sender) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const chainIdNum = parseInt(chainId, 10);
    const url = `${SWAP_API}/swap/${chainIdNum}?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amount=${amount}&sender=${sender}`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return Response.json({ 
        error: "Swap API error", 
        description: error.message || "Failed to get quote" 
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