export default async function buildTransactionRequest({
  to,
  data,
  value,
  txOptions,
}) {
  const tx = {
    to,
    data,
    value,
    ...(txOptions?.gasLimit && { gasLimit: txOptions.gasLimit })
  };


  return tx;
}