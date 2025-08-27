import React from 'react'
import Tooltip from "../Components/Tooltip";
import { herobg } from "../Assets";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const BarChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          color: 'white',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'white',
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            return parseInt(label) % 2 === 1 ? label : '';
          }
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

const Pools = () => {
  const dayLabels = Array.from({ length: 30 }, (_, i) => (i + 1).toString());

  const tradingVolumeData = {
    labels: dayLabels,
    datasets: [
      {
        data: [1200, 1900, 3000, 5000, 2000, 3500, 1200, 1900, 3000, 5000, 2000, 3500, 1200, 1900, 3000, 5000, 2000, 3500, 1200, 1900, 3000, 5000, 2000, 3500, 1200, 1900, 3000, 5000, 2000, 3500],
        backgroundColor: '#BB86FC',
        borderRadius: 4,
        barPercentage: 0.5,
      },
    ],
  };

  const lpFeesData = {
    labels: dayLabels,
    datasets: [
      {
        data: [800, 1500, 700, 1000, 1200, 900, 800, 1500, 700, 1000, 1200, 900, 800, 1500, 700, 1000, 1200, 900, 800, 1500, 700, 1000, 1200, 900, 800, 1500, 700, 1000, 1200],
        backgroundColor: '#03DAC6',
        borderRadius: 4,
        barPercentage: 0.5,
      },
    ],
  };

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
        {/* Liquidity POol*/}
        <div className="bg-white/15 rounded-lg p-6 max-w-4xl w-full mt-6 text-center z-10 relative px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl text-center sm:text-left text-white mb-2">Liquidity Pools</h2>
          <p className="text-white/70 mb-6 text-center sm:text-left">No Liquidity found in this pair</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-6 sm:space-y-0 sm:space-x-6">
            <div className="w-full sm:w-1/2 flex flex-col">
              <h3 className="text-sm text-center sm:text-left text-white mb-3">Trading Volume</h3>
              <div className="bg-[#1C001E] rounded-lg p-4 flex-grow w-full max-h-64 sm:max-h-96 overflow-x-auto">
                <BarChart data={tradingVolumeData} />
              </div>
            </div>
            <div className="w-full sm:w-1/2 flex flex-col">
              <h3 className="text-sm text-center sm:text-left text-white mb-3">24h LP Fees: $3,488.04</h3>
              <div className="bg-[#1C001E] rounded-lg p-4 flex-grow w-full max-h-64 sm:max-h-96 overflow-x-auto">
                <BarChart data={lpFeesData} />
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="bg-[#1C001E] rounded-lg p-6 mt-6 max-w-4xl w-full text-white">
            <h3 className="text-left mb-6">Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
              {[
                { label: "Total Value Locked", value: "$1,285,422.44" },
                { label: "Total Swaps", value: "6,878,557" },
                { label: "Monthly Active Users", value: "282,179", tooltip: "Number of users active monthly" },
                { label: "Total Volume", value: "$396,617,804.05" },
                { label: "Unique Wallets", value: "604,306", tooltip: "Number of unique wallets interacting" },
                { label: "Daily Active Users", value: "20,845", tooltip: "Number of users active daily" },
              ].map((stat, idx) => (
                <div key={stat.label} className="flex text-sm justify-between items-center">
                  <span>{stat.label}</span>
                  <div className="flex items-center">
                    <span className="font-semibold">{stat.value}</span>
                    {stat.tooltip && <Tooltip text={stat.tooltip} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Pools