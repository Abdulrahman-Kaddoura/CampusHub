import bookImg from "./assets/book.jpg";
import book2Img from "./assets/book2.jpg";
import book4Img from "./assets/book4.webp";
import organicChemImg from "./assets/organic-chem.svg";

const placeholder = (id, w = 400, h = 300) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop`;

export const products = [
  {
    id: 1,
    productName: "Thomas Calculus 11th Edition",
    author: "Sarah Williams",
    price: 55,
    description: "Brand new. No writings.",
    category: "Books",
    productImage: bookImg,
  },
  {
    id: 2,
    productName: "Probability & Random Processes",
    author: "James Hugh",
    price: 49,
    description: "Fairly used, good condition.",
    category: "Books",
    productImage: book2Img,
  },
  {
    id: 3,
    productName: "Vintage Hoodie",
    author: "Alex Brown",
    price: 30,
    description: "Comfortable and warm.",
    category: "Clothing",
    productImage: placeholder("1556821840-0aaf85586236"),
  },
  {
    id: 4,
    productName: "Desk Lamp",
    author: "Sarah Williams",
    price: 25,
    description: "Perfect for study desks.",
    category: "Room Decor",
    productImage: placeholder("1524484485835-2a3e2c8e8c3a"),
  },
  {
    id: 5,
    productName: "Organic Chemistry 2nd Ed",
    author: "John Doe",
    price: 42,
    description: "Sample description of the item's current state.",
    category: "Books",
    productImage: organicChemImg,
    discountPercent: 50,
  },
  {
    id: 6,
    productName: "Graphing Calculator",
    author: "John Doe",
    price: 35,
    description: "Sample description of the item's current state.",
    category: "Books",
    productImage: book4Img,
    discountPercent: 56,
  },
];
