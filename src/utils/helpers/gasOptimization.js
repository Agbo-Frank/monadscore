import { ethers } from 'ethers';

// Gas price strategies
export const GAS_STRATEGIES = {
  SLOW: 'slow',      // Lower gas price, longer wait time
  STANDARD: 'standard', // Balanced gas price and speed
  FAST: 'fast',      // Higher gas price, faster confirmation
  CUSTOM: 'custom'   // User-defined gas price
};

// Gas price multipliers for different strategies
export const GAS_MULTIPLIERS = {
  [GAS_STRATEGIES.SLOW]: 0.8,      // 20% below market rate
  [GAS_STRATEGIES.STANDARD]: 1.0,  // Market rate
  [GAS_STRATEGIES.FAST]: 1.2,      // 20% above market rate
};

// Estimated confirmation times (in minutes)
export const CONFIRMATION_TIMES = {
  [GAS_STRATEGIES.SLOW]: 5 - 15,
  [GAS_STRATEGIES.STANDARD]: 1 - 3,
  [GAS_STRATEGIES.FAST]: 0.5 - 1,
};

/**
 * Get current gas prices from the network
 */
export async function getCurrentGasPrices(provider) {
  try {
    const feeData = await provider.getFeeData();

    // For EIP-1559 networks (Ethereum mainnet, Polygon, etc.)
    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      return {
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasPrice: feeData.gasPrice,
        isEIP1559: true
      };
    }

    // For legacy networks
    return {
      gasPrice: feeData.gasPrice,
      isEIP1559: false
    };
  } catch (error) {
    console.error('Failed to get gas prices:', error);
    throw new Error('Unable to fetch current gas prices');
  }
}

/**
 * Calculate optimized gas prices based on strategy
 */
export function calculateOptimizedGasPrices(currentPrices, strategy = GAS_STRATEGIES.STANDARD) {
  const multiplier = GAS_MULTIPLIERS[strategy] || 1.0;

  if (currentPrices.isEIP1559) {
    return {
      maxFeePerGas: currentPrices.maxFeePerGas.mul(Math.floor(multiplier * 100)).div(100),
      maxPriorityFeePerGas: currentPrices.maxPriorityFeePerGas.mul(Math.floor(multiplier * 100)).div(100),
      isEIP1559: true,
      strategy,
      estimatedTime: CONFIRMATION_TIMES[strategy]
    };
  } else {
    return {
      gasPrice: currentPrices.gasPrice.mul(Math.floor(multiplier * 100)).div(100),
      isEIP1559: false,
      strategy,
      estimatedTime: CONFIRMATION_TIMES[strategy]
    };
  }
}

/**
 * Estimate gas limit for a transaction
 */
export async function estimateGasLimit(provider, transaction) {
  try {
    const gasEstimate = await provider.estimateGas(transaction);
    // Add 20% buffer to gas estimate
    return gasEstimate.mul(120).div(100);
  } catch (error) {
    console.warn('Gas estimation failed:', error);
    // Return a default gas limit based on transaction type
    if (transaction.data && transaction.data !== '0x') {
      return ethers.BigNumber.from('300000'); // Contract interaction
    }
    return ethers.BigNumber.from('21000'); // Simple transfer
  }
}

/**
 * Format gas price for display
 */
export function formatGasPrice(gasPrice, decimals = 9) {
  if (!gasPrice) return '0';
  return ethers.utils.formatUnits(gasPrice, 'gwei');
}

/**
 * Calculate estimated transaction cost in ETH
 */
export function calculateTransactionCost(gasLimit, gasPrice) {
  if (!gasLimit || !gasPrice) return '0';
  return ethers.utils.formatEther(gasLimit.mul(gasPrice));
}

/**
 * Get gas price recommendations based on network congestion
 */
export async function getGasRecommendations(provider) {
  try {
    const currentPrices = await getCurrentGasPrices(provider);

    const recommendations = {};

    Object.values(GAS_STRATEGIES).forEach(strategy => {
      if (strategy !== GAS_STRATEGIES.CUSTOM) {
        recommendations[strategy] = calculateOptimizedGasPrices(currentPrices, strategy);
      }
    });

    return {
      current: currentPrices,
      recommendations,
      networkCongestion: await getNetworkCongestion(provider)
    };
  } catch (error) {
    console.error('Failed to get gas recommendations:', error);
    throw error;
  }
}

/**
 * Estimate network congestion level
 */
async function getNetworkCongestion(provider) {
  try {
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);

    // Simple congestion estimation based on gas used vs gas limit
    const gasUsedRatio = block.gasUsed.mul(100).div(block.gasLimit);

    if (gasUsedRatio.gt(90)) return 'high';
    if (gasUsedRatio.gt(70)) return 'medium';
    return 'low';
  } catch (error) {
    console.warn('Failed to estimate network congestion:', error);
    return 'unknown';
  }
}

/**
 * Validate gas settings before sending transaction
 */
export function validateGasSettings(gasSettings) {
  const errors = [];

  if (gasSettings.isEIP1559) {
    if (!gasSettings.maxFeePerGas || gasSettings.maxFeePerGas.lte(0)) {
      errors.push('Invalid maxFeePerGas');
    }
    if (!gasSettings.maxPriorityFeePerGas || gasSettings.maxPriorityFeePerGas.lte(0)) {
      errors.push('Invalid maxPriorityFeePerGas');
    }
    if (gasSettings.maxPriorityFeePerGas && gasSettings.maxFeePerGas &&
      gasSettings.maxPriorityFeePerGas.gt(gasSettings.maxFeePerGas)) {
      errors.push('maxPriorityFeePerGas cannot be greater than maxFeePerGas');
    }
  } else {
    if (!gasSettings.gasPrice || gasSettings.gasPrice.lte(0)) {
      errors.push('Invalid gasPrice');
    }
  }

  if (!gasSettings.gasLimit || gasSettings.gasLimit.lte(0)) {
    errors.push('Invalid gasLimit');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 