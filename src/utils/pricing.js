/**
 * Helper to compute price based on role tier and 8% margin factor.
 * - Super Stockist (SS) / Admin: Base Price
 * - Distributor (D): Base Price * 1.08
 * - Retail Shop (Salesman): (Base Price * 1.08) * 1.08
 */
export const calculateRolePrice = (basePrice, role) => {
  const price = Number(basePrice) || 0;
  if (role === 'Salesman') {
    return Math.round(price * 1.08 * 1.08 * 100) / 100;
  } else if (role === 'Distributor') {
    return Math.round(price * 1.08 * 100) / 100;
  } else {
    // Super Stockist, Admin
    return Math.round(price * 100) / 100;
  }
};

/**
 * Helper to get all tier prices for a given base price (used in Item Master UI)
 */
export const getTierPrices = (basePrice) => {
  const price = Number(basePrice) || 0;
  const ssPrice = Math.round(price * 100) / 100;
  const distPrice = Math.round(price * 1.08 * 100) / 100;
  const retailPrice = Math.round(price * 1.08 * 1.08 * 100) / 100;

  return {
    ssPrice,
    distPrice,
    retailPrice,
  };
};
