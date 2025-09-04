import React, { useState, useEffect } from "react";
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
import { compareString, isEmpty } from "../../utils";
import { TradeSection } from "../../Components";
import { SwapButton } from "../../Components";
import BestRoute from "../../Components/BestRoute";
import RateImpactConfigV2 from "../../Components/RateImpactConfigv2";
import useTokenBalances from "../../hooks/use-token-balances";
import useQuote from "../../hooks/use-quote";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

const Home = () => {
  const [sellAmount, setSellAmount] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeSelectorType, setActiveSelectorType] = useState(null); // "sell" or "buy"
  const [isSlippageOpen, setIsSlippageOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  const { tokens, address, balanceData, refreshBalances } = useTokenBalances()
  const {
    sellCoin,
    setSellCoin,
    buyCoin,
    setBuyCoin,
    loadCoin,
    canSwap,
    handleGetQuote,
    loadingQuote,
    quoteData
  } = useQuote({ address, slippage, sellAmount })

  const { rate, platform, fee, price_impact, quoteId } = quoteData

  const handleSelectCoin = (type = "sell") => {
    setActiveSelectorType(type);
    setIsSelectorOpen(true);
  }

  const handleSwap = () => {
    setSellCoin(buyCoin);
    setBuyCoin(sellCoin);
    setSellAmount(""); // Reset sell amount when swapping coins
  };

  useEffect(() => {
    if (isEmpty(sellCoin?.address) || isEmpty(buyCoin?.address)) {
      loadCoin(tokens)
    }
  }, [tokens])

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
              console.log("Completed successfully")
              setSellAmount(0)
              refreshBalances()
            }}
          />
          <BestRoute
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
