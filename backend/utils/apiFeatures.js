// Small helper to build a Mongo filter object for product search/filter/sort
export const buildProductQuery = (query) => {
  const filter = { isHidden: false };

  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.category) {
    filter.category = query.category;
  }
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.availability) {
    filter.availability = query.availability;
  }
  if (query.tag) {
    filter.tags = query.tag.toLowerCase();
  }
  if (query.bestSeller === 'true') filter.isBestSeller = true;
  if (query.newArrival === 'true') filter.isNewArrival = true;
  if (query.featured === 'true') filter.isFeatured = true;

  return filter;
};

export const buildSort = (sortKey) => {
  switch (sortKey) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'best_reviewed':
      return { ratingAverage: -1, ratingCount: -1 };
    case 'fast_delivery':
      return { productionDays: 1 };
    case 'new_arrival':
      return { createdAt: -1 };
    case 'best_seller':
      return { soldCount: -1 };
    default:
      return { createdAt: -1 };
  }
};
