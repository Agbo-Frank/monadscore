import useSWRMutation from "swr/mutation";
import { getFetcher, postFetcher } from "../Api/fetcher";

const fetcherMap = {
  get: getFetcher,
  post: postFetcher
};

export default function useFetcher(
  url,
  method = "post",
  options = {},
) {
  const fetcher = fetcherMap[method] || postFetcher;
  const { trigger, ...props } = useSWRMutation(url, fetcher, options);

  const handleTrigger = async (
    extraArgument,
    options
  ) => {
    return trigger(extraArgument, options)
      .then(response => response)
      .catch(error => error)
  }
  return { ...props, trigger: handleTrigger }
}
