import dotenv from 'dotenv';
dotenv.config();
import { createPricesClient, createMultiChainTokenClient, createMultiChainTransactionHistoryClient, createAlchemyJsonRpcClient, createNftClient, createEtherscanClient } from './alchemyClients.js';
import { TokenPriceBySymbol, TokenPriceByAddress, TokenPriceByAddressPair, TokenPriceHistoryBySymbol, MultiChainTokenByAddress, MultiChainTransactionHistoryByAddress, AssetTransfersParams, NftsByAddressParams, NftContractsByAddressParams, AddressPair, SendTransactionParams, SwapParams, SepoliaTransactionParams, ContractAbiParams, ContractSourceParams, ContractCreationParams } from '../types/types.js';
import convertHexBalanceToDecimal from '../utils/convertHexBalanceToDecimal.js';
import { ethers } from 'ethers';

const AGENT_WALLET_SERVER = process.env.AGENT_WALLET_SERVER;
const API_KEY = process.env.ALCHEMY_API_KEY;
const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'; // 免费 API key

export const alchemyApi = {
  
  async getTokenPriceBySymbol(params: TokenPriceBySymbol) {
    try {
      const client = createPricesClient();
      
      const queryParams = new URLSearchParams();
      params.symbols.forEach(symbol => {
        queryParams.append('symbols', symbol.toUpperCase());
      });
      
      const response = await client.get(`/by-symbol?${queryParams}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching token prices:', error);
      throw error;
    }
  },
  
  async getTokenPriceByAddress(params: TokenPriceByAddress) {
    try {
      const client = createPricesClient();
      
      const response = await client.post('/by-address', {
        addresses: params.addresses.map((pair: TokenPriceByAddressPair) => ({
          address: pair.address,
          network: pair.network
        }))
      });

      console.log('Successfully fetched token price:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching token price:', error);
      throw error;
    }
  },
  
  async getTokenPriceHistoryBySymbol(params: TokenPriceHistoryBySymbol) {
    console.log('Fetching token price history for symbol:', params.symbol);
    try {
      const client = createPricesClient();
      
      const response = await client.post('/historical', {
        ...params
      });

      console.log('Successfully fetched token price history:', response.data);
      return response.data;  
    } catch (error) {
      console.error('Error fetching token price history:', error);
      throw error;
    }
  },
  
  async getTokensByMultichainAddress(params: MultiChainTokenByAddress) {
    try {
      const client = createMultiChainTokenClient();
      
      const response = await client.post('/by-address', {
        addresses: params.addresses.map((pair: AddressPair) => ({
          address: pair.address,
          networks: pair.networks
        }))
      });

      const responseData = convertHexBalanceToDecimal(response);
      return responseData;
    } catch (error) {
      console.error('Error fetching token data:', error);
      throw error;
    }
  },
  
  async getTransactionHistoryByMultichainAddress(params: MultiChainTransactionHistoryByAddress) {
    try {
      const { addresses, ...otherParams } = params;
      const client = createMultiChainTransactionHistoryClient();
      
      const response = await client.post('/by-address', {
        addresses: params.addresses.map((pair: AddressPair) => ({
          address: pair.address,  
          networks: pair.networks
        })),
        ...otherParams
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  },

  async getAssetTransfers(params: AssetTransfersParams) {
    const { network, ...otherParams } = params;
    try {
      const client = createAlchemyJsonRpcClient(network);
      
      const response = await client.post('', {
        method: "alchemy_getAssetTransfers",
        params: [{
          ...otherParams
        }]
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching asset transfers:', error);
      throw error;
    }
  },

  async getSepoliaTransactions(params: SepoliaTransactionParams) {
    const { address, fromBlock, toBlock, category, maxCount, pageKey } = params;
    try {
      const client = createAlchemyJsonRpcClient('eth-sepolia');
      
      const response = await client.post('', {
        method: "alchemy_getAssetTransfers",
        params: [{
          fromBlock,
          toBlock,
          fromAddress: address,
          category,
          maxCount: `0x${maxCount.toString(16)}`,
          pageKey
        }]
      });

      // 格式化返回数据
      const result = response.data.result;
      if (result && result.transfers) {
        const formattedTransfers = result.transfers.map((transfer: any) => ({
          ...transfer,
          blockNumber: parseInt(transfer.blockNum, 16),
          timestamp: transfer.blockTimestamp ? parseInt(transfer.blockTimestamp, 16) : null,
          value: transfer.value ? (parseInt(transfer.value, 16) / Math.pow(10, 18)).toFixed(6) : '0',
          date: transfer.blockTimestamp ? new Date(parseInt(transfer.blockTimestamp, 16) * 1000).toLocaleString('zh-CN') : '未知'
        }));

        return {
          ...result,
          transfers: formattedTransfers,
          totalCount: result.transfers.length,
          network: 'eth-sepolia'
        };
      }

      return result;
    } catch (error) {
      console.error('Error fetching Sepolia transactions:', error);
      throw error;
    }
  },

  async getNftsForAddress(params: NftsByAddressParams) {
    try {
      const client = createNftClient();
      
      const response = await client.post('/by-address', { 
        ...params
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching NFTs for address:', error);
      throw error;
    }
  },

  async getNftContractsByAddress(params: NftContractsByAddressParams) {
    try {
      const client = createNftClient();
      
      const response = await client.post('/by-address', {
        ...params
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching NFT contracts by address:', error);
      throw error;
    }
  },

  async sendTransaction(params: SendTransactionParams) {
    const { ownerScaAccountAddress, signerAddress, toAddress, value, callData } = params;
    try {
      const response = await fetch(`${AGENT_WALLET_SERVER}/transactions/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerScaAccountAddress,
          signerAddress,
          toAddress,
          value,
          callData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  },
  
  async swap(params: SwapParams) {
    const { ownerScaAccountAddress, signerAddress } = params;
    console.error('SWAPPING TOKENS');
    try {
      const response = await fetch(`${AGENT_WALLET_SERVER}/transactions/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerScaAccountAddress,
          signerAddress
        })
      });

      console.error('SWAPPING TOKENS RESPONSE', response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error in swap:', error);
      throw error;
    }
  },

  async getGasPrice(network = 'eth-mainnet') {
    try {
      const client = createAlchemyJsonRpcClient(network);
      
      const response = await client.post('', {
        method: "eth_gasPrice",
        params: []
      });

      const gasPriceHex = response.data.result;
      const gasPriceWei = parseInt(gasPriceHex, 16);
      const gasPriceGwei = gasPriceWei / 1e9;

      return {
        network,
        gasPriceHex,
        gasPriceWei: gasPriceWei.toString(),
        gasPriceGwei: gasPriceGwei.toFixed(2)
      };
    } catch (error) {
      console.error('Error fetching gas price:', error);
      throw error;
    }
  },

  async getFeeHistory(network = 'eth-mainnet', blockCount = 10, newestBlock = 'latest', rewardPercentiles = [25, 50, 75]) {
    try {
      const client = createAlchemyJsonRpcClient(network);
      
      const response = await client.post('', {
        method: "eth_feeHistory",
        params: [
          `0x${blockCount.toString(16)}`,
          newestBlock,
          rewardPercentiles
        ]
      });

      const result = response.data.result;
      
      // 转换为可读格式
      const baseFeePerGas = result.baseFeePerGas.map((fee: string) => {
        const feeWei = parseInt(fee, 16);
        const feeGwei = feeWei / 1e9;
        return {
          hex: fee,
          wei: feeWei.toString(),
          gwei: feeGwei.toFixed(2)
        };
      });

      const reward = result.reward?.map((rewardArray: string[]) => 
        rewardArray.map(r => {
          const rewardWei = parseInt(r, 16);
          const rewardGwei = rewardWei / 1e9;
          return {
            hex: r,
            wei: rewardWei.toString(),
            gwei: rewardGwei.toFixed(2)
          };
        })
      );

      return {
        network,
        oldestBlock: parseInt(result.oldestBlock, 16),
        baseFeePerGas,
        reward,
        gasUsedRatio: result.gasUsedRatio
      };
    } catch (error) {
      console.error('Error fetching fee history:', error);
      throw error;
    }
  },

  async transferEth(toAddress: string, amountEth: string, network = 'eth-mainnet') {
    if (!EVM_PRIVATE_KEY) {
      throw new Error('EVM_PRIVATE_KEY environment variable is not set');
    }

    try {
      // 创建 provider
      const rpcUrl = `https://${network}.g.alchemy.com/v2/${API_KEY}`;
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // 创建 wallet
      const wallet = new ethers.Wallet(EVM_PRIVATE_KEY, provider);
      
      // 获取当前余额
      const balance = await provider.getBalance(wallet.address);
      const balanceEth = ethers.formatEther(balance);
      
      // 解析转账金额
      const amountWei = ethers.parseEther(amountEth);
      
      // 检查余额是否足够
      if (balance < amountWei) {
        throw new Error(`Insufficient balance. Current: ${balanceEth} ETH, Required: ${amountEth} ETH`);
      }
      
      // 获取当前 gas 价格
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      
      // 估算 gas 费用
      const gasLimit = 21000n; // 标准 ETH 转账
      const estimatedGasFee = gasPrice * gasLimit;
      const estimatedGasFeeEth = ethers.formatEther(estimatedGasFee);
      
      // 检查余额是否足够支付 gas 费用
      if (balance < amountWei + estimatedGasFee) {
        throw new Error(
          `Insufficient balance to cover amount + gas fee. ` +
          `Balance: ${balanceEth} ETH, Required: ${amountEth} ETH + ${estimatedGasFeeEth} ETH (gas)`
        );
      }
      
      // 构建交易
      const tx = {
        to: toAddress,
        value: amountWei,
        gasLimit: gasLimit,
        gasPrice: gasPrice
      };
      
      console.log('Sending transaction:', {
        from: wallet.address,
        to: toAddress,
        value: amountEth + ' ETH',
        gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' Gwei',
        estimatedGasFee: estimatedGasFeeEth + ' ETH'
      });
      
      // 发送交易
      const txResponse = await wallet.sendTransaction(tx);
      
      console.log('Transaction sent:', txResponse.hash);
      
      // 等待确认
      console.log('Waiting for confirmation...');
      const receipt = await txResponse.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt is null');
      }
      
      // 计算实际 gas 费用
      const actualGasFee = receipt.gasUsed * (receipt.gasPrice || gasPrice);
      const actualGasFeeEth = ethers.formatEther(actualGasFee);
      
      return {
        success: true,
        transactionHash: txResponse.hash,
        from: wallet.address,
        to: toAddress,
        amount: amountEth + ' ETH',
        network,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: ethers.formatUnits(receipt.gasPrice || gasPrice, 'gwei') + ' Gwei',
        gasFee: actualGasFeeEth + ' ETH',
        status: receipt.status === 1 ? 'Success' : 'Failed',
        explorerUrl: network === 'eth-mainnet' 
          ? `https://etherscan.io/tx/${txResponse.hash}`
          : `https://${network}.etherscan.io/tx/${txResponse.hash}`
      };
    } catch (error) {
      console.error('Error transferring ETH:', error);
      throw error;
    }
  },

  async transferToken(tokenAddress: string, toAddress: string, amount: string, network = 'eth-mainnet', decimals = 18) {
    if (!EVM_PRIVATE_KEY) {
      throw new Error('EVM_PRIVATE_KEY environment variable is not set');
    }

    try {
      // 创建 provider
      const rpcUrl = `https://${network}.g.alchemy.com/v2/${API_KEY}`;
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // 创建 wallet
      const wallet = new ethers.Wallet(EVM_PRIVATE_KEY, provider);
      
      // ERC-20 ABI (只需要 transfer 方法)
      const erc20Abi = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function balanceOf(address account) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)'
      ];
      
      // 创建合约实例
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, wallet);
      
      // 获取代币信息
      const symbol = await tokenContract.symbol();
      const tokenDecimals = await tokenContract.decimals();
      
      // 获取余额
      const balance = await tokenContract.balanceOf(wallet.address);
      const balanceFormatted = ethers.formatUnits(balance, tokenDecimals);
      
      // 解析转账金额
      const amountWei = ethers.parseUnits(amount, tokenDecimals);
      
      // 检查余额是否足够
      if (balance < amountWei) {
        throw new Error(`Insufficient ${symbol} balance. Current: ${balanceFormatted} ${symbol}, Required: ${amount} ${symbol}`);
      }
      
      // 检查 ETH 余额是否足够支付 gas
      const ethBalance = await provider.getBalance(wallet.address);
      const ethBalanceEth = ethers.formatEther(ethBalance);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      const estimatedGasLimit = 65000n; // ERC-20 转账通常需要约 65000 gas
      const estimatedGasFee = gasPrice * estimatedGasLimit;
      const estimatedGasFeeEth = ethers.formatEther(estimatedGasFee);
      
      if (ethBalance < estimatedGasFee) {
        throw new Error(
          `Insufficient ETH balance to pay gas fee. ` +
          `ETH Balance: ${ethBalanceEth} ETH, Required: ${estimatedGasFeeEth} ETH (gas)`
        );
      }
      
      console.log('Sending token transfer:', {
        from: wallet.address,
        to: toAddress,
        token: symbol,
        amount: amount,
        gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' Gwei',
        estimatedGasFee: estimatedGasFeeEth + ' ETH'
      });
      
      // 发送交易
      const txResponse = await tokenContract.transfer(toAddress, amountWei);
      
      console.log('Transaction sent:', txResponse.hash);
      
      // 等待确认
      console.log('Waiting for confirmation...');
      const receipt = await txResponse.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt is null');
      }
      
      // 计算实际 gas 费用
      const actualGasFee = receipt.gasUsed * (receipt.gasPrice || gasPrice);
      const actualGasFeeEth = ethers.formatEther(actualGasFee);
      
      return {
        success: true,
        transactionHash: txResponse.hash,
        from: wallet.address,
        to: toAddress,
        token: symbol,
        tokenAddress: tokenAddress,
        amount: amount + ' ' + symbol,
        network,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: ethers.formatUnits(receipt.gasPrice || gasPrice, 'gwei') + ' Gwei',
        gasFee: actualGasFeeEth + ' ETH',
        status: receipt.status === 1 ? 'Success' : 'Failed',
        explorerUrl: network === 'eth-mainnet' 
          ? `https://etherscan.io/tx/${txResponse.hash}`
          : `https://${network}.etherscan.io/tx/${txResponse.hash}`
      };
    } catch (error) {
      console.error('Error transferring token:', error);
      throw error;
    }
  },

  async getContractAbi(contractAddress: string, network = 'eth-mainnet') {
    try {
      // 根据网络选择对应的 chainid
      let chainId = '1'; // 以太坊主网
      
      if (network === 'polygon-mainnet') {
        chainId = '137';
      } else if (network === 'arbitrum-mainnet') {
        chainId = '42161';
      } else if (network === 'optimism-mainnet') {
        chainId = '10';
      } else if (network === 'base-mainnet') {
        chainId = '8453';
      } else if (network === 'eth-sepolia') {
        chainId = '11155111';
      }
      
      // 使用 Etherscan API V2（统一端点）
      const apiUrl = 'https://api.etherscan.io/v2/api';
      
      // 从 Etherscan 获取 ABI
      const response = await fetch(
        `${apiUrl}?chainid=${chainId}&module=contract&action=getabi&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === '0') {
        throw new Error(data.result || 'Failed to fetch contract ABI');
      }
      
      const abi = JSON.parse(data.result);
      
      // 解析 ABI，提取有用的信息
      const functions = abi.filter((item: any) => item.type === 'function');
      const events = abi.filter((item: any) => item.type === 'event');
      
      // 分类函数
      const readFunctions = functions.filter((f: any) => 
        f.stateMutability === 'view' || f.stateMutability === 'pure'
      );
      const writeFunctions = functions.filter((f: any) => 
        f.stateMutability !== 'view' && f.stateMutability !== 'pure'
      );
      
      return {
        contractAddress,
        network,
        abi: abi,
        summary: {
          totalFunctions: functions.length,
          readFunctions: readFunctions.length,
          writeFunctions: writeFunctions.length,
          events: events.length
        },
        readFunctions: readFunctions.map((f: any) => ({
          name: f.name,
          inputs: f.inputs?.map((i: any) => `${i.type} ${i.name}`).join(', ') || '',
          outputs: f.outputs?.map((o: any) => o.type).join(', ') || ''
        })),
        writeFunctions: writeFunctions.map((f: any) => ({
          name: f.name,
          inputs: f.inputs?.map((i: any) => `${i.type} ${i.name}`).join(', ') || '',
          payable: f.stateMutability === 'payable'
        }))
      };
    } catch (error) {
      console.error('Error fetching contract ABI:', error);
      throw error;
    }
  },

  async callContractReadMethod(
    contractAddress: string,
    methodName: string,
    params: any[] = [],
    network = 'eth-mainnet'
  ) {
    try {
      // 创建 provider
      const rpcUrl = `https://${network}.g.alchemy.com/v2/${API_KEY}`;
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // 获取合约 ABI
      const { abi } = await this.getContractAbi(contractAddress, network);
      
      // 创建合约实例（只读，不需要 signer）
      const contract = new ethers.Contract(contractAddress, abi, provider);
      
      // 检查方法是否存在
      if (typeof contract[methodName] !== 'function') {
        throw new Error(`Method '${methodName}' not found in contract`);
      }
      
      console.log(`Calling read method: ${methodName}(${params.join(', ')})`);
      
      // 调用方法
      const result = await contract[methodName](...params);
      
      // 格式化结果
      let formattedResult;
      if (typeof result === 'bigint') {
        formattedResult = {
          raw: result.toString(),
          decimal: result.toString(),
          hex: '0x' + result.toString(16)
        };
      } else if (Array.isArray(result)) {
        formattedResult = result.map((item) => {
          if (typeof item === 'bigint') {
            return item.toString();
          }
          return item;
        });
      } else {
        formattedResult = result;
      }
      
      return {
        success: true,
        contractAddress,
        network,
        method: methodName,
        params,
        result: formattedResult
      };
    } catch (error) {
      console.error('Error calling contract read method:', error);
      throw error;
    }
  },

  async callContractWriteMethod(
    contractAddress: string,
    methodName: string,
    params: any[] = [],
    value = '0',
    network = 'eth-mainnet'
  ) {
    if (!EVM_PRIVATE_KEY) {
      throw new Error('EVM_PRIVATE_KEY environment variable is not set');
    }

    try {
      // 创建 provider
      const rpcUrl = `https://${network}.g.alchemy.com/v2/${API_KEY}`;
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // 创建 wallet
      const wallet = new ethers.Wallet(EVM_PRIVATE_KEY, provider);
      
      // 获取合约 ABI
      const { abi } = await this.getContractAbi(contractAddress, network);
      
      // 创建合约实例（带 signer）
      const contract = new ethers.Contract(contractAddress, abi, wallet);
      
      // 检查方法是否存在
      if (typeof contract[methodName] !== 'function') {
        throw new Error(`Method '${methodName}' not found in contract`);
      }
      
      console.log(`Calling write method: ${methodName}(${params.join(', ')})`);
      
      // 准备交易选项
      const txOptions: any = {};
      if (value !== '0') {
        txOptions.value = ethers.parseEther(value);
      }
      
      // 获取 gas 价格
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      txOptions.gasPrice = gasPrice;
      
      // 估算 gas
      try {
        const estimatedGas = await contract[methodName].estimateGas(...params, txOptions);
        txOptions.gasLimit = estimatedGas * 120n / 100n; // 增加 20% 的缓冲
        console.log(`Estimated gas: ${estimatedGas.toString()}`);
      } catch (error) {
        console.error('Gas estimation failed, using default:', error);
        txOptions.gasLimit = 200000n; // 默认 gas limit
      }
      
      // 调用方法
      const txResponse = await contract[methodName](...params, txOptions);
      
      console.log('Transaction sent:', txResponse.hash);
      
      // 等待确认
      console.log('Waiting for confirmation...');
      const receipt = await txResponse.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt is null');
      }
      
      // 计算实际 gas 费用
      const actualGasFee = receipt.gasUsed * (receipt.gasPrice || gasPrice);
      const actualGasFeeEth = ethers.formatEther(actualGasFee);
      
      // 解析事件日志
      const logs = receipt.logs.map((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return {
            event: parsedLog?.name,
            args: parsedLog?.args.map((arg: any) => {
              if (typeof arg === 'bigint') {
                return arg.toString();
              }
              return arg;
            })
          };
        } catch {
          return null;
        }
      }).filter((log: any) => log !== null);
      
      return {
        success: true,
        transactionHash: txResponse.hash,
        from: wallet.address,
        contractAddress,
        network,
        method: methodName,
        params,
        value: value + ' ETH',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: ethers.formatUnits(receipt.gasPrice || gasPrice, 'gwei') + ' Gwei',
        gasFee: actualGasFeeEth + ' ETH',
        status: receipt.status === 1 ? 'Success' : 'Failed',
        events: logs,
        explorerUrl: network === 'eth-mainnet' 
          ? `https://etherscan.io/tx/${txResponse.hash}`
          : `https://${network}.etherscan.io/tx/${txResponse.hash}`
      };
    } catch (error) {
      console.error('Error calling contract write method:', error);
      throw error;
    }
  },

  // || ** CONTRACT QUERY API ** ||
  // 获取合约源代码（使用Etherscan）
  async getContractSource(contractAddress: string, network = 'eth-mainnet') {
    try {
      const client = createEtherscanClient(network);
      
      const response = await client.get('', {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address: contractAddress
        }
      });

      const data = response.data;
      
      if (data.status === '1' && data.result && data.result.length > 0) {
        const contractInfo = data.result[0];
        return {
          status: 'success',
          contractAddress,
          network,
          sourceCode: contractInfo.SourceCode,
          abi: contractInfo.ABI,
          contractName: contractInfo.ContractName,
          compilerVersion: contractInfo.CompilerVersion,
          optimizationUsed: contractInfo.OptimizationUsed,
          runs: contractInfo.Runs,
          constructorArguments: contractInfo.ConstructorArguments,
          evmVersion: contractInfo.EVMVersion,
          library: contractInfo.Library,
          licenseType: contractInfo.LicenseType,
          proxy: contractInfo.Proxy,
          implementation: contractInfo.Implementation,
          swarmSource: contractInfo.SwarmSource,
          message: 'Contract source code retrieved successfully'
        };
      } else {
        throw new Error(data.result || 'Failed to get contract source code');
      }
    } catch (error) {
      console.error('Error getting contract source code:', error);
      throw error;
    }
  },

  // 获取合约创建信息
  async getContractCreation(contractAddresses: string[], network = 'eth-mainnet') {
    try {
      const client = createEtherscanClient(network);
      
      const response = await client.get('', {
        params: {
          module: 'contract',
          action: 'getcontractcreation',
          contractaddresses: contractAddresses.join(',')
        }
      });

      const data = response.data;
      
      if (data.status === '1' && data.result) {
        return {
          status: 'success',
          network,
          contracts: data.result.map((contract: any) => ({
            contractAddress: contract.contractAddress,
            contractCreator: contract.contractCreator,
            txHash: contract.txHash,
            blockNumber: parseInt(contract.blockNumber),
            timestamp: new Date(parseInt(contract.timestamp) * 1000).toLocaleString('zh-CN'),
            contractFactory: contract.contractFactory
          })),
          message: 'Contract creation info retrieved successfully'
        };
      } else {
        throw new Error(data.result || 'Failed to get contract creation info');
      }
    } catch (error) {
      console.error('Error getting contract creation info:', error);
      throw error;
    }
  }
};


