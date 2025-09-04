import { ethers } from 'ethers';
import { extractErrorMessage } from '../helpers';
import { erc20Abi } from 'viem';
import buildTransactionRequest from './txConfig';

const getOwnerAddress = async (providerOrSigner) => {
  if (providerOrSigner instanceof ethers.providers.JsonRpcProvider) {
    return await providerOrSigner.getSigner().getAddress();
  }

  return await providerOrSigner.getAddress();
};

/**
 * @dev Constructs a transaction to approve token spending.
 * @param signer - The signer instance.
 * @param tokenContractAddress - The token contract address.
 * @param approveTo - EOA/Contract address of spender.
 * @param size - The amount of tokens to approve.
 * @returns A promise that resolves to the transaction request object.
 */
export async function constructApproveTransaction(
  signer,
  tokenContractAddress,
  approveTo,
  size
) {
  const address = await signer.getAddress();
  const tokenInterface = new ethers.utils.Interface(erc20Abi);
  const data = tokenInterface.encodeFunctionData('approve', [approveTo, size]);

  return buildTransactionRequest({
    to: tokenContractAddress,
    from: address,
    data,
    txOptions: { gasLimit: 210000 },
    signer, // Pass signer for gas estimation
  });
}

/**
 * @dev Approves a token for spending by the market contract.
 * @param tokenContract - The token contract instance.
 * @param approveTo - EOA/Contract address of spender.
 * @param size - The amount of tokens to approve.
 * @param providerOrSigner - The provider or signer to use for the transaction.
 * @param txOptions - Optional transaction parameters.
 * @param waitForReceipt - Whether to wait for the transaction receipt.
 * @returns A promise that resolves when the transaction is confirmed.
 */
export async function approveToken(
  tokenContract,
  approveTo,
  size,
  providerOrSigner,
  txOptions,
  waitForReceipt = true,
) {
  try {
    const ownerAddress = await getOwnerAddress(providerOrSigner);
    const existingApproval = await tokenContract.allowance(ownerAddress, approveTo);

    if (existingApproval.gte(size)) {
      console.log('Approval already exists');
      return null;
    }

    const tx = await constructApproveTransaction(
      tokenContract.signer,
      tokenContract.address,
      approveTo,
      size,
      txOptions,
    );
    const transaction = await tokenContract.signer.sendTransaction(tx);

    if (!waitForReceipt) {
      return transaction.hash;
    }

    const receipt = await transaction.wait(1);
    return receipt.transactionHash;
  } catch (e) {
    console.error({ e });
    if (!e.error) {
      throw e;
    }
    throw extractErrorMessage(e);
  }
}

export async function estimateApproveGas(
  tokenContract,
  approveTo,
  size,
) {
  try {
    const gasEstimate = await tokenContract.estimateGas.approve(approveTo, size);
    return gasEstimate;
  } catch (e) {
    if (!e.error) {
      throw e;
    }
    throw extractErrorMessage(e);
  }
}

/**
 * @dev Gets the token allowance for a specific owner and spender.
 * @param tokenAddress - The token contract address.
 * @param ownerAddress - The address of the token owner.
 * @param spenderAddress - The address of the spender.
 * @param provider - The provider instance to use for the query.
 * @returns A promise that resolves to the current allowance as a BigNumber.
 */
export async function getAllowance(
  tokenAddress,
  ownerAddress,
  spenderAddress,
  provider,
) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
    return allowance;
  } catch (e) {
    if (!e.error) {
      throw e;
    }
    throw extractErrorMessage(e);
  }
}