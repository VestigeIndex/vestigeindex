import { Router } from "express";

const router = Router();

const ONEINCH_KEY = "cFZRlj7mPjGzwxl0QP3B1j3qvzB6cHrN";
const EVM_FEE_ADDRESS = "0xa1131edb7a6d5e816bf8548078a88a6bf3d91c7f";
const BASE_URL = "https://api.1inch.dev/swap/v6.0";

async function oneInchRequest(path: string, chainId: number, params: Record<string, string>) {
  const url = new URL(`${BASE_URL}/${chainId}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const resp = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${ONEINCH_KEY}`,
      Accept: "application/json",
    },
  });
  return resp.json();
}

router.get("/api/swap/quote", async (req, res) => {
  try {
    const { src, dst, amount, chainId = "1" } = req.query as Record<string, string>;
    if (!src || !dst || !amount) {
      res.status(400).json({ error: "Missing params: src, dst, amount" });
      return;
    }

    const data = await oneInchRequest("/quote", Number(chainId), {
      src,
      dst,
      amount,
      includeTokensInfo: "true",
      includeProtocols: "true",
      fee: "0.3",
      referrer: EVM_FEE_ADDRESS,
    });
    res.json(data);
  } catch (err: any) {
    req.log.error({ err }, "1inch quote error");
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/swap/build", async (req, res) => {
  try {
    const { src, dst, amount, from, slippage = "1", chainId = "1" } = req.query as Record<string, string>;
    if (!src || !dst || !amount || !from) {
      res.status(400).json({ error: "Missing params" });
      return;
    }

    const data = await oneInchRequest("/swap", Number(chainId), {
      src,
      dst,
      amount,
      from,
      slippage,
      fee: "0.3",
      referrer: EVM_FEE_ADDRESS,
      disableEstimate: "false",
    });
    res.json(data);
  } catch (err: any) {
    req.log.error({ err }, "1inch swap error");
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/swap/approve/allowance", async (req, res) => {
  try {
    const { tokenAddress, walletAddress, chainId = "1" } = req.query as Record<string, string>;
    const data = await oneInchRequest("/approve/allowance", Number(chainId), {
      tokenAddress,
      walletAddress,
    });
    res.json(data);
  } catch (err: any) {
    req.log.error({ err }, "1inch allowance error");
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/swap/approve/transaction", async (req, res) => {
  try {
    const { tokenAddress, amount, chainId = "1" } = req.query as Record<string, string>;
    const params: Record<string, string> = { tokenAddress };
    if (amount) params.amount = amount;
    const data = await oneInchRequest("/approve/transaction", Number(chainId), params);
    res.json(data);
  } catch (err: any) {
    req.log.error({ err }, "1inch approve error");
    res.status(500).json({ error: err.message });
  }
});

export default router;
