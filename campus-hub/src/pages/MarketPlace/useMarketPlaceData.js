import { useState, useEffect, useMemo } from "react";
import { fetchListings } from "../../api/listings";
import { products } from "../../products";

function toListingShape(p) {
  if (p.listingId != null) {
    return {
      ...p,
      imageUrl: p.firstImageId
        ? `/api/listingImage/download-listing-image/${p.firstImageId}`
        : (p.imageUrl ?? p.productImage),
    };
  }
  return {
    listingId: p.id,
    title: p.productName ?? p.title,
    userName: p.userName ?? p.author,
    userId: p.userId,
    price: p.price,
    description: p.description,
    categoryName: p.categoryName ?? p.category,
    imageUrl: p.imageUrl ?? p.productImage,
    discountPercent: p.discountPercent,
  };
}

export function useMarketPlaceData() {
  const [search, setSearch] = useState("");
  const [apiListings, setApiListings] = useState([]);
  const [apiError, setApiError] = useState("");

  const refetch = useMemo(() => () => {
    setApiError("");
    fetchListings()
      .then((data) => setApiListings(Array.isArray(data) ? data : []))
      .catch((err) => setApiError(err.message));
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchListings()
      .then((data) => {
        if (isMounted) setApiListings(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (isMounted) setApiError(err.message);
      });
    return () => { isMounted = false; };
  }, []);

  const items = useMemo(() => {
    const fromApi = (apiListings || []).map(toListingShape);
    const fromProducts = (products || []).map(toListingShape);
    const seen = new Set();
    const merged = [];
    fromApi.forEach((item) => {
      const key = item.listingId ?? item.title;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    });
    fromProducts.forEach((item) => {
      const key = item.listingId ?? item.title;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    });
    return merged;
  }, [apiListings]);

  const categoriesWithItems = useMemo(() => {
    const byCategory = new Map();
    items.forEach((item) => {
      const cat = item.categoryName ?? item.category ?? "Other";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(item);
    });
    return Array.from(byCategory.entries());
  }, [items]);

  return {
    items,
    categoriesWithItems,
    search,
    setSearch,
    apiError,
    refetch,
  };
}
