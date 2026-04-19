import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, bsc, polygon, arbitrum, optimism, base } from "wagmi/chains";

export const projectId = "9b39025ad1e21900725d77ef50a908cd";

export const chains = [mainnet, bsc, polygon, arbitrum, optimism, base] as const;

export const wagmiConfig = getDefaultConfig({
  appName: "Vestige Index",
  projectId,
  chains,
  ssr: false,
});
