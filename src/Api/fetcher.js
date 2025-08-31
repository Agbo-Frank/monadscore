import Axios from "axios";

const baseURL = "https://7a2cd8b5df09.ngrok-free.app";

const axios = Axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export const fetcher = (url) => {
  return handleRequest("get", url);
}

export const getFetcher = (url, body) => {
  return handleRequest("get", url, body);
}

export const postFetcher = (url, body) => {
  return handleRequest("post", url, body);
};

const handleRequest = async (method, url, body) => {
  try {
    const res = await axios.request({
      method,
      url,
      data: method === "get" ? {} : body?.arg,
      params: method === "get" ? body?.arg : {},
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  } catch (error) {
    let message = "Something went wrong";

    if (Axios.isAxiosError(error)) {
      const axiosError = error;
      message = axiosError.response?.data?.message || axiosError.message;
      throw { ...(axiosError.response?.data || {}) };
    }

    throw { message };
  }
};