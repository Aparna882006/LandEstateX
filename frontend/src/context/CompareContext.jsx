import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const [compareIds, setCompareIds] = useState([]);

  const toggleCompare = (propertyId) => {
    setCompareIds((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, propertyId];
    });
  };

  const clearCompare = () => setCompareIds([]);

  return (
    <CompareContext.Provider value={{ compareIds, toggleCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

CompareProvider.propTypes = {
  children: PropTypes.node.isRequired,
};