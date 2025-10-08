import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { compareString, isEmpty, parseNumber, ZERO_ADDRESS, storage } from "../utils";
import useFetcher from "./use-fetcher";
import endpoint from "../Api/endpoint";

export default function useQuote({ address, slippage, sellAmount }) {
  const [sellCoin, setSellCoin] = useState(null);
  const [buyCoin, setBuyCoin] = useState(null);
  const [debouncedSellAmount, setDebouncedSellAmount] = useState(0);
  const lastQuoteParamsRef = useRef(null);

  // Wrapper functions that persist coin changes
  const setSellCoinWithPersistence = useCallback((coin) => {
    setSellCoin(coin);
    storage.setSellCoin(coin);
  }, []);

  const setBuyCoinWithPersistence = useCallback((coin) => {
    setBuyCoin(coin);
    storage.setBuyCoin(coin);
  }, []);

  const { trigger: getQuote, data: quoteData, isMutating: loadingQuote } = useFetcher(endpoint.quote)

  const { rate, platform, fee, price_impact, quoteId, slippage: returnedSlippage, input_amount } = useMemo(() => {
    if (isEmpty(quoteData?.data)) {
      return {
        rate: 0,
        fee: 0,
        slippage: 0,
        platform: null,
        price_impact: 0,
        quoteId: null,
        input_amount: 0
      }
    }
    const { output_amount, input_amount } = quoteData?.data
    return {
      ...quoteData?.data,
      rate: output_amount ? Number(output_amount) / Number(input_amount) : null
    }
  }, [quoteData?.data])

  const canSwap = useMemo(() => {
    const enteredAmount = parseFloat(sellAmount);

    const hasValidQuote = quoteData?.data &&
      compareString(quoteData?.data?.from, sellCoin?.address) &&
      compareString(quoteData?.data?.to, buyCoin?.address)

    return (
      address &&
      sellCoin?.address &&
      buyCoin?.address &&
      enteredAmount > 0 &&
      quoteId &&
      hasValidQuote
    );
  }, [
    address,
    sellCoin?.address,
    buyCoin?.address,
    sellAmount,
    input_amount,
    quoteId,
    quoteData?.data,
    slippage,
    returnedSlippage
  ]);

  console.log(canSwap)

  const loadCoin = useCallback((tokens) => {
    if (isEmpty(tokens)) return;

    // Helper function to find token by address
    const findTokenByAddress = (address) => {
      if (!address) return null;
      return tokens.find(token => compareString(token.address, address));
    };

    // Try to restore from storage first
    const savedSellCoin = storage.getSellCoin();
    const savedBuyCoin = storage.getBuyCoin();

    // Restore sell coin
    if (isEmpty(sellCoin?.address)) {
      let coinToSet = null;
      
      // Try to restore from storage
      if (savedSellCoin?.address) {
        coinToSet = findTokenByAddress(savedSellCoin.address);
      }
      
      // Fallback to default if not found
      if (!coinToSet) {
        coinToSet = tokens.find(t => compareString(t.code, "mon"));
      }
      
      if (coinToSet) {
        setSellCoin(coinToSet);
        // Update storage with the fresh token data
        storage.setSellCoin(coinToSet);
      }
    }

    // Restore buy coin
    if (isEmpty(buyCoin?.address)) {
      let coinToSet = null;
      
      // Try to restore from storage
      if (savedBuyCoin?.address) {
        coinToSet = findTokenByAddress(savedBuyCoin.address);
      }
      
      // Fallback to default if not found
      if (!coinToSet) {
        coinToSet = tokens.find(t => compareString(t.code, "usdc"));
      }
      
      if (coinToSet) {
        setBuyCoin(coinToSet);
        // Update storage with the fresh token data
        storage.setBuyCoin(coinToSet);
      }
    }
  }, [buyCoin?.address, sellCoin?.address])

  const handleGetQuote = useCallback(async (refetch = false) => {
    const amount = parseNumber(debouncedSellAmount);
    if (
      isEmpty(sellCoin?.address) ||
      isEmpty(buyCoin?.address) ||
      amount <= 0
    ) return;

    const currentParams = {
      amount,
      from: sellCoin.address,
      to: buyCoin.address,
      sender: address || ZERO_ADDRESS,
      slippage
    };

    // Check if parameters have changed to avoid duplicate requests
    if (!refetch) {
      const lastParams = lastQuoteParamsRef.current;

      if (lastParams && 
        lastParams.amount === currentParams.amount &&
        lastParams.from === currentParams.from &&
        lastParams.to === currentParams.to &&
        lastParams.sender === currentParams.sender &&
        lastParams.slippage === currentParams.slippage) {
        return; // Skip if parameters haven't changed
      }
    }

    lastQuoteParamsRef.current = currentParams;

    await getQuote(currentParams);
  }, [debouncedSellAmount, slippage, sellCoin?.address, buyCoin?.address, address, getQuote]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSellAmount(sellAmount);
    }, 500);

    return () => clearTimeout(timer);
  }, [sellAmount]);

  useEffect(() => {
    if (sellCoin && buyCoin && parseNumber(debouncedSellAmount) > 0) {
      const timeoutId = setTimeout(() => {
        handleGetQuote();
      }, 1000); // 1 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [sellCoin, buyCoin, debouncedSellAmount, handleGetQuote]);

  // Separate effect for slippage changes - refetch immediately when slippage changes
  useEffect(() => {
    if (sellCoin && buyCoin && parseNumber(debouncedSellAmount) > 0) {
      handleGetQuote();
    }
  }, [slippage]);

  const quoteResult = { rate, platform, fee, price_impact, quoteId, input_amount }

  return {
    sellCoin,
    setSellCoin: setSellCoinWithPersistence,
    buyCoin,
    setBuyCoin: setBuyCoinWithPersistence,
    handleGetQuote,
    loadCoin,
    canSwap,
    loadingQuote,
    quoteData: quoteResult
  }
}