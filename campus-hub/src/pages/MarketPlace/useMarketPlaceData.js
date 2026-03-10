import { useState, useMemo } from "react";
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
  const items = useMemo(() => FEATURED_AUB_MARKETPLACE_ITEMS.map(toListingShape), []);

  const refetch = useMemo(() => () => {}, []);

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
    apiError: "",
    refetch,
  };
}
