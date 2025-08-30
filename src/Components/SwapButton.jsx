import React, { useState, memo, useMemo } from 'react';
import endpoint from '../Api/endpoint';
import ConnectButton from './ConnectButton';
import { useActiveAccount } from 'thirdweb/react';
import { cn, delay, isNativeCoin, compareString, isEmpty } from '../utils';
import useFetcher from '../hooks/use-fetcher';
import { toast } from 'sonner';
import { maxUint256, } from 'thirdweb/utils';
import { erc20Abi, parseUnits } from 'viem';
import { ethers } from "ethers"
import { chain } from '../thirdweb/clients';
import { mutate } from 'swr';

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
  const account = useActiveAccount()
  const [status, setStatus] = useState('idle');
  const { trigger: initiateSwap, isMutating: swapping } = useFetcher(endpoint.route)

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

  const complete = async ({ to, value, data }) => {
    await account.sendTransaction({
      to,
      value,
      data,
      chainId: chain.id
    });

    await mutate(`${endpoint.tokens}/${account?.address}`)
    toast.loading('Waiting for transaction confirmation...', { id: toastId });

    setStatus('success');
    toast.success('Swap completed successfully!', { id: toastId });
    // Reset status after a delay
    setTimeout(async () => {
      setStatus('idle')
      await mutate(`${endpoint.tokens}/${account?.address}`)
    }, 3000);
  }

  const handleInitiateSwap = async () => {
    if (disabled || swapping || status === 'pending') return;

    try {
      setStatus('pending');
      toast.loading('Preparing swap transaction...', { id: toastId });

      const result = await initiateSwap({
        sender: account?.address,
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
          await complete({ to, value, data })
          return;
        }


        const provider = new ethers.providers.JsonRpcProvider(chain.rpc);
        const contract = new ethers.Contract(sellCoin?.address, erc20Abi, provider);
        const allowanceResult = await contract.allowance(account?.address, to);

        const currentAllowance = ethers.BigNumber.from(allowanceResult);
        const requiredAmount = ethers.BigNumber.from(parseUnits(amount.toString(), sellCoin?.decimals));
        if (currentAllowance.lt(requiredAmount)) {
          const approvalData = contract.interface.encodeFunctionData("approve", [to, maxUint256]);

          toast.loading('Approving transaction...', { id: toastId });

          await account.sendTransaction({
            to: sellCoin?.address,
            value: 0,
            data: approvalData,
            chainId: chain.id
          });

          toast.loading('Transaction approved successfully...', { id: toastId });

          await delay(5); // delay for 5 seconds
        }

        await complete({ to, value, data });
        return;
      }
    } catch (error) {
      setStatus('failed');

      if (error.message?.includes('user rejected')) {
        toast.error('Transaction was cancelled by user', { id: toastId });
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for this transaction', { id: toastId });
      } else {
        toast.error('Swap failed. Please try again.', { id: toastId });
      }

      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      onSwapCompleted();
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
    // hasInsufficientBalance ||
    !hasValidQuote ||
    status === 'pending'

  if (!account) return <ConnectButton />
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