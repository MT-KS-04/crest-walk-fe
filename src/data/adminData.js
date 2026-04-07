import { products } from "./products";

export const mockOrders = [
  {
    id: "ORD-001", customerName: "Nguyễn Văn A", customerEmail: "a@gmail.com", customerPhone: "0901111111",
    address: "123 Lê Lợi, Q.1, TP.HCM",
    items: [{ productId: "1", productName: "Air Max 90", size: 42, quantity: 1, price: 3200000 }],
    totalAmount: 3200000, status: "delivered", paymentMethod: "online", paymentStatus: "paid", createdAt: "2026-04-01",
  },
  {
    id: "ORD-002", customerName: "Trần Thị B", customerEmail: "b@gmail.com", customerPhone: "0902222222",
    address: "456 Nguyễn Huệ, Q.1, TP.HCM",
    items: [{ productId: "3", productName: "Air Jordan 1 Retro High", size: 41, quantity: 1, price: 5200000 }, { productId: "6", productName: "Chuck Taylor All Star", size: 39, quantity: 2, price: 1500000 }],
    totalAmount: 8200000, status: "shipping", paymentMethod: "cod", paymentStatus: "unpaid", createdAt: "2026-04-02",
  },
  {
    id: "ORD-003", customerName: "Lê Minh C", customerEmail: "c@gmail.com", customerPhone: "0903333333",
    address: "789 Hai Bà Trưng, Q.3, TP.HCM",
    items: [{ productId: "2", productName: "Ultraboost 22", size: 43, quantity: 1, price: 4500000 }],
    totalAmount: 4500000, status: "confirmed", paymentMethod: "online", paymentStatus: "paid", createdAt: "2026-04-03",
  },
  {
    id: "ORD-004", customerName: "Phạm D", customerEmail: "d@gmail.com", customerPhone: "0904444444",
    address: "12 Võ Văn Tần, Q.3, TP.HCM",
    items: [{ productId: "7", productName: "Air Force 1 '07", size: 40, quantity: 1, price: 2700000 }],
    totalAmount: 2700000, status: "pending", paymentMethod: "cod", paymentStatus: "unpaid", createdAt: "2026-04-04",
  },
  {
    id: "ORD-005", customerName: "Hoàng E", customerEmail: "e@gmail.com", customerPhone: "0905555555",
    address: "34 Pasteur, Q.1, TP.HCM",
    items: [{ productId: "4", productName: "574 Classic", size: 41, quantity: 2, price: 2800000 }],
    totalAmount: 5600000, status: "cancelled", paymentMethod: "online", paymentStatus: "paid", createdAt: "2026-04-04",
  },
];

export const mockCategories = [
  { id: "cat-1", name: "Running", slug: "running", productCount: 2 },
  { id: "cat-2", name: "Basketball", slug: "basketball", productCount: 1 },
  { id: "cat-3", name: "Lifestyle", slug: "lifestyle", productCount: 4 },
  { id: "cat-4", name: "Training", slug: "training", productCount: 0 },
  { id: "cat-5", name: "Skateboarding", slug: "skateboarding", productCount: 0 },
];

export const mockUsers = [
  { id: "u1", name: "Nguyễn Văn A", email: "a@gmail.com", phone: "0901111111", totalOrders: 5, totalSpent: 15000000, status: "active", createdAt: "2026-01-15" },
  { id: "u2", name: "Trần Thị B", email: "b@gmail.com", phone: "0902222222", totalOrders: 3, totalSpent: 12000000, status: "active", createdAt: "2026-02-10" },
  { id: "u3", name: "Lê Minh C", email: "c@gmail.com", phone: "0903333333", totalOrders: 2, totalSpent: 9000000, status: "active", createdAt: "2026-02-28" },
  { id: "u4", name: "Phạm D", email: "d@gmail.com", phone: "0904444444", totalOrders: 1, totalSpent: 2700000, status: "blocked", createdAt: "2026-03-05" },
  { id: "u5", name: "Hoàng E", email: "e@gmail.com", phone: "0905555555", totalOrders: 4, totalSpent: 18000000, status: "active", createdAt: "2026-03-20" },
];

export const mockPromotions = [
  { id: "promo-1", code: "SUMMER2026", description: "Giảm 20% cho mùa hè", discountType: "percent", discountValue: 20, minOrder: 1000000, maxUses: 100, usedCount: 45, startDate: "2026-04-01", endDate: "2026-06-30", isActive: true },
  { id: "promo-2", code: "NEWUSER", description: "Giảm 100K cho khách mới", discountType: "fixed", discountValue: 100000, minOrder: 500000, maxUses: 500, usedCount: 123, startDate: "2026-01-01", endDate: "2026-12-31", isActive: true },
  { id: "promo-3", code: "FLASH50", description: "Flash sale giảm 50%", discountType: "percent", discountValue: 50, minOrder: 2000000, maxUses: 20, usedCount: 20, startDate: "2026-03-01", endDate: "2026-03-02", isActive: false },
];

export const mockReviews = [
  { id: "r1", productId: "1", productName: "Air Max 90", userName: "Nguyễn Văn A", rating: 5, comment: "Giày rất đẹp, đi rất êm!", status: "approved", createdAt: "2026-04-02" },
  { id: "r2", productId: "3", productName: "Air Jordan 1 Retro High", userName: "Trần Thị B", rating: 4, comment: "Chất lượng tốt, giao hàng nhanh.", status: "approved", createdAt: "2026-04-03" },
  { id: "r3", productId: "7", productName: "Air Force 1 '07", userName: "Anonymous", rating: 1, comment: "Hàng fake, rất tệ!", status: "pending", createdAt: "2026-04-04" },
  { id: "r4", productId: "2", productName: "Ultraboost 22", userName: "Lê Minh C", rating: 5, comment: "Chạy bộ cực kỳ êm ái, recommend!", status: "pending", createdAt: "2026-04-04" },
];

export const mockBanners = [
  { id: "b1", title: "Summer Sale 2026", imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200", link: "/products?sale=true", position: "hero", isActive: true, order: 1 },
  { id: "b2", title: "New Arrivals", imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200", link: "/products?isNew=true", position: "hero", isActive: true, order: 2 },
  { id: "b3", title: "Jordan Collection", imageUrl: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600", link: "/products?brand=Jordan", position: "sidebar", isActive: false, order: 3 },
];

// Revenue data for charts
export const revenueData = {
  daily: [
    { date: "01/04", revenue: 3200000, orders: 1 },
    { date: "02/04", revenue: 8200000, orders: 1 },
    { date: "03/04", revenue: 4500000, orders: 1 },
    { date: "04/04", revenue: 8300000, orders: 2 },
    { date: "05/04", revenue: 6100000, orders: 2 },
  ],
  monthly: [
    { date: "T1", revenue: 45000000, orders: 12 },
    { date: "T2", revenue: 62000000, orders: 18 },
    { date: "T3", revenue: 78000000, orders: 24 },
    { date: "T4", revenue: 30300000, orders: 7 },
  ],
};

export const bestSelling = [
  { name: "Air Force 1 '07", brand: "Nike", sold: 156, revenue: 421200000 },
  { name: "Air Jordan 1 Retro High", brand: "Jordan", sold: 98, revenue: 509600000 },
  { name: "Chuck Taylor All Star", brand: "Converse", sold: 89, revenue: 133500000 },
  { name: "Ultraboost 22", brand: "Adidas", sold: 76, revenue: 342000000 },
  { name: "Air Max 90", brand: "Nike", sold: 67, revenue: 214400000 },
];
