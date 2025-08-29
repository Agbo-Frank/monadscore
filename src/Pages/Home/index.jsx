import React, { useState, useEffect, useCallback, useMemo } from "react";
import { herobg } from "../../Assets";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import CoinCard from "../../Components/CoinCard";
import CoinSelector from "../../Components/CoinSelector";
import SlippageModal from "../../Components/SlippageModal";
import { compareString, isEmpty, parseNumber, isNativeCoin } from "../../utils";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import useSWR from "swr";
import endpoint from "../../Api/endpoint";
import { TradeSection } from "../../Components";
import useFetcher from "../../hooks/use-fetcher";
import { SwapButton } from "../../Components";
import RateImpactConfig from "../../Components/RateImpactConfig";
import { monadTestnet } from "thirdweb/chains";
import client from "../../thirdweb/clients";
import BestRoute from "../../Components/BestRoute";
import RateImpactConfigV2 from "../../Components/RateImpactConfigv2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

const Home = () => {
  const account = useActiveAccount()
  const [sellCoin, setSellCoin] = useState(null);
  const [buyCoin, setBuyCoin] = useState(null);
  const [sellAmount, setSellAmount] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeSelectorType, setActiveSelectorType] = useState(null); // "sell" or "buy"
  const [isSlippageOpen, setIsSlippageOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [debouncedSellAmount, setDebouncedSellAmount] = useState(0);

  const { data } = useWalletBalance({
    client,
    chain: monadTestnet,
    address: account?.address
  })

  const { data: tokenData } = useSWR(
    account?.address ?
      `${endpoint.tokens}/${account?.address}` :
      endpoint.tokens,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

  const { trigger: getQuote, data: quoteData, isMutating: loadingQuote } = useFetcher(endpoint.quote)

  const tokens = useMemo(() => {
    if (!tokenData?.data || !data?.displayValue) return tokenData?.data || [];

    return tokenData?.data?.map(token => {
      if (isNativeCoin(token.address)) {
        return {
          ...token,
          balance: Number(data.displayValue),
          balance_usd: (Number(data.displayValue) * (token.price || 0)).toFixed(2)
        };
      }
      return token;
    });
  }, [tokenData?.data, data?.displayValue]);

  const balanceData = useMemo(() => {
    return tokens?.filter(t => t.balance > 0)
  }, [tokens])

  const { rate, platform, fee, price_impact, quoteId, input_amount } = useMemo(() => {
    if (isEmpty(quoteData?.data)) {
      return {
        rate: 0,
        fee: 0,
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
  const buyAmount = useMemo(() => (sellAmount || 0) * (rate || 0), [rate, sellAmount])

  // Validation for swap
  const canSwap = useMemo(() => {
    const enteredAmount = parseFloat(sellAmount);
    const returnedAmount = parseFloat(input_amount);

    return (
      account?.address &&
      sellCoin?.address &&
      buyCoin?.address &&
      enteredAmount > 0 &&
      enteredAmount === returnedAmount &&
      quoteId
    );
  }, [account?.address, sellCoin?.address, buyCoin?.address, sellAmount, quoteId]);

  const handleSelectCoin = (type = "sell") => {
    setActiveSelectorType(type);
    setIsSelectorOpen(true);
  }

  const handleGetQuote = useCallback(async () => {
    const amount = parseNumber(debouncedSellAmount);
    if (
      isEmpty(sellCoin?.address) ||
      isEmpty(buyCoin?.address)
    ) return;

    await getQuote({
      amount: amount ? amount : 1,
      from: sellCoin.address,
      slippage,
      to: buyCoin.address
    });
  }, [debouncedSellAmount, slippage, sellCoin?.address, buyCoin?.address, getQuote]);

  useEffect(() => {
    if (sellCoin && buyCoin) {
      const timeoutId = setTimeout(() => {
        handleGetQuote();
      }, 1000); // 1 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [debouncedSellAmount, slippage, buyCoin?.address, sellCoin?.address]);

  const handleSwap = () => {
    setSellCoin(buyCoin);
    setBuyCoin(sellCoin);
    setSellAmount(buyAmount);
  };

  const loadCoin = useCallback(() => {
    if (isEmpty(tokens)) return;

    if (isEmpty(buyCoin)) {
      const defaultBuyCoin = tokens.find(t => compareString(t.code, "usdc"))
      setBuyCoin(defaultBuyCoin)
    }

    if (isEmpty(sellCoin)) {
      const defaultSellCoin = tokens.find(t => compareString(t.code, "mon"))
      setSellCoin(defaultSellCoin)
    }
  }, [tokens])

  useEffect(() => {
    loadCoin()
  }, [loadCoin])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSellAmount(sellAmount);
    }, 500);

    return () => clearTimeout(timer);
  }, [sellAmount]);

  return (
    <div className="w-full h-full">
      {/* Hero Section */}
      <section className="w-full relative py-20 sm:py-32 min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Image Background */}
        <img
          src={herobg}
          alt="Hero background"
          className="absolute top-0 left-0 w-full h-full object-cover z-10"
        />

        {/* Dex Content */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl max-w-full sm:max-w-xl md:max-w-2xl w-full mx-auto">
          <TradeSection
            type="sell"
            amount={sellAmount}
            onAmountChange={setSellAmount}
            onSelect={() => handleSelectCoin()}
            balance={balanceData || []}
            coin={sellCoin}
          />

          {/* Swap Button */}
          <div className="flex justify-center -mt-8 -mb-3">
            <button
              onClick={handleSwap}
              className="bg-[#F3F3F3] px-[24px] py-[8px] ring ring-[#D9D9D9] rounded transition-transform hover:rotate-180"
              aria-label="Swap coins"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                stroke="#181818"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="17 1 21 5 17 9" />
                <line x1="21" y1="5" x2="3" y2="5" />
                <polyline points="7 23 3 19 7 15" />
                <line x1="3" y1="19" x2="21" y2="19" />
              </svg>
            </button>
          </div>

          <TradeSection
            type="buy"
            amount={(sellAmount || 0) * (rate || 0)}
            onAmountChange={() => { }}
            onSelect={() => handleSelectCoin("buy")}
            coin={buyCoin}
            balance={balanceData || []}
          >
            <RateImpactConfigV2
              {
              ...{
                sellCoin,
                buyCoin,
                rate,
                isLoading: loadingQuote,
                onRefreshRate: handleGetQuote,
                tiggerSlippageConfig: () => setIsSlippageOpen(true)
              }
              }
            />
          </TradeSection>

          {/* RAte & Impact */}
          <SwapButton
            sellCoin={sellCoin}
            buyCoin={buyCoin}
            amount={Number(sellAmount)}
            quoteId={quoteId}
            disabled={!canSwap}
            balanceData={balanceData || []}
            hasValidQuote={rate !== null}
            onSwapCompleted={() => {
              setSellAmount(0)
            }}
          />
          <BestRoute
            // rate={rate}
            // sellCoin={sellCoin}
            // buyCoin={buyCoin}
            impact={price_impact}
            networkFee={fee}
            maxSlippage={slippage} // added
            dexName={platform}
          />

          {/* Coin cards */}
          <div className="pt-6 md:pt-0 md:mt-6 grid md:grid-cols-2 gap-2.5 max-w-full sm:max-w-2xl mx-auto">
            <CoinCard coin={sellCoin} />
            <CoinCard coin={buyCoin} />
          </div>
        </div>

        <CoinSelector
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          tokens={tokens}
          onSelectCoin={(coin) => {
            if (
              activeSelectorType === "sell" &&
              !compareString(coin?.address, buyCoin.address)
            ) {
              setSellCoin(coin);
            }
            if (
              activeSelectorType === "buy" &&
              !compareString(coin?.address, sellCoin.address)
            ) {
              setBuyCoin(coin);
            }
          }}
        />
        <SlippageModal
          isOpen={isSlippageOpen}
          onClose={() => setIsSlippageOpen(false)}
          currentSlippage={slippage}
          onSelectSlippage={setSlippage}
        />
      </section>
    </div>
  );
};

export default Home;
