import { defineChain } from "thirdweb";

/**
 * @chain
 */
export const ancient8Testnet = /*@__PURE__*/ defineChain({
  id: 28122024,
  name: "Ancient8 Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockExplorers: [
    {
      name: "Ancient8 Celestia Testnet explorer",
      url: "https://scanv2-testnet.ancient8.gg",
      apiUrl: "https://scanv2-testnet.ancient8.gg/api",
    },
  ],
  testnet: true,
});
