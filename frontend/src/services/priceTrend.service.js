import api from "./api";

export const getPropertyPriceTrends = async (filters = {}) => {
  const params = {};

  for (const key of [
    "city",
    "locality",
    "property_type",
    "listing_type",
  ]) {
    const value = filters[key];

    if (typeof value === "string" && value.trim()) {
      params[key] = value.trim();
    }
  }

  const response = await api.get("/properties/price-trends", {
    params,
  });

  return response.data?.data ?? response.data;
};
