// Swap Validation & Optimization Service
// Validates swap parameters, estimates gas, and optimizes routes before execution

import { ethers } from 'ethers';

export interface SwapValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedGas?: bigint;
  estimatedGasUSD?: number;
  totalCostUSD?: number;
  recommendation?: string;
}

export interface SwapOptimization {
  optimizedAmount: string;
  recommendedProvider: string;
  estimatedOutput: string;
  minOutput: string;
  maxSlippage: number;
  estimatedTime: number; // seconds
  breakEvenPrice: number;
}

const VALIDATOR = {
  // Validation rules
  MIN_AMOUNT: 0.00001,
  MAX_AMOUNT: 1000000,
  MIN_BALANCE_BUFFER: 0.01, // Keep 0.01 native token for gas
  PRICE_IMPACT_SAFE: 2,
  PRICE_IMPACT_WARNING: 5,
  PRICE_IMPACT_CRITICAL: 10,
  GAS_PRICE_MULTIPLIER: 1.1, // Add 10% to estimated gas
  SLIPPAGE_MIN: 0.1,
  SLIPPAGE_MAX: 5,
  SLIPPAGE_SAFE: 1,
};

/**
 * Validate swap parameters before execution
 */
export function validateSwap(
  amount: string,
  fromToken: string,
  toToken: string,
  userBalance: string,
  priceImpact: number,
  selectedProvider: string,
  slippageTolerance: number = 1
): SwapValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Amount validation
  if (!amount || parseFloat(amount) <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (parseFloat(amount) < VALIDATOR.MIN_AMOUNT) {
    errors.push(`Minimum swap amount is ${VALIDATOR.MIN_AMOUNT}`);
  }

  if (parseFloat(amount) > VALIDATOR.MAX_AMOUNT) {
    errors.push(`Maximum swap amount is ${VALIDATOR.MAX_AMOUNT}`);
  }

  // Balance validation
  if (parseFloat(amount) > parseFloat(userBalance)) {
    errors.push(`Insufficient balance. You have ${userBalance} ${fromToken}`);
  }

  if (parseFloat(userBalance) - parseFloat(amount) < VALIDATOR.MIN_BALANCE_BUFFER) {
    warnings.push(
      `Warning: You'll have less than ${VALIDATOR.MIN_BALANCE_BUFFER} ${fromToken} remaining for gas fees`
    );
  }

  // Token validation
  if (fromToken === toToken) {
    errors.push('From and To tokens must be different');
  }

  if (!fromToken || !toToken) {
    errors.push('Please select both tokens');
  }

  // Price impact validation
  if (priceImpact > VALIDATOR.PRICE_IMPACT_CRITICAL) {
    errors.push(
      `Price impact is critically high (${priceImpact.toFixed(2)}%). Transaction will likely fail.`
    );
  } else if (priceImpact > VALIDATOR.PRICE_IMPACT_WARNING) {
    warnings.push(
      `High price impact detected (${priceImpact.toFixed(2)}%). You may receive significantly less tokens.`
    );
  } else if (priceImpact > VALIDATOR.PRICE_IMPACT_SAFE) {
    warnings.push(
      `Moderate price impact (${priceImpact.toFixed(2)}%). Consider using a smaller amount.`
    );
  }

  // Slippage validation
  if (slippageTolerance < VALIDATOR.SLIPPAGE_MIN) {
    warnings.push('Slippage tolerance is very low. Transaction may fail.');
  }

  if (slippageTolerance > VALIDATOR.SLIPPAGE_MAX) {
    warnings.push('Slippage tolerance is very high. You may receive worse rates.');
  }

  if (slippageTolerance > VALIDATOR.SLIPPAGE_SAFE) {
    warnings.push(`Slippage tolerance of ${slippageTolerance}% is above recommended ${VALIDATOR.SLIPPAGE_SAFE}%`);
  }

  // Provider validation
  const validProviders = ['oneinch', 'openocean', 'matcha', 'odos'];
  if (!validProviders.includes(selectedProvider)) {
    errors.push('Invalid provider selected');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendation: generateRecommendation(errors, warnings, priceImpact),
  };
}

/**
 * Estimate gas cost for swap transaction
 */
export function estimateGasCost(
  baseGasEstimate: bigint,
  gasPrice: bigint,
  nativeTokenPrice: number
): {
  gas: bigint;
  costETH: number;
  costUSD: number;
} {
  const adjustedGas = baseGasEstimate * BigInt(Math.floor(VALIDATOR.GAS_PRICE_MULTIPLIER * 100)) / BigInt(100);
  const totalGasWei = adjustedGas * gasPrice;
  const totalGasEth = parseFloat(ethers.formatEther(totalGasWei));
  const totalGasUSD = totalGasEth * nativeTokenPrice;

  return {
    gas: adjustedGas,
    costETH: totalGasEth,
    costUSD: totalGasUSD,
  };
}

/**
 * Optimize swap execution parameters
 */
