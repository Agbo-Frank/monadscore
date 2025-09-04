import { useState, useEffect, useCallback, useMemo } from "react";
import { compareString, isEmpty, parseNumber, ZERO_ADDRESS } from "../utils";
import useFetcher from "./use-fetcher";
import endpoint from "../Api/endpoint";

export default function useQuote({ address, slippage, sellAmount }) {
  const [sellCoin, setSellCoin] = useState(null);
  const [buyCoin, setBuyCoin] = useState(null);
  const [debouncedSellAmount, setDebouncedSellAmount] = useState(0);

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
  }, [quoteData?.data, sellCoin?.address, buyCoin?.address, slippage, address])

  const canSwap = useMemo(() => {
    const enteredAmount = parseFloat(sellAmount);
    const returnedAmount = parseFloat(input_amount);

    // Check if we have a valid quote that matches current coin selection
    const hasValidQuote = quoteData?.data &&
      compareString(quoteData?.data?.from, sellCoin?.address) &&
      compareString(quoteData?.data?.to, buyCoin?.address) &&
      enteredAmount === returnedAmount &&
      slippage === returnedSlippage

    return (
      address &&
      sellCoin?.address &&
      buyCoin?.address &&
      enteredAmount > 0 &&
      price_impact < 0.1 &&
      quoteId &&
      hasValidQuote
    );
  }, [
    address,
    price_impact,
    sellCoin?.address,
    buyCoin?.address,
    sellAmount,
    quoteId,
    quoteData?.data,
    slippage,
    returnedSlippage
  ]);

  const loadCoin = useCallback((tokens) => {
    if (isEmpty(tokens)) return;

    if (isEmpty(buyCoin?.address)) {
      const defaultBuyCoin = tokens.find(t => compareString(t.code, "usdc"))
      setBuyCoin(defaultBuyCoin)
    }

    if (isEmpty(sellCoin?.address)) {
      const defaultSellCoin = tokens.find(t => compareString(t.code, "mon"))
      setSellCoin(defaultSellCoin)
    }
  }, [buyCoin?.address, sellCoin?.address])

  const handleGetQuote = useCallback(async () => {
    const amount = parseNumber(debouncedSellAmount);
    if (
      isEmpty(sellCoin?.address) ||
      isEmpty(buyCoin?.address)
    ) return;

    await getQuote({
      amount: amount ? amount : 1,
      from: sellCoin.address,
      sender: address || ZERO_ADDRESS,
      slippage,
      to: buyCoin.address
    });
  }, [debouncedSellAmount, slippage, sellCoin?.address, buyCoin?.address, getQuote]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSellAmount(sellAmount);
    }, 500);

    return () => clearTimeout(timer);
  }, [sellAmount]);

  useEffect(() => {
    if (sellCoin && buyCoin) {
      const timeoutId = setTimeout(() => {
        handleGetQuote();
      }, 1000); // 1 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [debouncedSellAmount, slippage, buyCoin?.address, sellCoin?.address]);

  const quoteResult = { rate, platform, fee, price_impact, quoteId, input_amount }

  return {
    sellCoin,
    setSellCoin,
    buyCoin,
    setBuyCoin,
    handleGetQuote,
    loadCoin,
    canSwap,
    loadingQuote,
    quoteData: quoteResult
  }
}