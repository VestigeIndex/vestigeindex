export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Fee recipient (EVM)
const FEE_ADDRESS = "0xa1131b7A6d5E816BF8548078A88a6bF3D91C7F";
const FEE_BPS = 30; // 0.3%

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

  // Try OpenOcean V4 API
  const chainIdMap: Record<string, string> = {
    "1": "1", "56": "56", "137": "137", "42161": "42161", "10": "10", "43114": "43114"
  };
  const oaChainId = chainIdMap[chainId] || "1";
  
  // Map native ETH to WETH
  const mapNative = (addr: string) => {
    if (addr.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      return "0xC02aaA96Bca8dD58600551f26c1cF4b4E63F003b"; // WETH
    }
    return addr;
  };

  const srcMapped = mapNative(tokenIn);
  const dstMapped = mapNative(tokenOut);
  
  const ooUrl = `https://open-api.openocean.finance/v4/${oaChainId}/swap?inTokenAddress=${srcMapped}&outTokenAddress=${dstMapped}&amountDecimals=${amount}&gasPriceDecimals=1000000000&slippage=1&account=${sender}&referrer=${FEE_ADDRESS}&referrerFee=${FEE_BPS / 100}`;
  
  try {
    const res = await fetch(ooUrl, {
      headers: { "Content-Type": "application/json" },
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return Response.json({ 
        error: "OpenOcean error", 
        details: error 
      }, { status: res.status });
    }

    const data = await res.json();
    
    if (data.data?.tx) {
      return Response.json({
        txData: {
          to: data.data.tx.to,
          data: data.data.tx.data,
          value: data.data.tx.value || "0",
        },
        provider: "OpenOcean",
        estimate: data.data.estimate,
      });
    }
    
    return Response.json({ 
      error: "No quote data returned" 
    }, { status: 500 });
    
  } catch (error: any) {
    console.error("Quote API error:", error);
    return Response.json({ 
      error: "Server error", 
      message: error.message 
    }, { status: 500 });
  }
}