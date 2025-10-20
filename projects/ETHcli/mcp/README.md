# Alchemy MCP Server

A Model Context Protocol (MCP) server that enables AI agents to interact with Alchemy's blockchain APIs in a structured way. This allows agents to query blockchain data directly without writing any code.

<a href="https://glama.ai/mcp/servers/@alchemyplatform/alchemy-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@alchemyplatform/alchemy-mcp-server/badge" alt="Alchemy Server MCP server" />
</a>

## General Usage

This MCP server creates a bridge between AI agents and Alchemy's blockchain APIs, allowing agents to:
- Query token prices and price history (including flexible time frame queries)
- Get NFT ownership information and contract data
- View transaction history across multiple networks
- Check token balances across multiple blockchain networks
- Retrieve detailed asset transfers with filtering
- Send transactions via Smart Contract Accounts (**requires configured wallet agent server**)
- Execute token swaps via DEX protocols (**requires configured wallet agent server**)
- And more!

### Quick Setup

To quickly set up the MCP server, use the following configuration in your MCP config file (typically in Claude Desktop or Cursor settings):

```json
{
  "mcpServers": {
    "alchemy": {
      "command": "npx",
      "args": [
        "-y",
        "@alchemy/mcp-server"
      ],
      "env": {
        "ALCHEMY_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

This configuration allows you to use the server without manually cloning the repository.

### Environment Variables

The MCP server requires the following environment variables:

- `ALCHEMY_API_KEY` - Your Alchemy API key (required for all blockchain data queries)
- `ETHERSCAN_API_KEY` - Your Etherscan API key (required for contract ABI and source code queries)

**For contract interaction (read/write methods)**, you need:

- `EVM_PRIVATE_KEY` - Private key for signing transactions (required for write operations)

**For transaction and swap functionality**, you must also configure:

- `AGENT_WALLET_SERVER` - URL of a configured wallet agent server that handles Smart Contract Account operations

⚠️ **Important**: 
- The `sendTransaction` and `swap` methods require external wallet infrastructure
- Contract write methods require `EVM_PRIVATE_KEY` to sign transactions
- Get free Etherscan API keys at: https://etherscan.io/apis

## Available Methods

You can prompt your AI agent to use the following methods:

### Token Price Methods

1. **fetchTokenPriceBySymbol**
   - Gets current price data for tokens by symbol
   - Example: "What's the current price of ETH and BTC?"

2. **fetchTokenPriceByAddress**
   - Gets current price data for tokens by contract address
   - Example: "What's the price of the token at address 0x1234...5678 on Ethereum mainnet?"

3. **fetchTokenPriceHistoryBySymbol**
   - Gets historical price data for tokens with specific date ranges
   - Example: "Show me BTC price history from Jan 1 to Feb 1, 2023, with daily intervals"

4. **fetchTokenPriceHistoryByTimeFrame**
   - Gets historical price data using flexible time frames or natural language
   - Example: "Show me ETH price for the last week" or "Get BTC price for the past 30 days"

### Multichain Token Methods

5. **fetchTokensOwnedByMultichainAddresses**
   - Gets token balances for addresses across multiple networks
   - Example: "What tokens does 0xabc...123 hold on Ethereum and Base?"

### Transaction History Methods

6. **fetchAddressTransactionHistory**
   - Gets transaction history for addresses across multiple networks
   - Example: "Show recent transactions for wallet 0xdef...456 on Ethereum"

7. **fetchTransfers**
   - Gets detailed asset transfer data with advanced filtering options
   - Example: "Show me all ERC-20 transfers to or from 0xghi...789"

8. **fetchSepoliaTransactions**
   - Gets transaction history specifically for Sepolia testnet addresses
   - Supports all transaction types: external, internal, ERC20, ERC721, ERC1155
   - Example: "Show transactions for 0xabc...123 on Sepolia testnet"

### NFT Methods

9. **fetchNftsOwnedByMultichainAddresses**
   - Gets all NFTs owned by addresses with spam filtering
   - Example: "What NFTs does 0xjkl...012 own?"

10. **fetchNftContractDataByMultichainAddress**
   - Gets NFT contract data for addresses
   - Example: "What NFT collections does 0xmno...345 have tokens from?"

### Contract Query Methods

11. **getContractAbi**
   - Gets the ABI (Application Binary Interface) of a verified smart contract from Etherscan
   - Supports multiple networks: eth-mainnet, eth-sepolia, polygon-mainnet, base-mainnet, etc.
   - Example: "Get the ABI for contract 0xdAC17F958D2ee523a2206206994597C13D831ec7"

12. **getContractSource**
   - Gets the complete source code of a verified smart contract from Etherscan
   - Returns source code, ABI, compiler version, optimization settings, and more
   - Example: "Show me the source code for USDT contract"

13. **getContractCreation**
   - Gets contract creator address and creation transaction hash
   - Supports querying up to 5 contracts at once
   - Example: "Who created contract 0xabc...123?"

14. **callContractReadMethod**
   - Calls read-only (view/pure) functions on smart contracts
   - No gas required, no transaction needed
   - Example: "Call balanceOf on USDT contract for address 0xdef...456"

15. **callContractWriteMethod**
   - Calls state-changing functions on smart contracts (requires wallet)
   - **⚠️ Important**: Requires EVM_PRIVATE_KEY environment variable
   - Example: "Approve 100 USDT for spender 0xghi...789"

### Transaction Methods

16. **sendTransaction**
    - Sends transactions via Smart Contract Accounts
    - **⚠️ Important**: Requires a configured wallet agent server with `AGENT_WALLET_SERVER` environment variable
    - Example: "Send 0.1 ETH to 0xpqr...678"

### Swap Methods

17. **swap**
    - Executes token swaps via DEX protocols (Uniswap)
    - **⚠️ Important**: Requires a configured wallet agent server with `AGENT_WALLET_SERVER` environment variable
    - Example: "Swap 100 USDC for ETH"

## Local Development and Open Source Contributions

### Installation

1. Clone the repository
```bash
git clone https://github.com/alchemyplatform/alchemy-mcp.git
cd alchemy-mcp
```

2. Install dependencies
```bash
pnpm install
```

### Development

```bash
pnpm watch
```

### Building for Production

```bash
pnpm build
```

### Using the MCP Inspector for Debugging

The MCP Inspector helps you debug your MCP server by providing a visual interface to test your methods:

```bash
pnpm inspector
```

This will start the MCP Inspector which you can access in your browser. It allows you to:
- See all available methods
- Test methods with different parameters
- View the response data
- Debug issues with your MCP server

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License.

## Example Prompts

Here are some example prompts you can use with your AI agent:

```
What's the current price of Bitcoin and Ethereum?

Show me the NFTs owned by the wallet 0x1234...5678 on Ethereum.

What tokens does wallet 0xabcd...6789 hold across Ethereum and Base?

Get me the transaction history for 0x9876...5432.

Show me the price history of Ethereum from January 1st to today with daily intervals.

Get me Bitcoin price data for the last week with hourly intervals.

Show me ETH price performance for the past month.

What ERC-20 transfers happened to address 0x1234...5678 in the last 100 blocks?
```

## API Reference

For more information about Alchemy's APIs, refer to:
- [Alchemy API Documentation](https://docs.alchemy.com/)
