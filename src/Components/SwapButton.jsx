import React, { useState, memo, useMemo } from 'react';
import endpoint from '../Api/endpoint';
import { cn, delay, isNativeCoin, compareString, isEmpty } from '../utils';
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

const SwapButton = memo(function SwapButton({
  sellCoin,
  buyCoin,  // Add buyCoin prop
  amount,
  quoteId,
  onSwapCompleted,
  disabled = false,
  balanceData = [],
  hasValidQuote = true  // Add prop to check if quote is valid
}) {
  const toastId = "swap"
  const [status, setStatus] = useState('idle');
  const { trigger: initiateSwap, isMutating: swapping } = useFetcher(endpoint.route)
  const { setOpen } = useModal()
  const { address, isConnecting, isDisconnected } = useAccount();
  const signer = useEthersSigner()

  // Check for insufficient balance or invalid amount
  const hasInsufficientBalance = useMemo(() => {
    if (!sellCoin?.address || !balanceData) return false;

    // Return false if amount is 0, empty, or invalid (we'll handle this separately)
    if (!amount || parseFloat(amount) <= 0) return false;

    const balance = balanceData.find(b => compareString(b.address, sellCoin.address));
    if (!balance || !balance.balance || parseFloat(balance.balance) <= 0) return true;
    return parseFloat(amount) > parseFloat(balance.balance);
  }, [amount, sellCoin?.address, balanceData]);

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
    onSwapCompleted()

    setTimeout(async () => setStatus('idle'), 3000);
  }

  const handleInitiateSwap = async () => {
    if (disabled || swapping || status === 'pending') return;

    try {
      setStatus('pending');
      toast.loading('Preparing swap transaction...', { id: toastId });

      if (!signer) {
        throw new Error('Wallet connection issue detected. If you\'re already connected, try refreshing the page.');
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
    } else if (!hasValidQuote) {
      return `No swap path found for ${sellCoin?.code} <> ${buyCoin?.code}`;
    } else if (hasEmptyAmount) {
      return "Enter an amount";
    } else if (hasInsufficientBalance) {
      return `Insufficient ${sellCoin?.code || "Balance"}`;
    } else {
      return "Swap";
    }
  };

  const isDisabled = disabled ||
    hasEmptyAmount ||
    hasInsufficientBalance ||
    !hasValidQuote ||
    status === 'pending'

  if (!address || isDisconnected) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-[60px] w-full rounded-[15px] bg-[#F675FF] border border-[#300034] text-[#300034] mt-4 max-w-full mx-auto"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
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