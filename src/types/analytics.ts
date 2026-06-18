export type Analytics = {
  kpis: {
    currency: string;
    revenue: string;
    orders: number;
    paid_orders: number;
    avg_order_value: string;
    products: number;
    customers: number;
    low_stock: number;
  };
  orders_by_status: { status: string; label: string; count: number }[];
  revenue_by_day: { date: string; revenue: string; orders: number }[];
  top_products: { title: string; quantity: number; revenue: string }[];
  fulfillment_split: { type: string; quantity: number }[];
};
