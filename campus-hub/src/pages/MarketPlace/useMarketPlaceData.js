import { useState, useEffect, useMemo } from "react";
import { fetchAiListingMatches, fetchListings } from "../../api/listings";
import { buildApiUrl } from "../../api/client";
import { FEATURE_FLAGS } from "../../config/features";

const FEATURED_AUB_MARKETPLACE_ITEMS = [
  {
    id: "aub-market-1",
    listingId: "a1b2c3d4-0001-4000-8000-ef1234567890",
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
    listingId: "a1b2c3d4-0002-4000-8000-ef1234567890",
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
    listingId: "a1b2c3d4-0003-4000-8000-ef1234567890",
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
    listingId: "a1b2c3d4-0004-4000-8000-ef1234567890",
    productName: "Hoodie - Medium",
    author: "Lynn T.",
    userId: "featured-user-4",
    price: 20,
    description: "Lightly worn, great for winter classes.",
    category: "Clothing & Accessories",
    imageUrl: "https://tse3.mm.bing.net/th/id/OIP.Z_ZdVdgdxt_mI40Jz5dylQAAAA?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "aub-market-5",
    listingId: "a1b2c3d4-0005-4000-8000-ef1234567890",
    productName: "Dorm Mini Fridge",
    author: "Hadi R.",
    userId: "featured-user-5",
    price: 95,
    description: "Energy efficient mini fridge for dorms or small apartments.",
    category: "Furniture & Home Goods",
    imageUrl: "https://i.ebayimg.com/images/g/9MEAAOSwxaNeT98b/s-l500.jpg",
  },
  {
    id: "aub-market-6",
    listingId: "a1b2c3d4-0006-4000-8000-ef1234567890",
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
    listingId: "a1b2c3d4-0007-4000-8000-ef1234567890",
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
    listingId: "a1b2c3d4-0008-4000-8000-ef1234567890",
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
    listingId: "a1b2c3d4-0009-4000-8000-ef1234567890",
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
    listingId: "a1b2c3d4-0010-4000-8000-ef1234567890",
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
    listingId: "a1b2c3d4-0011-4000-8000-ef1234567890",
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
    listingId: "a1b2c3d4-0012-4000-8000-ef1234567890",
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
    listingId: "a1b2c3d4-0013-4000-8000-ef1234567890",
    productName: "Acoustic Guitar",
    author: "Omar L.",
    userId: "featured-user-13",
    price: 85,
    description: "Beginner-friendly guitar with carrying bag.",
    category: "Other",
    imageUrl: "https://image.made-in-china.com/2f0j00RNnhwFfledkA/Custom-12-Strings-Solid-Koa-Top-Dreadnought-Classic-Acoustic-Guitar.jpg",
  },

  // NEW ITEMS
  {
    id: "aub-market-14",
    listingId: "a1b2c3d4-0014-4000-8000-ef1234567890",
    productName: "HP Pavilion Laptop",
    author: "Jana B.",
    userId: "featured-user-14",
    price: 320,
    description: "Used laptop in good condition, suitable for coding, assignments, and online classes.",
    category: "Electronics & Gadgets",
    imageUrl: "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08287564.png",
  },
  {
    id: "aub-market-15",
    listingId: "a1b2c3d4-0015-4000-8000-ef1234567890",
    productName: "Wireless Mouse",
    author: "Tarek D.",
    userId: "featured-user-15",
    price: 12,
    description: "Compact wireless mouse, perfect for students on the go.",
    category: "Electronics & Gadgets",
    imageUrl: "https://resource.logitech.com/content/dam/logitech/en/products/mice/m185/gallery/m185-grey-top-view.png",
  },
  {
    id: "aub-market-16",
    listingId: "a1b2c3d4-0016-4000-8000-ef1234567890",
    productName: "Bluetooth Headphones",
    author: "Rita A.",
    userId: "featured-user-16",
    price: 35,
    description: "Noise-isolating headphones for studying, calls, and commuting.",
    category: "Electronics & Gadgets",
    imageUrl: "https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SL1500_.jpg",
  },
  {
    id: "aub-market-17",
    listingId: "a1b2c3d4-0017-4000-8000-ef1234567890",
    productName: "USB-C Hub",
    author: "Fadi M.",
    userId: "featured-user-17",
    price: 18,
    description: "Multi-port adapter with HDMI and USB ports for laptops and tablets.",
    category: "Electronics & Gadgets",
    imageUrl: "https://m.media-amazon.com/images/I/71l4vI8j0sL._AC_SL1500_.jpg",
  },
  {
    id: "aub-market-18",
    listingId: "a1b2c3d4-0018-4000-8000-ef1234567890",
    productName: "Data Structures Textbook",
    author: "Maya K.",
    userId: "featured-user-18",
    price: 24,
    description: "Clean copy with useful margin notes for CS students.",
    category: "Books, Study & Office Supplies",
    imageUrl: "https://m.media-amazon.com/images/I/81c54fA1BUL._SL1500_.jpg",
  },
  {
    id: "aub-market-19",
    listingId: "a1b2c3d4-0019-4000-8000-ef1234567890",
    productName: "A4 Binder Set",
    author: "Salma W.",
    userId: "featured-user-19",
    price: 10,
    description: "Set of 3 sturdy binders for lecture notes, handouts, and lab sheets.",
    category: "Books, Study & Office Supplies",
    imageUrl: "https://m.media-amazon.com/images/I/81BqFn8H0zL._AC_SL1500_.jpg",
  },
  {
    id: "aub-market-20",
    listingId: "a1b2c3d4-0020-4000-8000-ef1234567890",
    productName: "Desk Organizer",
    author: "Rana P.",
    userId: "featured-user-20",
    price: 11,
    description: "Keeps pens, sticky notes, chargers, and stationery organized.",
    category: "Books, Study & Office Supplies",
    imageUrl: "https://m.media-amazon.com/images/I/71i4Jf0nBVL._AC_SL1500_.jpg",
  },
  {
    id: "aub-market-21",
    listingId: "a1b2c3d4-0021-4000-8000-ef1234567890",
    productName: "Twin Bed Comforter Set",
    author: "Lara E.",
    userId: "featured-user-21",
    price: 40,
    description: "Soft bedding set for dorm rooms or student apartments.",
    category: "Furniture & Home Goods",
    imageUrl: "https://m.media-amazon.com/images/I/81gk0M6M6AL._AC_SL1500_.jpg",
  },
  {
    id: "aub-market-22",
    listingId: "a1b2c3d4-0022-4000-8000-ef1234567890",
    productName: "Storage Shelves",
    author: "Bassel N.",
    userId: "featured-user-22",
    price: 55,
    description: "Practical shelf unit for books, clothes, or kitchen supplies.",
    category: "Furniture & Home Goods",
    imageUrl: "https://m.media-amazon.com/images/I/71w9jS7cKLL._AC_SL1500_.jpg",
  },
  {
    id: "aub-market-23",
    listingId: "a1b2c3d4-0023-4000-8000-ef1234567890",
    productName: "Bean Bag Chair",
    author: "Hiba C.",
    userId: "featured-user-23",
    price: 48,
    description: "Comfortable seating for dorms and living rooms.",
    category: "Furniture & Home Goods",
    imageUrl: "https://m.media-amazon.com/images/I/81G2xWQ3X-L._AC_SL1500_.jpg",
  },
  {
    id: "aub-market-24",
    listingId: "a1b2c3d4-0024-4000-8000-ef1234567890",
    productName: "Denim Jacket - Small",
    author: "Aya Z.",
    userId: "featured-user-24",
    price: 26,
    description: "Classic denim jacket in very good condition.",
    category: "Clothing & Accessories",
    imageUrl: "https://m.media-amazon.com/images/I/81qQ4D6n1gL._AC_UY1000_.jpg",
  },
  {
    id: "aub-market-25",
    listingId: "a1b2c3d4-0025-4000-8000-ef1234567890",
    productName: "Backpack for University",
    author: "Ali G.",
    userId: "featured-user-25",
    price: 19,
    description: "Spacious backpack with laptop compartment and side pockets.",
    category: "Clothing & Accessories",
    imageUrl: "https://m.media-amazon.com/images/I/81KEKEDFU4L._AC_SL1500_.jpg",
  },
  {
    id: "aub-market-26",
    listingId: "a1b2c3d4-0026-4000-8000-ef1234567890",
    productName: "Baseball Cap",
    author: "Sami J.",
    userId: "featured-user-26",
    price: 8,
    description: "Simple everyday cap for sunny campus days.",
    category: "Clothing & Accessories",
    imageUrl: "https://m.media-amazon.com/images/I/71lTY0I6w-L._AC_UX679_.jpg",
  },
  {
    id: "aub-market-27",
    listingId: "a1b2c3d4-0027-4000-8000-ef1234567890",
    productName: "Yoga Mat",
    author: "Dima R.",
    userId: "featured-user-27",
    price: 16,
    description: "Lightweight mat for workouts, stretching, or dorm exercise routines.",
    category: "Other",
    imageUrl: "https://m.media-amazon.com/images/I/71I+3t9Q2-L._AC_SL1500_.jpg",
  },
  {
    id: "aub-market-28",
    listingId: "a1b2c3d4-0028-4000-8000-ef1234567890",
    productName: "Sketching Kit",
    author: "Farah T.",
    userId: "featured-user-28",
    price: 15,
    description: "Drawing pencils and accessories for art students and hobbyists.",
    category: "Other",
    imageUrl: "https://m.media-amazon.com/images/I/81cL3S0sWjL._AC_SL1500_.jpg",
  },
  {
    id: "aub-market-29",
    listingId: "a1b2c3d4-0029-4000-8000-ef1234567890",
    productName: "Table Tennis Racket Set",
    author: "Nabil F.",
    userId: "featured-user-29",
    price: 21,
    description: "Set of rackets and balls for casual games with friends.",
    category: "Other",
    imageUrl: "https://m.media-amazon.com/images/I/81rL5dKOrJL._AC_SL1500_.jpg",
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
    listingId: null,
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
    const shouldUseFeaturedFallback = FEATURE_FLAGS.mockData
      || (apiListings.length === 0 && apiError);
    const sourceListings = shouldUseFeaturedFallback
      ? (apiListings.length > 0 ? apiListings : FEATURED_AUB_MARKETPLACE_ITEMS)
      : apiListings;
    return sourceListings.map(toListingShape);
  }, [apiError, apiListings, isLoading]);

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
