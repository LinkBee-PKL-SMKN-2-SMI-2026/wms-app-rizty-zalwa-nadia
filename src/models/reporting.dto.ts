export interface SummaryResponse {
  totalProducts: number;
  totalCategories: number;
  totalLocations: number;
  totalStockInboundToday: number;
  totalStockOutboundToday: number;
  totalUsers: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minimumStock: number;
  categoryName: string;
  locationName: string;
}
