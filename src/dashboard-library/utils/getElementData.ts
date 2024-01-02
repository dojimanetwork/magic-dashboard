export function extractMainElementFromId(elementId: string): string {
  // Define the regex pattern to match strings starting with ethereum-, dojima-, solana-, etc.
  const regex =
    /(dojima|ethereum|solana|avalanche|polkadot)-(nft|erc20|dex|defi|nftMarketPlace|erc721)\b/g;

  // Use the regex pattern to find matches in the input string
  const matches = elementId.match(regex);

  // If matches are found, return the first matched item; otherwise, return an empty string
  return matches ? matches[0] : "";
}
