
import api from "./api";

export const predictPropertyPrice = async (propertyData) => {
  const response = await api.post(
    "/ai/price-prediction",
    propertyData
  );

  return response.data?.data ?? response.data;
};
