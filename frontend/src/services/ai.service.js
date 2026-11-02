
import api from './api';

// ==========================================
// AI PROPERTY PRICE PREDICTION
// ==========================================

export const predictPropertyPrice = async (propertyData) => {
  const response = await api.post(
    '/ai/price-prediction',
    propertyData
  );

  return response.data?.data ?? response.data;
};

// ==========================================
// AI PROPERTY RECOMMENDATIONS
// ==========================================

export const getPropertyRecommendations = async (preferences) => {
  const response = await api.post(
    '/ai/recommendations',
    { preferences }
  );

  return response.data?.data ?? response.data;
};

// ==========================================
// AI IMAGE VALUATION
// ==========================================

export const analysePropertyImage = async (formData) => {
  const response = await api.post(
    '/ai/image-valuation',
    formData,
    {
      timeout: 45000,
    }
  );

  return response.data?.data ?? response.data;
};

// ==========================================
// AI PROPERTY CHATBOT
// ==========================================

export const chatWithPropertyAssistant = async (
  message,
  conversationHistory = []
) => {
  const response = await api.post(
    '/ai/chatbot',
    {
      message,
      conversation_history: conversationHistory,
    },
    {
      timeout: 30000,
    }
  );

  return response.data?.data ?? response.data;
};

// ==========================================
// AI PROPERTY INVESTMENT ANALYTICS
// ==========================================

export const analysePropertyInvestment = async (
  propertyId,
  investmentAssumptions
) => {
  if (!propertyId) {
    throw new Error('Property ID is required for investment analysis.');
  }
  const response = await api.post(
    `/ai/investment-analytics/${propertyId}/analyze`,
    {
      monthly_rent: Number(investmentAssumptions.monthly_rent),
      annual_expenses: Number(investmentAssumptions.annual_expenses),
      annual_appreciation_percent: Number(
        investmentAssumptions.annual_appreciation_percent
      ),
      holding_period_years: Number(
        investmentAssumptions.holding_period_years
      ),
    },
    {
      timeout: 20000,
    }
  );

  return response.data?.data ?? response.data;
};
