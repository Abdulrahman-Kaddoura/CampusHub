import { useState, useEffect, useMemo } from "react";
import { fetchListings } from "../../api/listings";
import { buildApiUrl } from "../../api/client";

const FEATURED_AUB_MARKETPLACE_ITEMS = [
  {
    id: "aub-market-1",
    productName: "TI-84 Plus Graphing Calculator",
    author: "Nour S.",
    userId: "featured-user-1",
    price: 65,
    description: "Used in excellent condition, ideal for MATH and EECE problem sets at AUB.",
    category: "Electronics & Gadgets",
    imageUrl: "https://images.offerup.com/raQPXc7IGAe3lMf7gxiwcRByTII=/756x1008/b797/b797e3fa9de044f8a5cdf56199bef903.jpg",
  },
  {
    id: "aub-market-2",
    productName: "Organic Chemistry Textbook + Notes",
    author: "Sarah M.",
    userId: "featured-user-2",
    price: 28,
    description: "AUB CHEM 201/202 aligned textbook with highlighted summaries and reaction sheets.",
    category: "Books, Study & Office Supplies",
    imageUrl: "https://tse2.mm.bing.net/th/id/OIP.2OTW62usHI7CtC6hqGwrYwHaJi?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "aub-market-3",
    productName: "Compact Study Desk for Hamra Apartments",
    author: "Karim H.",
    userId: "featured-user-3",
    price: 120,
    description: "Minimal desk with cable tray, perfect for small student apartments near AUB.",
    category: "Furniture & Home Goods",
    imageUrl: "https://tse1.mm.bing.net/th/id/OIP.l6z5O0uSf1w_NRr3GCILBwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "aub-market-4",
    productName: "Hoodie - Medium",
    author: "Lynn T.",
    userId: "featured-user-4",
    price: 20,
    description: "lightly worn, great for winter classes.",
    category: "Clothing & Accessories",
    imageUrl: "https://tse3.mm.bing.net/th/id/OIP.Z_ZdVdgdxt_mI40Jz5dylQAAAA?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "aub-market-5",
    productName: "Dorm Mini Fridge",
    author: "Hadi R.",
    userId: "featured-user-5",
    price: 95,
    description: "Energy efficient mini fridge",
    category: "Other",
    imageUrl: "https://i.ebayimg.com/images/g/9MEAAOSwxaNeT98b/s-l500.jpg",
  },
];

function toListingShape(p) {
  if (p.listingId != null) {
    return {
      ...p,
      imageUrl: (p.firstImageId ?? p.imageId)
        ? buildApiUrl(`/api/listingImage/download-listing-image/${(p.firstImageId ?? p.imageId)}`)
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
    const sourceListings = (apiListings || []).length > 0 ? apiListings : FEATURED_AUB_MARKETPLACE_ITEMS;
    return sourceListings.map(toListingShape);
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