export function optimizeSwap(
  amount: string,
  rate: number,
  priceImpact: number,
  provider: string,
  slippageTolerance: number = 1
): SwapOptimization {
  const parsedAmount = parseFloat(amount);
  const minOutput = parsedAmount * rate * ((100 - slippageTolerance) / 100);

  // Adjust slippage based on price impact
  let adjustedSlippage = slippageTolerance;
  if (priceImpact > 5) {
    adjustedSlippage = Math.min(slippageTolerance + (priceImpact - 5) * 0.2, 5);
  }

  // Estimate execution time (varies by provider)
  const executionTimes: Record<string, number> = {
    oneinch: 15,
    openocean: 25,
    matcha: 12,
    odos: 30,
  };

  const estimatedTime = executionTimes[provider] || 20;

  // Calculate break-even price
  const breakEvenPrice = rate * (1 - priceImpact / 100);

  return {
    optimizedAmount: parsedAmount.toFixed(18),
    recommendedProvider: provider,
    estimatedOutput: (parsedAmount * rate).toFixed(18),
    minOutput: minOutput.toFixed(18),
    maxSlippage: adjustedSlippage,
    estimatedTime,
    breakEvenPrice,
  };
}

/**
 * Calculate total swap cost including gas and fees
 */
export function calculateTotalCost(
  swapAmount: string,
  swapFeePercentage: number,
  gasCostUSD: number,
  platformFeePercentage: number = 0.3
): {
  swapAmount: number;
  swapFeeUSD: number;
  platformFeeUSD: number;
  gasCostUSD: number;
  totalCostUSD: number;
  totalCostPercentage: number;
} {
  const swapAmountNum = parseFloat(swapAmount);
  const swapFeeUSD = (swapAmountNum / 1) * (swapFeePercentage / 100);
  const platformFeeUSD = (swapAmountNum / 1) * (platformFeePercentage / 100);
  const totalCostUSD = swapFeeUSD + platformFeeUSD + gasCostUSD;
  const totalCostPercentage = (totalCostUSD / swapAmountNum) * 100;

  return {
    swapAmount: swapAmountNum,
    swapFeeUSD,
    platformFeeUSD,
    gasCostUSD,
    totalCostUSD,
    totalCostPercentage,
  };
}

/**
 * Check if swap route is still valid (price hasn't changed significantly)
 */
export function isRouteStale(
  currentPrice: number,
  quotePrice: number,
  maxDeviation: number = 2
): boolean {
  const deviation = Math.abs((currentPrice - quotePrice) / quotePrice) * 100;
  return deviation > maxDeviation;
}

/**
 * Recommend provider based on conditions
 */
export function recommendProvider(
  providers: Array<{ id: string; rate: number; fee: number; impact: number }>,
  userPriority: 'bestRate' | 'lowFee' | 'fastExecution' = 'bestRate'
): string {
  if (providers.length === 0) return 'oneinch';

  let recommended = providers[0];

  switch (userPriority) {
    case 'bestRate':
      recommended = providers.reduce((prev, current) =>
        current.rate > prev.rate ? current : prev
      );
      break;

    case 'lowFee':
      recommended = providers.reduce((prev, current) =>
        current.fee < prev.fee ? current : prev
      );
      break;

    case 'fastExecution':
      // Assume order is: 1inch, openocean, matcha, odos
      // 1inch is typically fastest
      recommended = providers.find((p) => p.id === 'oneinch') || providers[0];
      break;
  }

  return recommended.id;
}

/**
 * Generate human-readable recommendation
 */
function generateRecommendation(
  errors: string[],
  warnings: string[],
  priceImpact: number
): string {
  if (errors.length > 0) {
    return `Fix the following errors before proceeding: ${errors[0]}`;
  }

  if (priceImpact > VALIDATOR.PRICE_IMPACT_WARNING) {
    return 'Consider using a smaller amount to reduce price impact.';
  }

  if (warnings.length > 0) {
    return `Proceed with caution: ${warnings[0]}`;
  }

  if (priceImpact > VALIDATOR.PRICE_IMPACT_SAFE) {
    return 'Swap looks reasonable, but moderate impact detected.';
  }

  return 'Swap looks good! Low impact and safe conditions.';
}

/**
 * Comprehensive swap pre-flight check
 */
export function performPreflightCheck(
  amount: string,
  fromToken: string,
  toToken: string,
  userBalance: string,
  rate: number,
  priceImpact: number,
  provider: string,
  slippageTolerance: number,
  gasPrice: bigint,
  nativeTokenPrice: number,
  baseGasEstimate: bigint = BigInt(200000)
): {
  validation: SwapValidation;
  optimization: SwapOptimization;
  gasCost: { gas: bigint; costETH: number; costUSD: number };
  totalCost: ReturnType<typeof calculateTotalCost>;
  safe: boolean;
  message: string;
} {
  const validation = validateSwap(
    amount,
    fromToken,
    toToken,
    userBalance,
    priceImpact,
    provider,
    slippageTolerance
  );

  const optimization = optimizeSwap(amount, rate, priceImpact, provider, slippageTolerance);

  const gasCost = estimateGasCost(baseGasEstimate, gasPrice, nativeTokenPrice);

  const totalCost = calculateTotalCost(amount, priceImpact, gasCost.costUSD);

  const safe = validation.isValid && validation.warnings.length === 0;

  const message = safe
    ? `✅ Ready to swap! ${amount} ${fromToken} → ~${optimization.estimatedOutput} ${toToken}`
    : validation.errors.length > 0
      ? `❌ Cannot proceed: ${validation.errors[0]}`
      : `⚠️ Warning: ${validation.warnings[0]}`;

  return {
    validation,
    optimization,
    gasCost,
    totalCost,
    safe,
    message,
  };
}
