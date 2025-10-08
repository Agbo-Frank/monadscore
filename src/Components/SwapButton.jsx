import React, { useState, memo, useMemo } from 'react';
import endpoint from '../Api/endpoint';
import { cn, delay, isNativeCoin, compareString, isEmpty, isAmountGreater } from '../utils';
import useFetcher from '../hooks/use-fetcher';
import { toast } from 'sonner';
import { erc20Abi, maxUint256, parseUnits } from 'viem';
import { ethers } from "ethers"
import { constructApproveTransaction } from '../utils/helpers/approve';
import { useAccount } from "wagmi";
import { useModal } from "connectkit";
import buildTransactionRequest from '../utils/helpers/txConfig';
import useEthersSigner from '../hooks/use-ethers-signer';
import { extractErrorMessage } from '../utils/helpers';
import useTokenBalance from '../hooks/use-token-balance';

const SwapButton = memo(function SwapButton({
  sellCoin,
  buyCoin,  // Add buyCoin prop
  amount,
  quoteId,
  onSwapCompleted,
  disabled = false,
  balanceData = [],
  hasValidQuote = true,  // Add prop to check if quote is valid
  isLoadingQuote = false  // Add prop to check if quote is loading
}) {
  const toastId = "swap"
  const [status, setStatus] = useState('idle');
  const { trigger: initiateSwap, isMutating: swapping } = useFetcher(endpoint.route)
  const { setOpen } = useModal()
  const { address, isConnected, isConnecting, isDisconnected, isReconnecting } = useAccount();
  const signer = useEthersSigner()

  // Get RPC balance for the sell token
  const { 
    balance: rpcSellBalance, 
    decimals: rpcDecimals
  } = useTokenBalance(sellCoin?.address, {
    enabled: !!sellCoin?.address,
    refetchInterval: 30000
  });

  // Check for insufficient balance or invalid amount
  const hasInsufficientBalance = useMemo(() => {
    if (!sellCoin?.address) return false;

    // Return false if amount is 0, empty, or invalid (we'll handle this separately)
    if (!amount || parseFloat(amount) <= 0) return false;

    // Prioritize RPC balance over API balance data
    let currentBalance = 0;
    let effectiveDecimals = 18;
    
    // Always prefer RPC balance when available
    if (rpcSellBalance !== undefined && rpcSellBalance !== null) {
      currentBalance = rpcSellBalance;
      effectiveDecimals = rpcDecimals || sellCoin?.decimals || 18;
    } else if (balanceData) {
      // Fallback to API balance only if RPC is not available
      const apiBalance = balanceData.find(b => compareString(b.address, sellCoin.address));
      currentBalance = apiBalance?.balance || 0;
      effectiveDecimals = sellCoin?.decimals || 18;
    }

    if (currentBalance <= 0) return true;

    // Use utility function for precision-aware amount comparison with effective decimals
    const result = isAmountGreater(amount, currentBalance, effectiveDecimals);
    
    // Debug logging for balance comparison issues (can be removed in production)
    if (result && process.env.NODE_ENV === 'development') {
      console.log('Insufficient balance detected:', {
        amount: amount,
        currentBalance: currentBalance,
        effectiveDecimals: effectiveDecimals,
        sellCoin: sellCoin?.code,
        isRpcBalance: rpcSellBalance !== undefined && rpcSellBalance !== null
      });
    }
    
    return result;
  }, [amount, sellCoin?.address, sellCoin?.code, sellCoin?.decimals, balanceData, rpcSellBalance, rpcDecimals]);

  // Check if amount is empty or zero
  const hasEmptyAmount = useMemo(() => {
    return !amount || parseFloat(amount) <= 0;
  }, [amount]);

  const complete = async ({ to, value, data, txOptions }) => {
    value = ethers.BigNumber.from(value.toString())

    const tx = await buildTransactionRequest({
      to,
      value,
      signer,
      data,
      txOptions
    })

    const transaction = await signer.sendTransaction(tx)

    toast.loading('Waiting for transaction confirmation...', { id: toastId });

    await transaction.wait(1);

    setStatus('success');
    toast.success('Swap completed successfully!', { id: toastId });
    
    // Wait a moment for blockchain state to propagate before refreshing balances
    setTimeout(() => {
      onSwapCompleted();
    }, 1000);

    setTimeout(async () => setStatus('idle'), 3000);
  }

  const handleInitiateSwap = async () => {
    if (disabled || swapping || status === 'pending') return;

    try {
      setStatus('pending');
      toast.loading('Preparing swap transaction...', { id: toastId });

      if (!signer || !isConnected || !address) {
        throw new Error('Wallet not properly connected. Please connect your wallet and try again.');
      }

      const result = await initiateSwap({
        sender: address,
        quote_id: quoteId,
      });

      if (result?.data) {
        const { value, to, data } = result.data;

        // Add validation for transaction parameters
        if (isEmpty(to) || isEmpty(data)) {
          throw new Error('Invalid transaction parameters received');
        }

        toast.loading('Sending transaction to wallet...', { id: toastId });

        if (isNativeCoin(sellCoin?.address)) {
          await complete({
            to,
            value,
            data,
            txOptions: { gasLimit: 310000 }
          })
          return;
        }

        const tokenContract = new ethers.Contract(sellCoin?.address, erc20Abi, signer);

        const allowance = await tokenContract.allowance(address, to);
        const requiredAmount = ethers.BigNumber.from(parseUnits(amount.toString(), sellCoin?.decimals));

        if (allowance.lt(requiredAmount)) {
          toast.loading('Approving transaction...', { id: toastId });

          const tx = await constructApproveTransaction(
            signer,
            sellCoin?.address,
            to,
            maxUint256,
          );

          const transaction = await signer.sendTransaction(tx);
          await transaction.wait(1);

          toast.loading('Transaction approved successfully...', { id: toastId });

          await delay(5); // delay for 5 seconds
        }

        await complete({
          to,
          value,
          data,
          txOptions: { gasLimit: 400000 }
        })
        return;
      }
    } catch (error) {
      const errorObj = extractErrorMessage(error)

      setStatus('failed');

      if (errorObj.message === "transaction failed") {
        toast.error(
          "Transaction failed. This could be due to low slippage tolerance, insufficient gas, or price movement. Try adjusting your slippage settings.",
          { id: toastId }
        );
      } else {
        toast.error(
          errorObj?.message ||
          error?.message ||
          'Swap failed. Please try again.'
          ,
          { id: toastId }
        );
      }

      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const getButtonContent = () => {
    if (status === 'pending') {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-[#300034] border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      );
    } else if (status === 'success') {
      return (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Success!</span>
        </div>
      );
    } else if (status === 'failed') {
      return (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Failed</span>
        </div>
      );
    } else if (isLoadingQuote && !hasEmptyAmount) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-[#300034] border-t-transparent rounded-full animate-spin"></div>
          <span>Fetching quote</span>
        </div>
      );
    } else if (!hasValidQuote && !hasEmptyAmount && !isLoadingQuote) {
      return `No swap path found for ${sellCoin?.code} <> ${buyCoin?.code}`;
    } else if (hasEmptyAmount) {
      return "Enter an amount";
    } else if (hasInsufficientBalance) {
      return `Insufficient ${sellCoin?.code || "Balance"}`;
    } else if (compareString(sellCoin?.code, "mon") && compareString(buyCoin?.code, "wmon")) {
      return "Wrap"
    } else if (compareString(sellCoin?.code, "wmon") && compareString(buyCoin?.code, "mon")) {
      return "Unwrap"
    } else {
      return "Swap";
    }
  };

  const isDisabled = disabled ||
    hasEmptyAmount ||
    hasInsufficientBalance ||
    (!hasValidQuote && !isLoadingQuote) ||
    isLoadingQuote ||
    status === 'pending'

  if (!address || isDisconnected || !isConnected) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-[60px] w-full rounded-[15px] bg-[#F675FF] border border-[#300034] text-[#300034] mt-4 max-w-full mx-auto"
      >
        {(isConnecting || isReconnecting) ? "Connecting..." : "Connect Wallet"}
      </button>
    )
  }
  return (
    <button
      onClick={handleInitiateSwap}
      disabled={isDisabled}
      className={cn(
        "h-[60px] w-full rounded-[15px] border border-[#300034] text-[#300034] mt-4 max-w-full mx-auto transition-all duration-200",
        {
          "bg-green-500 hover:bg-green-600 cursor-pointer shadow-lg": status === "success",
          "bg-red-500 hover:bg-red-600 cursor-pointer shadow-lg": status === "failed",
          "bg-gray-400 cursor-not-allowed opacity-75": status === "pending",
          "bg-gray-300 cursor-not-allowed opacity-60": isDisabled,
          "bg-[#F675FF] hover:bg-[#E55AFF] cursor-pointer shadow-md hover:shadow-lg": !isDisabled && status === "idle"
        }
      )}
    >
      {getButtonContent()}
    </button>
  );
});

export default SwapButton; 