import { useCallback, useMemo } from 'react';
import { useAccount, useBalance, useReadContracts } from 'wagmi';
import useSWR, { mutate } from 'swr';
import endpoint from '../Api/endpoint';
import { isNativeCoin } from '../utils';
import { formatUnits } from 'ethers/lib/utils';
import { erc20Abi } from 'viem';

export const useTokenBalances = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000
  } = options;

  const { address, isConnected } = useAccount();

  // Get native token balance using wagmi
  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
    address,
  });

  // Get token list with balances
  const { data: tokenData, error, isLoading } = useSWR(
    address ? `${endpoint.tokens}/${address}` : endpoint.tokens,
    {
      refreshInterval: autoRefresh ? refreshInterval : 0,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
    }
  );

  const erc20Tokens = (tokenData?.data || []).filter(token => !isNativeCoin(token.address));

  // Create contracts array for useReadContracts
  const contracts = useMemo(() => {
    if (!address || erc20Tokens.length === 0) return [];

    return erc20Tokens.flatMap(token => [
      {
        address: token.address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        address: token.address,
        abi: erc20Abi,
        functionName: 'decimals',
      }
    ]);
  }, [erc20Tokens, address]);

  // Read all ERC20 balances and decimals using useReadContracts
  const {
    data: contractResults,
    refetch: refetchContracts
  } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0 && !!address,
      refetchInterval: refreshInterval
    }
  });

  // Manual refresh function with better error handling
  const refreshBalances = useCallback(async () => {
    if (!address) return false;

    try {
      // Refresh native balance and contract balances in parallel
      await Promise.all([
        mutate(`${endpoint.tokens}/${address}`),
        refetchNativeBalance(),
        refetchContracts()
      ]);

      return true;
    } catch (error) {
      return false;
    }
  }, [address, refetchNativeBalance, refetchContracts]);

  // Create a map for faster token lookup
  const tokenAddressMap = new Map();
  erc20Tokens.forEach((token, index) => {
    tokenAddressMap.set(token.address.toLowerCase(), index);
  });

  // Process tokens with native balance and contract balances included
  const tokens = useMemo(() => {
    if (!tokenData?.data) return [];

    return tokenData.data.map(token => {
      if (isNativeCoin(token.address)) {
        // Handle native token balance
        if (nativeBalance?.value) {
          const displayBalance = formatUnits(nativeBalance.value, nativeBalance.decimals);
          const balance = Number(displayBalance);
          const balance_usd = Number((balance * (token.price || 0)));

          return {
            ...token,
            balance,
            decimals: nativeBalance.decimals,
            balance_usd
          };
        }
        return token;
      } else {
        // Handle ERC20 token balances with improved lookup
        const tokenIndex = tokenAddressMap.get(token.address.toLowerCase());

        if (tokenIndex !== undefined && contractResults) {
          const balanceIndex = tokenIndex * 2;
          const decimalsIndex = balanceIndex + 1;

          const balanceResult = contractResults[balanceIndex];
          const decimalsResult = contractResults[decimalsIndex];

          if (balanceResult?.result && decimalsResult?.result) {
            const balance = balanceResult.result;
            const decimals = decimalsResult.result;

            const displayBalance = formatUnits(balance, decimals);
            const balanceNum = Number(displayBalance);
            const balance_usd = Number(balanceNum * (token.price || 0));

            return {
              ...token,
              balance: balanceNum,
              balance_usd
            };
          }
        }
        return token;
      }
    });
  }, [
    tokenData?.data,
    nativeBalance?.value,
    contractResults,
    tokenAddressMap,
  ]);

  const balanceData = tokens.filter(t => t.balance > 0);

  return {
    // Data
    tokens,
    balanceData,
    nativeBalance,
    isLoading: isLoading || (contracts.length > 0 && !contractResults),
    error,

    // State
    isConnected,
    address,

    // Functions
    refreshBalances
  };
};

export default useTokenBalances;
