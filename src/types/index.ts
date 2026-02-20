export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string;
  category: string;
  status: "available" | "reserved" | "sold";
  negotiable: boolean;
  city: string;
  bumpedAt: Date | null;
  district: string | null;
  views: number;
  userId: string;
  user?: User;
  conversations?: Conversation[];
  favorites?: Favorite[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string;
  district: string | null;
  image: string | null;
  mannerTemp: number;
  products?: Product[];
  buyerConversations?: Conversation[];
  sellerConversations?: Conversation[];
  sentMessages?: Message[];
  favorites?: Favorite[];
  reviewsReceived?: Review[];
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  nameFr: string;
  nameMg: string;
  icon: string | null;
}

export interface Conversation {
  id: string;
  productId: string;
  product?: Product;
  buyerId: string;
  buyer?: User;
  sellerId: string;
  seller?: User;
  messages?: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  conversationId: string;
  conversation?: Conversation;
  senderId: string;
  sender?: User;
  read: boolean;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  user?: User;
  productId: string;
  product?: Product;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: "message" | "favorite" | "product_sold" | "product_reserved" | "system";
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewer?: User;
  reviewedId: string;
  reviewed?: User;
  productId: string;
  rating: number;
  mannerItems: string; // JSON array
  content: string | null;
  createdAt: Date;
}

export interface PriceProposal {
  id: string;
  productId: string;
  product?: Product;
  buyerId: string;
  buyer?: User;
  sellerId: string;
  seller?: User;
  proposedPrice: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  city?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  search?: string;
}

export const CITIES: Record<string, string[]> = {
  Antananarivo: ["Analakely", "Isotry", "Andravoahangy", "Ivandry", "Ankadifotsy", "Ankorondrano"],
  Toamasina: ["Centre-ville", "Bazar-be", "Ankirihiry"],
  Antsirabe: ["Centre-ville", "Ambohijanaka"],
  Fianarantsoa: ["Haute-ville", "Tsianolondroa"],
  Mahajanga: ["Centre-ville", "Amborovy"],
  Toliara: ["Centre-ville", "Mahavatse"],
};

export const CATEGORIES = [
  { name: "electronics", nameFr: "Électronique", nameMg: "Elektronika", icon: "💻" },
  { name: "vehicles", nameFr: "Véhicules", nameMg: "Fiara", icon: "🚗" },
  { name: "property", nameFr: "Immobilier", nameMg: "Trano", icon: "🏠" },
  { name: "clothing", nameFr: "Vêtements", nameMg: "Akanjo", icon: "👕" },
  { name: "furniture", nameFr: "Meubles", nameMg: "Fanaka", icon: "🪑" },
  { name: "appliances", nameFr: "Électroménager", nameMg: "Fitaovana", icon: "🔌" },
  { name: "sports", nameFr: "Sports & Loisirs", nameMg: "Fanatanjahantena", icon: "⚽" },
  { name: "books", nameFr: "Livres", nameMg: "Boky", icon: "📚" },
  { name: "services", nameFr: "Services", nameMg: "Serivisy", icon: "🔧" },
  { name: "other", nameFr: "Autres", nameMg: "Hafa", icon: "📦" },
];

export const PRICE_RANGES = [
  { label: "free", min: 0, max: 0 },
  { label: "under5k", min: 1, max: 5000 },
  { label: "5k-20k", min: 5000, max: 20000 },
  { label: "20k-100k", min: 20000, max: 100000 },
  { label: "100k-500k", min: 100000, max: 500000 },
  { label: "over500k", min: 500000, max: Infinity },
];
