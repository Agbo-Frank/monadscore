import { useAccount, useBalance, useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { formatUnits } from 'ethers/lib/utils';
import { isNativeCoin } from '../utils';

/**
 * Hook to fetch balance for a specific token address
 * Uses RPC calls directly instead of relying on API token list
 */
export const useTokenBalance = (tokenAddress, options = {}) => {
  const { 
    enabled = true,
    refetchInterval = 30000 
  } = options;
  
  const { address: userAddress, isConnected } = useAccount();
  
  // Handle native token balance
  const { 
    data: nativeBalance, 
    isLoading: isNativeLoading,
    refetch: refetchNative
  } = useBalance({
    address: userAddress,
    query: {
      enabled: enabled && isConnected && isNativeCoin(tokenAddress),
      refetchInterval
    }
  });

  // Handle ERC20 token balance
  const { 
    data: erc20Balance, 
    isLoading: isErc20Loading,
    refetch: refetchErc20
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: enabled && isConnected && !isNativeCoin(tokenAddress) && !!userAddress && !!tokenAddress,
      refetchInterval
    }
  });

  // Get token decimals for ERC20 tokens
  const { 
    data: decimals 
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: enabled && !isNativeCoin(tokenAddress) && !!tokenAddress,
      staleTime: 1000 * 60 * 60 * 24, // 24 hours - decimals don't change
    }
  });

  // Calculate formatted balance
  const balance = (() => {
    if (!isConnected || !tokenAddress) return 0;

    if (isNativeCoin(tokenAddress)) {
      if (nativeBalance?.value) {
        const formatted = formatUnits(nativeBalance.value, nativeBalance.decimals);
        return Number(formatted);
      }
      return 0;
    } else {
      if (erc20Balance && decimals) {
        const formatted = formatUnits(erc20Balance, decimals);
        return Number(formatted);
      }
      return 0;
    }
  })();

  // Refetch function
  const refetch = async () => {
    if (isNativeCoin(tokenAddress)) {
      return await refetchNative();
    } else {
      return await refetchErc20();
    }
  };

  return {
    balance,
    isLoading: isNativeCoin(tokenAddress) ? isNativeLoading : isErc20Loading,
    isConnected,
    refetch,
    decimals: isNativeCoin(tokenAddress) ? nativeBalance?.decimals : decimals,
    rawBalance: isNativeCoin(tokenAddress) ? nativeBalance?.value : erc20Balance
  };
};

export default useTokenBalance;
