import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { formatCurrency, formatTokenBalance, isEmpty, isEthereumAddress } from '../utils';
import useSWR from 'swr';
import endpoint from '../Api/endpoint';
import Loader from './Loader';

function CoingSelectorItem({ coin, onClick }) {
  return (
    <div
      onClick={() => onClick(coin)}
      className="flex items-baseline justify-between p-3 border-b border-gray-100 cursor-pointer select-none hover:bg-gray-50 transition-colors duration-150"
    >
      <div className="flex flex-col items-start justify-start">
        <div className="font-semibold text-base uppercase mb-0.5">
          {coin?.code || '--'}
        </div>
        <div className="text-center whitespace-nowrap text-ellipsis text-sm text-gray-600 overflow-hidden max-w-[250px]">
          {coin?.name || ''}
        </div>
      </div>
      {
        coin?.balance > 0 &&
        <div className="flex flex-col justify-end text-right text-sm ml-3 whitespace-nowrap">
          <span className='font-medium'>{formatTokenBalance(coin.balance)}</span>
          <span className='text-xs'>{formatCurrency(coin.balance_usd)}</span>
        </div>
      }
    </div>
  )
}

const CoinSelector = ({
  isOpen,
  onClose,
  onSelectCoin,
  tokens = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [externalToken, setExternalToken] = useState(null);
  const [shouldSearchExternal, setShouldSearchExternal] = useState(false);

  const { isLoading, data, error } = useSWR(
    shouldSearchExternal && externalToken ?
      `${endpoint.token}/${externalToken}` :
      null
  );

  // Reset external search when search term changes
  useEffect(() => {
    if (searchTerm !== externalToken) {
      setExternalToken(null);
      setShouldSearchExternal(false);
    }
  }, [searchTerm, externalToken]);

  // Filter tokens on-the-fly based on search term
  const filteredTokens = useMemo(() => {
    if (!searchTerm.trim()) {
      return tokens;
    }

    const term = searchTerm.toLowerCase().trim();
    const result = tokens.filter(token =>
      token.code?.toLowerCase().includes(term) ||
      token.name?.toLowerCase().includes(term) ||
      token.address?.toLowerCase().includes(term)
    );

    // Only trigger external search if no local results and valid address
    if (isEmpty(result) && isEthereumAddress(term) && !shouldSearchExternal) {
      setExternalToken(term);
      setShouldSearchExternal(true);
    }

    return result;
  }, [searchTerm, tokens, shouldSearchExternal]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleOnSelect = (coin) => {
    onSelectCoin(coin);
    onClose();
  }

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
    >
      <div className="bg-white rounded-xl shadow-lg w-96 h-96 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by code, name, or contract address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 text-base rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-3 bg-transparent border-none text-2xl cursor-pointer leading-none text-gray-500 hover:text-gray-700 transition-colors"
          >
            &times;
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {
            isLoading ?
              <div className="p-5 text-center text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <Loader />
                  <span>Searching for token...</span>
                </div>
              </div> :
              (filteredTokens.length === 0 && !data?.data) ?
                <div className="p-5 text-center text-gray-600">
                  {
                    searchTerm.trim() ?
                      'No tokens found matching your search.' :
                      'No tokens available.'
                  }
                </div> :
                !isEmpty(data?.data) ?
                  <CoingSelectorItem
                    coin={data?.data}
                    onClick={handleOnSelect}
                  /> :
                  filteredTokens.map((coin, i) => (
                    <CoingSelectorItem
                      key={i}
                      coin={coin}
                      onClick={handleOnSelect}
                    />
                  ))
          }
        </div>
      </div>
    </div>
  );
};

export default CoinSelector;