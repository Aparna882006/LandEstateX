
const STORAGE_KEY = 'landestatex_saved_searches';

const readSavedSearches = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getSavedSearches = () => {
  return readSavedSearches();
};

export const saveSearch = (search) => {
  const searches = readSavedSearches();

  const normalized = {
    keyword: search.keyword || '',
    filters: search.filters || {},
    sort: search.sort || 'relevance',
  };

  const key = JSON.stringify(normalized);

  const alreadySaved = searches.some((item) => {
    return (
      JSON.stringify({
        keyword: item.keyword || '',
        filters: item.filters || {},
        sort: item.sort || 'relevance',
      }) === key
    );
  });

  if (alreadySaved) {
    return searches;
  }

  const updated = [
    {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      ...normalized,
      createdAt: new Date().toISOString(),
    },
    ...searches,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  return updated;
};

export const deleteSavedSearch = (id) => {
  const updated = readSavedSearches().filter(
    (item) => item.id !== id
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  return updated;
};
