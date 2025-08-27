import React, { useMemo, memo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useSWR from "swr";
import endpoint from "../Api/endpoint";
import { formatCurrency, isEmpty, truncateAddress } from "../utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CoinCard = memo(function CoinCard({ coin }) {
  const { data, isLoading } = useSWR(coin?.address ? `${endpoint.chart}/${coin?.address}` : null)
  const percentChange = data?.data?.change || 0

  const chartData = useMemo(() => {
    let prices = []
    if (data?.data?.prices) {
      prices = data?.data?.prices?.map(([timestamp, price]) => ({
        x: new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        y: price,
      }));
    }

    return {
      labels: prices.map((p) => p.x),
      datasets: [
        {
          label: `${coin?.code} Price`,
          data: prices.map((p) => p.y),
          borderColor: percentChange !== null && percentChange < 0 ? "#FF2727" : "#00DC37",
          fill: false,
          tension: 0.3,
          pointRadius: 0,
        },
      ],
    }
  }, [data?.data?.prices, coin])

  const bgColor =
    percentChange === null
      ? "rgb(228, 242, 235)"
      : percentChange >= 0
        ? "rgb(228, 242, 235)"
        : "rgb(241, 232, 234)";

  const percentColor =
    percentChange === null
      ? "text-gray-500"
      : percentChange >= 0
        ? "text-[rgb(0,220,55)]"
        : "text-[rgb(255,39,39)]";

  return (
    <button
      style={{
        backgroundColor: bgColor,
        height: "7.188rem",
        borderRadius: "0.938rem",
        padding: "1rem",
        cursor: "pointer",
        border: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-round",
        maxWidth: "100%",
      }}
      type="button"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-center">
            <div className="text-xs font-bold text-gray-900 uppercase">
              {
                coin?.code ?
                  `${coin?.code}` :
                  <div className="bg-gray-200 rounded-md h-3 w-12" />
              }
            </div>
            <div className="text-sm font-bold text-gray-900">
              {
                isLoading ?
                  <div className="bg-gray-200 rounded-md h-3 w-12" /> :
                  formatCurrency(data?.data?.price)
              }
            </div>
          </div>
          {/* {coinStatus && (
            <p className="text-xs text-gray-500">{coinStatus}</p>
          )} */}
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-gray-500">{truncateAddress(coin?.address)}</div>
            <div className={`text-xs ${percentColor}`}>
              {percentChange !== null ? (
                <>
                  {percentChange >= 0 ? "+" : ""}
                  {percentChange.toFixed(2)}%
                </>
              ) : (
                "--"
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="h-14 w-full">
        {isLoading || isEmpty(coin) ? (
          <p className="text-center text-gray-500">Loading chart...</p>
        ) : chartData ? (
          <Line
            data={{
              ...chartData,
              datasets: chartData.datasets.map((ds) => ({
                ...ds,
                borderColor:
                  percentChange !== null && percentChange < 0 ? "#FF2727" : "#00DC37",
              })),
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
              scales: {
                x: { display: false, grid: { display: false }, ticks: { display: false } },
                y: { display: false, grid: { display: false }, ticks: { display: false } },
              },
              elements: { line: { borderWidth: 2 } },
            }}
            style={{ maxHeight: 56, maxWidth: "100%" }}
          />
        ) : (
          <p className="text-center text-gray-500">Loading chart...</p>
        )}
      </div>
    </button>
  );
});

export default CoinCard;