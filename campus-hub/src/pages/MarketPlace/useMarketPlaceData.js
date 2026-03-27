import { useState, useEffect, useMemo } from "react";
import { fetchAiListingMatches, fetchListings } from "../../api/listings";
import { buildApiUrl } from "../../api/client";
import { FEATURE_FLAGS } from "../../config/features";

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
  {
    id: "aub-market-6",
    productName: "Dell 24-inch Monitor",
    author: "Rami K.",
    userId: "featured-user-6",
    price: 110,
    description: "1080p monitor with HDMI cable included, great for coding setup.",
    category: "Electronics & Gadgets",
    imageUrl: "https://m.media-amazon.com/images/I/81ulRMhYtEL._AC_.jpg",
  },
  {
    id: "aub-market-7",
    productName: "Power Bank 20000mAh",
    author: "Lea N.",
    userId: "featured-user-7",
    price: 22,
    description: "Fast charging power bank for long days on campus.",
    category: "Electronics & Gadgets",
    imageUrl: "https://marketplace.bancointer.com.br/ecommerce/images/platform/e8613ae27becee36762374a68b8f61aa.png",
  },
  {
    id: "aub-market-8",
    productName: "Linear Algebra Workbook",
    author: "Majd A.",
    userId: "featured-user-8",
    price: 14,
    description: "Solved examples and practice sheets for MATH courses.",
    category: "Books, Study & Office Supplies",
    imageUrl: "https://tse2.mm.bing.net/th/id/OIP.8aGdI3Mn-pPx_JHPHUIWTAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "aub-market-9",
    productName: "Scientific Notebook Set (Pack of 4)",
    author: "Dana F.",
    userId: "featured-user-9",
    price: 9,
    description: "New notebooks, ideal for lecture notes and lab logs.",
    category: "Books, Study & Office Supplies",
    imageUrl: "https://cdn.shopify.com/s/files/1/1055/1086/products/Lab-Science-Pocket-Notebook-4-pack-Cognitive-Surplus-326_2048x.jpg?v=1659329187",
  },
  {
    id: "aub-market-10",
    productName: "Ergonomic Office Chair",
    author: "Youssef T.",
    userId: "featured-user-10",
    price: 75,
    description: "Comfortable chair with adjustable height and lumbar support.",
    category: "Furniture & Home Goods",
    imageUrl: "https://i5.walmartimages.com/seo/Mainstays-Ergonomic-Mesh-Back-Task-Office-Chair-with-Flip-up-Arms-Black-Fabric-275-lb_584c4cc5-fc4d-46d3-9a23-5a3fb5bb134e.6c681a1d24f26e9c017a3a011877e2d8.jpeg",
  },
  {
    id: "aub-market-11",
    productName: "Bedside Lamp",
    author: "Mira J.",
    userId: "featured-user-11",
    price: 12,
    description: "Warm light desk/bed lamp in excellent condition.",
    category: "Furniture & Home Goods",
    imageUrl: "https://tse2.mm.bing.net/th/id/OIP.CEUO8BDwmWiB8PA9RzDSCQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
  },

  {
    id: "aub-market-12",
    productName: "Running Shoes - Size 42",
    author: "Nadine C.",
    userId: "featured-user-12",
    price: 30,
    description: "Good condition sports shoes, worn a few times only.",
    category: "Clothing & Accessories",
    imageUrl: "https://tse3.mm.bing.net/th/id/OIP.1KudGyKRsZqKvgI0BjGuXwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "aub-market-13",
    productName: "Acoustic Guitar",
    author: "Omar L.",
    userId: "featured-user-13",
    price: 85,
    description: "Beginner-friendly guitar with carrying bag.",
    category: "Other",
    imageUrl: "https://image.made-in-china.com/2f0j00RNnhwFfledkA/Custom-12-Strings-Solid-Koa-Top-Dreadnought-Classic-Acoustic-Guitar.jpg",
  },
  {
    id: "aub-market-14",
    productName: "Yoga Mat + Resistance Bands",
    author: "Tala B.",
    userId: "featured-user-14",
    price: 18,
    description: "Home workout bundle in great condition.",
    category: "Sports & Fitness",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=450&fit=crop",
  },
  {
    id: "aub-market-15",
    productName: "Grocery Starter Box",
    author: "Samir D.",
    userId: "featured-user-15",
    price: 16,
    description: "Rice, pasta, canned beans, and cooking oil — ideal for move-in week.",
    category: "Food & Groceries",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=450&fit=crop",
  },
  {
    id: "aub-market-16",
    productName: "Hair Dryer + Straightener Set",
    author: "Rana E.",
    userId: "featured-user-16",
    price: 24,
    description: "Both appliances fully working with travel pouch.",
    category: "Beauty & Personal Care",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=450&fit=crop",
  },
  {
    id: "aub-market-17",
    productName: "Cordless Drill Kit",
    author: "Fadi M.",
    userId: "featured-user-17",
    price: 40,
    description: "Great for quick dorm/apartment fixes. Includes charger and bits.",
    category: "Tools & DIY",
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=450&fit=crop",
  },
  {
    id: "aub-market-18",
    productName: "PS4 Console with 2 Controllers",
    author: "Nabil K.",
    userId: "featured-user-18",
    price: 170,
    description: "Well-maintained console, cables included.",
    category: "Games & Entertainment",
    imageUrl: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=600&h=450&fit=crop",
  },
  {
    id: "aub-market-19",
    productName: "Cat Travel Carrier",
    author: "Hana S.",
    userId: "featured-user-19",
    price: 14,
    description: "Lightweight carrier with side ventilation panels.",
    category: "Pet Supplies",
    imageUrl: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=600&h=450&fit=crop",
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
  const [isLoading, setIsLoading] = useState(!FEATURE_FLAGS.mockData);
  const [aiRankedListingIds, setAiRankedListingIds] = useState([]);
  const [aiSearchError, setAiSearchError] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);

  const refetch = useMemo(() => () => {
    if (FEATURE_FLAGS.mockData) return;
    setApiError("");
    setIsLoading(true);
    fetchListings()
      .then((data) => setApiListings(Array.isArray(data) ? data : []))
      .catch((err) => setApiError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (FEATURE_FLAGS.mockData) return;
    let isMounted = true;
    fetchListings()
      .then((data) => {
        if (isMounted) setApiListings(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (isMounted) setApiError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      setAiRankedListingIds([]);
      setAiSearchError("");
      setIsAiSearching(false);
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsAiSearching(true);
      setAiSearchError("");
      try {
        const results = await fetchAiListingMatches(trimmedSearch, 50);
        if (isCancelled) return;
        const rankedIds = Array.isArray(results)
          ? results.map((result) => result.listingId).filter(Boolean)
          : [];
        setAiRankedListingIds(rankedIds);
      } catch (error) {
        if (isCancelled) return;
        setAiRankedListingIds([]);
        setAiSearchError(error.message || "AI search unavailable");
      } finally {
        if (!isCancelled) {
          setIsAiSearching(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  const items = useMemo(() => {
    if (isLoading) return [];
    const sourceListings = apiListings.length > 0 ? apiListings : FEATURED_AUB_MARKETPLACE_ITEMS;
    return sourceListings.map(toListingShape);
  }, [apiListings, isLoading]);

  const categoriesWithItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const itemsById = new Map(items.map((item) => [item.listingId, item]));

    let filteredItems = items;

    if (normalizedSearch) {
      if (aiRankedListingIds.length > 0) {
        filteredItems = aiRankedListingIds
          .map((listingId) => itemsById.get(listingId))
          .filter(Boolean);
      } else {
        filteredItems = items.filter((item) => {
          const title = (item.title ?? item.productName ?? "").toLowerCase();
          const description = (item.description ?? "").toLowerCase();
          const category = (item.categoryName ?? item.category ?? "").toLowerCase();
          return title.includes(normalizedSearch)
            || description.includes(normalizedSearch)
            || category.includes(normalizedSearch);
        });
      }
    }

    const byCategory = new Map();
    filteredItems.forEach((item) => {
      const cat = item.categoryName ?? item.category ?? "Other";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(item);
    });
    return Array.from(byCategory.entries());
  }, [aiRankedListingIds, items, search]);

  return {
    items,
    categoriesWithItems,
    search,
    setSearch,
    apiError,
    isLoading,
    refetch,
    aiSearchError,
    isAiSearching,
  };
}
