import React, { useMemo, useState } from "react";
import { FaExchangeAlt, FaEye, FaEyeSlash, FaWallet, FaChevronDown } from "react-icons/fa";
import networthImg from "../Assets/networth.png";
import useSWR from "swr";
import { useActiveAccount } from "thirdweb/react";
import endpoint from "../Api/endpoint";
import { formatCurrency, isEmpty } from "../utils";
import { useNavigate } from "react-router-dom";

const Portfolio = () => {
  const navigate = useNavigate()
  const account = useActiveAccount()

  const { data: tokenListData } = useSWR(
    account?.address ?
      `${endpoint.tokens}/${account?.address}` :
      endpoint.tokens
  )

  const portfolio = useMemo(() => {
    if (isEmpty(account?.address)) return [];

    return tokenListData?.data?.filter(token => token.balance > 0)
  }, [account?.address, tokenListData?.data])

  const netWorth = useMemo(() => {
    if (isEmpty(portfolio)) return 0;

    return portfolio.reduce((acc, b) => acc + b.balance_usd, 0)
  }, [portfolio, tokenListData?.data]);

  const [showNetWorth, setShowNetWorth] = useState(true);
  const [selectedTab, setSelectedTab] = useState("Yield Estimate");
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const [walletOpen, setWalletOpen] = useState(true);
  const periods = ["24h", "1M", "1Y"];

  const tabs = ["Yield Estimate", "Breakdown"];
  const breakdownItems = [
    { title: "Tokens", value: "$0.00" },
    { title: "Save", value: "$0.00" },
    { title: "Mon", value: "$0.00" },
    { title: "View All", value: "0 Platform" },
  ];

  const yieldData = { amount: "$0.00", percentage: "0.0%" };
  return (
    <div className="min-h-screen p-6 py-32 lg:py-48 max-w-6xl mx-auto gap-6 ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1 */}
        <div className="bg-[rgba(255,255,255,0.25)] backdrop-blur-md rounded-xl p-6 flex flex-col space-y-4 relative">
          <div>
            <div className="text-sm text-white">Networth</div>
            <div className="flex items-center">
              <div className="text-4xl font-semibold text-white tracking-[0.1em] pr-4">
                {showNetWorth ? formatCurrency(netWorth) : "****.**"}
              </div>
              <button
                onClick={() => setShowNetWorth(!showNetWorth)}
                className="text-white text-xs focus:outline-none border p-1 rounded-full"
                aria-label={showNetWorth ? "Hide net worth" : "Show net worth"}
              >
                {showNetWorth ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <button
              className="mt-24 bg-[#E300F3] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 w-fit hover:bg-[#c200d0] transition-colors"
              type="button"
              onClick={() => navigate("/")}
            >
              <FaExchangeAlt />
              Swap
            </button>
          </div>
          <img
            src={networthImg}
            alt="Networth"
            className="absolute bottom-0 right-0 w-32  lg:w-48 opacity-70"
          />
        </div>

        {/* Section 2 */}
        <div className="border border-white rounded-xl p-4 sm:p-6 bg-transparent max-w-full">
          {/* Tabs and Periods */}
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex sm:flex-row flex-col sm:space-x-6 space-y-2 sm:space-y-0">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`text-gray-400 text-sm pb-2 ${selectedTab === tab
                    ? "text-white px-4 py-2 border-white border bg-[#210023] rounded-full"
                    : "border-transparent"
                    } focus:outline-none`}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex sm:flex-row flex-col sm:space-x-6 space-y-2 sm:space-y-0">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`text-gray-500 focus:outline-none ${selectedPeriod === period ? "bg-[#FAB0FF] text-[#E300F3] p-1 rounded" : ""
                    }`}
                  type="button"
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown line */}
          <div className="flex items-center space-x-2 mb-2 text-gray-400 text-xs">
            <span>Breakdown</span>
            <FaExchangeAlt />
          </div>

          {/* Amount and percentage */}
          <div className="flex items-baseline space-x-2 mb-6">
            <div className="text-white text-3xl font-semibold">{yieldData.amount}</div>
            <div className="text-green-500 text-sm font-medium">{yieldData.percentage}</div>
          </div>

          {/* Four items row */}
          <div className="flex flex-wrap justify-between w-full text-white text-xs max-w-sm">
            {breakdownItems.map((item) => (
              <div key={item.title} className="flex flex-col items-center">
                <span className="mb-1">{item.title}</span>
                <span className="f text-gray-400">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wallet Table Section */}
      <div className="rounded-xl bg-transparent mt-8 col-span-2">
        <div className="flex justify-between items-center mb-4 bg-white/30 py-2 px-4 rounded-lg">
          <div className="flex items-center space-x-2 text-white text-lg font-semibold">
            <FaWallet />
            <span>Wallet</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-white text-lg font-bold">{formatCurrency(netWorth)}</div>
            <button
              onClick={() => setWalletOpen(!walletOpen)}
              className="text-white focus:outline-none"
            >
              <FaChevronDown className={`transition-transform ${walletOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        {walletOpen && (
          <table className="w-full text-white text-sm">
            <thead className="bg-[#3B0041]/30">
              <tr>
                <th className="text-left py-2 px-4">Asset</th>
                <th className="text-left py-2 px-4">Balance</th>
                <th className="text-left py-2 px-4">Price</th>
                <th className="text-left py-2 px-4">Value</th>
              </tr>
            </thead>
            <tbody>
              {portfolio && portfolio.length > 0 ? (
                portfolio.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-transparent" : "bg-[rgba(255,255,255,0.1)]"}
                  >
                    <td className="py-2 px-4 truncate max-w-[120px]">
                      <div>{item?.code}</div>
                      <div className="text-xs text-gray-400">{item?.name}</div>
                    </td>
                    <td className="py-2 px-4 truncate max-w-[120px]">
                      {item.balance.toFixed(6)}
                    </td>
                    <td className="py-2 px-4 truncate max-w-[120px]">
                      <div>{formatCurrency(item.price)}</div>
                    </td>
                    <td className="py-2 px-4 truncate max-w-[120px]">{formatCurrency(item.balance_usd)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 px-4 text-center text-gray-400">
                    <div className="flex flex-col items-center space-y-2">
                      <FaWallet className="text-4xl opacity-50" />
                      <div className="text-lg font-medium">No assets found</div>
                      <div className="text-sm">Your portfolio is empty. Start by adding some tokens!</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
