import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_KEY = process.env.ALCHEMY_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';
const BREADCRUMB_HEADER = "alchemy-mcp"

export const createPricesClient = () => axios.create({
  baseURL: `https://api.g.alchemy.com/prices/v1/${API_KEY}/tokens`,
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json',
    'x-alchemy-client-breadcrumb': BREADCRUMB_HEADER
  },
});
  
export const createMultiChainTokenClient = () => axios.create({
  baseURL: `https://api.g.alchemy.com/data/v1/${API_KEY}/assets/tokens`,
  headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'x-alchemy-client-breadcrumb': BREADCRUMB_HEADER
  },
});

export const createMultiChainTransactionHistoryClient = () => axios.create({
  baseURL: `https://api.g.alchemy.com/data/v1/${API_KEY}/transactions/history`,
  headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'x-alchemy-client-breadcrumb': BREADCRUMB_HEADER
  },
});

export const createAlchemyJsonRpcClient = (network = 'eth-mainnet') => {
  const client = axios.create({
    baseURL: `https://${network}.g.alchemy.com/v2/${API_KEY}`,
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'x-alchemy-client-breadcrumb': BREADCRUMB_HEADER
    }
  });
  
  client.interceptors.request.use((config) => {
    if (config.method === 'post') {
      config.data = {
        id: 1,
        jsonrpc: "2.0",
        ...config.data
      };
    }
    return config;
  });
  
  return client;
};

export const createNftClient = () => axios.create({
  baseURL: `https://api.g.alchemy.com/data/v1/${API_KEY}/assets/nfts`,
  headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'x-alchemy-client-breadcrumb': BREADCRUMB_HEADER
  },
});

export const createWalletClient = () => {
  const client = axios.create({
    baseURL: `https://api.g.alchemy.com/v2/${API_KEY}`,
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json'
    }
  });
  
  client.interceptors.request.use((config) => {
    if (config.method === 'post') {
      if (config.data && config.data.method) {
        config.data = {
          id: 1,
          jsonrpc: "2.0",
          method: config.data.method,
          params: config.data.params
        };
      }
    }
    return config;
  });
  
  return client;
};

// Etherscan API客户端 - 用于合约相关查询
export const createEtherscanClient = (network = 'eth-mainnet') => {
  // Etherscan V2 API对所有网络使用统一端点
  const baseURL = 'https://api.etherscan.io/v2/api';
  
  // 根据网络选择正确的chainId
  let chainId = 1; // eth-mainnet
  
  if (network === 'eth-sepolia') {
    chainId = 11155111; // Sepolia chainId
  } else if (network === 'polygon-mainnet') {
    chainId = 137;
  } else if (network === 'base-mainnet') {
    chainId = 8453;
  } else if (network === 'arbitrum-mainnet') {
    chainId = 42161;
  } else if (network === 'optimism-mainnet') {
    chainId = 10;
  }
  
  return axios.create({
    baseURL,
    params: {
      apikey: ETHERSCAN_API_KEY,
      chainid: chainId
    },
    headers: {
      'accept': 'application/json'
    }
  });
};
