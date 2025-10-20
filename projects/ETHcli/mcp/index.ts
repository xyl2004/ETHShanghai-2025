#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { alchemyApi } from './api/alchemyApi.js';
import { convertTimestampToDate } from './utils/convertTimestampToDate.js';
import { convertWeiToEth } from './utils/ethConversions.js';
import { calculateDateRange, parseNaturalLanguageTimeFrame, toISO8601 } from './utils/dateUtils.js';
const server = new McpServer({
  name: "alchemy-mcp-server",
  version: "0.2.0-rc.0",
});

// || ** PRICES API ** ||
// Fetch the price of a token by it's symbol eg. "BTC" or "ETH"
server.tool('fetchTokenPriceBySymbol', {
  symbols: z.array(z.string()).describe('A list of blockchaintoken symbols to query. e.g. ["BTC", "ETH"]'),
}, async (params) => {
  try {
    const result = await alchemyApi.getTokenPriceBySymbol(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getTokenPriceBySymbol:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// Fetch the price of a token by the token contract address
server.tool('fetchTokenPriceByAddress', {
  addresses: z.array(z.object({
    address: z.string().describe('The token contract address to query. e.g. "0x1234567890123456789012345678901234567890"'),
    network: z.string().describe('The blockchain network to query. e.g. "eth-mainnet" or "base-mainnet"')
  })).describe('A list of token contract address and network pairs'),
}, async (params) => {
  try {
    const result = await alchemyApi.getTokenPriceByAddress(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getTokenPriceByAddress:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// Fetch the price history of a token by Symbol
server.tool('fetchTokenPriceHistoryBySymbol', {
  symbol: z.string().describe('The token symbol to query. e.g. "BTC" or "ETH"'),
  startTime: z.string().describe('The start time date to query. e.g. "2021-01-01"'),
  endTime: z.string().describe('The end time date to query. e.g. "2021-01-01"'),
  interval: z.string().describe('The interval to query. e.g. "1d" or "1h"')
}, async (params) => {
  try {
    const result = await alchemyApi.getTokenPriceHistoryBySymbol({
      ...params,
      startTime: toISO8601(params.startTime),
      endTime: toISO8601(params.endTime)
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getTokenPriceHistoryBySymbol:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// Fetch token price history using various time frame formats or natural language
server.tool('fetchTokenPriceHistoryByTimeFrame', {
  symbol: z.string().describe('The token symbol to query. e.g. "BTC" or "ETH"'),
  timeFrame: z.string().describe('Time frame like "last-week", "past-7d", "ytd", "last-month", etc. or use natural language like "last week"'),
  interval: z.string().default('1d').describe('The interval to query. e.g. "1d" or "1h"'),
  useNaturalLanguageProcessing: z.boolean().default(false).describe('If true, will interpret timeFrame as natural language'),
}, async (params) => {
  try {
    // Process time frame - either directly or through NLP
    let timeFrame = params.timeFrame;
    if (params.useNaturalLanguageProcessing) {
      timeFrame = parseNaturalLanguageTimeFrame(params.timeFrame);
    }
    
    // Calculate date range
    const { startDate, endDate } = calculateDateRange(timeFrame);
    
    // Fetch the data
    const result = await alchemyApi.getTokenPriceHistoryBySymbol({
      symbol: params.symbol,
      startTime: startDate,
      endTime: endDate,
      interval: params.interval
    });
    
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in fetchTokenPriceHistoryByTimeFrame:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// || ** MultiChain Token API ** ||

// Fetch the current balance, price, and metadata of the tokens owned by specific addresses using network and address pairs.
// The returned response from the LLM should be formatted in an easy to read table format.
server.tool('fetchTokensOwnedByMultichainAddresses', {
  addresses: z.array(z.object({
    address: z.string().describe('The wallet address to query. e.g. "0x1234567890123456789012345678901234567890"'),
    networks: z.array(z.string()).describe('The blockchain networks to query. e.g. ["eth-mainnet", "base-mainnet"]')
  })).describe('A list of wallet address and network pairs'),
}, async (params) => {
  try {
    const result = await alchemyApi.getTokensByMultichainAddress(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getTokensByMultichainAddress:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// || ** MultiChain Transaction History API ** ||

// Fetch the transaction history of singular or multiple wallet addresses using multiple blockchain networks.
// The returned response from the LLM should list out transactions with data and dates not just summarize them.
server.tool('fetchAddressTransactionHistory', {
  addresses: z.array(z.object({
    address: z.string().describe('The wallet address to query. e.g. "0x1234567890123456789012345678901234567890"'),
    networks: z.array(z.string()).describe('The blockchain networks to query. e.g. ["eth-mainnet", "base-mainnet"]')
  })).describe('A list of wallet address and network pairs'),
  before: z.string().optional().describe('The cursor that points to the previous set of results. Use this to paginate through the results.'),
  after: z.string().optional().describe('The cursor that points to the next set of results. Use this to paginate through the results.'),
  limit: z.number().default(25).optional().describe('The number of results to return. Default is 25. Max is 100')
}, async (params) => {  
  try {
    let result = await alchemyApi.getTransactionHistoryByMultichainAddress(params);
    // List the transaction hash when returning the result to the user
    const formattedTxns = result.transactions.map((transaction: any) => ({
      ...transaction,
      date: convertTimestampToDate(transaction.blockTimestamp),
      ethValue: convertWeiToEth(transaction.value)
    }));

    result.transactions = formattedTxns;
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getTransactionHistoryByMultichainAddress:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true     
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// || ** TRANSFERS API ** ||

// Fetch the transfers and transaction history for any address
server.tool('fetchTransfers', {
  fromBlock: z.string().default('0x0').describe('The block number to start the search from. e.g. "1234567890". Inclusive from block (hex string, int, latest, or indexed).'),
  toBlock: z.string().default('latest').describe('The block number to end the search at. e.g. "1234567890". Inclusive to block (hex string, int, latest, or indexed).'),
  fromAddress: z.string().optional().describe('The wallet address to query the transfer was sent from.'),
  toAddress: z.string().optional().describe('The wallet address to query the transfer was sent to.'),
  contractAddresses: z.array(z.string()).default([]).describe('The contract addresses to query. e.g. ["0x1234567890123456789012345678901234567890"]'),
  category: z.array(z.string()).default(['external', 'erc20']).describe('The category of transfers to query. e.g. "external" or "internal"'),
  order: z.string().default('asc').describe('The order of the results. e.g. "asc" or "desc".'),
  withMetadata: z.boolean().default(false).describe('Whether to include metadata in the results.'),
  excludeZeroValue: z.boolean().default(true).describe('Whether to exclude zero value transfers.'),
  maxCount: z.string().default('0xA').describe('The maximum number of results to return. e.g. "0x3E8".'),
  pageKey: z.string().optional().describe('The cursor to start the search from. Use this to paginate through the results.'),
  network: z.string().default('eth-mainnet').describe('The blockchain network to query. e.g. "eth-mainnet" or "base-mainnet").'),
  
}, async (params) => {
  try {
    const result = await alchemyApi.getAssetTransfers(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in fetchTransfers:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// || ** SEPOLIA TRANSACTION API ** ||

// Fetch transaction history for Sepolia testnet addresses
server.tool('fetchSepoliaTransactions', {
  address: z.string().describe('The wallet address to query on Sepolia testnet. e.g. "0x1234567890123456789012345678901234567890"'),
  fromBlock: z.string().default('0x0').describe('The block number to start the search from. e.g. "0x0" or "latest".'),
  toBlock: z.string().default('latest').describe('The block number to end the search at. e.g. "latest" or a specific block number.'),
  category: z.array(z.string()).default(['external', 'internal', 'erc20', 'erc721', 'erc1155']).describe('The category of transfers to query.'),
  maxCount: z.number().default(10).describe('The maximum number of results to return. Default is 10, max is 100.'),
  pageKey: z.string().optional().describe('The cursor to start the search from. Use this to paginate through the results.')
}, async (params) => {
  try {
    const result = await alchemyApi.getSepoliaTransactions(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getSepoliaTransactions:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// || ** NFT API ** ||

// Fetch the NFTs owned by a singular or multiple wallet addresses across multiple blockchain networks.
server.tool('fetchNftsOwnedByMultichainAddresses', {
  addresses: z.array(z.object({
    address: z.string().describe('The wallet address to query. e.g. "0x1234567890123456789012345678901234567890"'),
    networks: z.array(z.string()).default(['eth-mainnet']).describe('The blockchain networks to query. e.g. ["eth-mainnet", "base-mainnet"]'),
    excludeFilters: z.array(z.enum(['SPAM', 'AIRDROPS'])).default(["SPAM", "AIRDROPS"]).describe('The filters to exclude from the results. e.g. ["SPAM", "AIRDROPS"]'),
    includeFilters: z.array(z.enum(['SPAM', 'AIRDROPS'])).default([]).describe('The filters to include in the results. e.g. ["SPAM", "AIRDROPS"]'),
    spamConfidenceLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).default('VERY_HIGH').describe('The spam confidence level to query. e.g. "LOW" or "HIGH"'),
  })).describe('A list of wallet address and network pairs'),
  withMetadata: z.boolean().default(true).describe('Whether to include metadata in the results.'),
  pageKey: z.string().optional().describe('The cursor to start the search from. Use this to paginate through the results.'),
  pageSize: z.number().default(10).describe('The number of results to return. Default is 100. Max is 100'),
}, async (params) => {
  try {
    const result = await alchemyApi.getNftsForAddress(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getNFTsForOwner:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// Fetch the contract data for an NFT owned by a singular or multiple wallet addresses across multiple blockchain networks
// The returned response from the LLM should show information about the NFT contract not the specific NFTs held by the wallet address at that contract
server.tool('fetchNftContractDataByMultichainAddress', {
  addresses: z.array(z.object({
    address: z.string().describe('The wallet address to query. e.g. "0x1234567890123456789012345678901234567890"'),
    networks: z.array(z.string()).default(['eth-mainnet']).describe('The blockchain networks to query. e.g. ["eth-mainnet", "base-mainnet"]'),
  })).describe('A list of wallet address and network pairs'),
  withMetadata: z.boolean().default(true).describe('Whether to include metadata in the results.'),
}, async (params) => {
  try {
    const result = await alchemyApi.getNftContractsByAddress(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getNftContractsByAddress:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// || ** WALLET API ** ||

// Send a transaction to a specific address using the owner SCA account address and the signer address
server.tool('sendTransaction', {
  ownerScaAccountAddress: z.string().describe('The owner SCA account address.'),
  signerAddress: z.string().describe('The signer address to send the transaction from.'),
  toAddress: z.string().describe('The address to send the transaction to.'),
  value: z.string().optional().describe('The value of the transaction in ETH.'),
  callData: z.string().optional().describe('The data of the transaction.'),
  }, async (params) => {
    try {
      const result = await alchemyApi.sendTransaction(params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in sendTransaction:', error);
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true
        };
      }
      return {
        content: [{ type: "text", text: 'Unknown error occurred' }],
        isError: true
      };
    }
  })

// || ** SWAP API ** ||
server.tool('swap', {
  ownerScaAccountAddress: z.string().describe('The owner SCA account address.'),
  signerAddress: z.string().describe('The signer address to send the transaction from.')
}, async (params) => {
  try {
    const result = await alchemyApi.swap(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in swap:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// || ** GAS PRICE API ** ||
// Get current gas price for a specific network
server.tool('getGasPrice', {
  network: z.string().optional().default('eth-mainnet').describe('The blockchain network to query. e.g. "eth-mainnet", "polygon-mainnet", "base-mainnet". Defaults to "eth-mainnet".')
}, async (params) => {
  try {
    const result = await alchemyApi.getGasPrice(params.network);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getGasPrice:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// Get fee history for a specific network
server.tool('getFeeHistory', {
  network: z.string().optional().default('eth-mainnet').describe('The blockchain network to query. e.g. "eth-mainnet", "polygon-mainnet", "base-mainnet". Defaults to "eth-mainnet".'),
  blockCount: z.number().optional().default(10).describe('Number of blocks to query. Defaults to 10.'),
  newestBlock: z.string().optional().default('latest').describe('The newest block to query. Can be "latest", "pending", or a block number. Defaults to "latest".'),
  rewardPercentiles: z.array(z.number()).optional().default([25, 50, 75]).describe('Array of percentiles for priority fees. Defaults to [25, 50, 75].')
}, async (params) => {
  try {
    const result = await alchemyApi.getFeeHistory(
      params.network, 
      params.blockCount, 
      params.newestBlock, 
      params.rewardPercentiles
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getFeeHistory:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// || ** TRANSFER API ** ||
// Transfer ETH to another address
server.tool('transferEth', {
  toAddress: z.string().describe('The recipient address to send ETH to. e.g. "0x1234567890123456789012345678901234567890"'),
  amount: z.string().describe('The amount of ETH to send. e.g. "0.1" for 0.1 ETH'),
  network: z.string().optional().default('eth-mainnet').describe('The blockchain network to use. e.g. "eth-mainnet", "eth-sepolia". Defaults to "eth-mainnet".')
}, async (params) => {
  try {
    const result = await alchemyApi.transferEth(params.toAddress, params.amount, params.network);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in transferEth:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// Transfer ERC-20 tokens to another address
server.tool('transferToken', {
  tokenAddress: z.string().describe('The ERC-20 token contract address. e.g. "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" (USDC)'),
  toAddress: z.string().describe('The recipient address to send tokens to. e.g. "0x1234567890123456789012345678901234567890"'),
  amount: z.string().describe('The amount of tokens to send. e.g. "100" for 100 tokens'),
  network: z.string().optional().default('eth-mainnet').describe('The blockchain network to use. e.g. "eth-mainnet", "polygon-mainnet". Defaults to "eth-mainnet".'),
  decimals: z.number().optional().default(18).describe('The token decimals. Defaults to 18. Common values: 6 for USDC/USDT, 18 for most tokens.')
}, async (params) => {
  try {
    const result = await alchemyApi.transferToken(
      params.tokenAddress,
      params.toAddress,
      params.amount,
      params.network,
      params.decimals
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in transferToken:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// || ** CONTRACT INTERACTION API ** ||
// Get contract ABI from Etherscan
server.tool('getContractAbi', {
  contractAddress: z.string().describe('The smart contract address. e.g. "0x6B175474E89094C44Da98b954EedeAC495271d0F" (DAI)'),
  network: z.string().optional().default('eth-mainnet').describe('The blockchain network. e.g. "eth-mainnet", "polygon-mainnet", "base-mainnet". Defaults to "eth-mainnet".')
}, async (params) => {
  try {
    const result = await alchemyApi.getContractAbi(params.contractAddress, params.network);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getContractAbi:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// Call contract read-only method (view/pure functions)
server.tool('callContractReadMethod', {
  contractAddress: z.string().describe('The smart contract address. e.g. "0x6B175474E89094C44Da98b954EedeAC495271d0F" (DAI)'),
  methodName: z.string().describe('The method name to call. e.g. "balanceOf", "totalSupply", "name"'),
  params: z.array(z.string()).optional().default([]).describe('Array of method parameters. e.g. ["0x1234..."] for balanceOf(address). Use empty array [] if no parameters.'),
  network: z.string().optional().default('eth-mainnet').describe('The blockchain network. Defaults to "eth-mainnet".')
}, async (params) => {
  try {
    const result = await alchemyApi.callContractReadMethod(
      params.contractAddress,
      params.methodName,
      params.params,
      params.network
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in callContractReadMethod:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

// Call contract write method (state-changing functions, requires signing)
server.tool('callContractWriteMethod', {
  contractAddress: z.string().describe('The smart contract address. e.g. "0x6B175474E89094C44Da98b954EedeAC495271d0F"'),
  methodName: z.string().describe('The method name to call. e.g. "approve", "transfer", "mint"'),
  params: z.array(z.string()).optional().default([]).describe('Array of method parameters. e.g. ["0x1234...", "1000000000000000000"] for transfer(address, uint256)'),
  value: z.string().optional().default('0').describe('ETH value to send with the transaction (for payable methods). e.g. "0.1" for 0.1 ETH'),
  network: z.string().optional().default('eth-mainnet').describe('The blockchain network. Defaults to "eth-mainnet".')
}, async (params) => {
  try {
    const result = await alchemyApi.callContractWriteMethod(
      params.contractAddress,
      params.methodName,
      params.params,
      params.value,
      params.network
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in callContractWriteMethod:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
    return {
      content: [{ type: "text", text: 'Unknown error occurred' }],
      isError: true
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  try {
    await server.connect(transport);
    console.error('Alchemy MCP Server is running on stdio');
  } catch (error) {
    console.error("Error during server connection:", error);
    if (error instanceof Error) {
      console.error("Detailed error message:", error.message);
    }
    console.error("Possible causes: network issues, incorrect configuration, or server not reachable.");
    console.error("Consider checking the server logs and configuration.");
    process.exit(1);
  }
}

runServer().catch((error) => {
  console.error("Fatal error in runServer():", error);
  process.exit(1);
});
