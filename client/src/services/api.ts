import { Product, Category } from "@shared/schema";

const API_BASE_URL = '/api';

export const api = {
  // Fetch all products with optional filters
  getProducts: async (params?: { 
    categoryId?: string;
    search?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<Product[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },
  
  // Fetch all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },
  
  // Fetch featured products (you can customize this based on your requirements)
  getFeaturedProducts: async (limit: number = 8): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products/featured?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch featured products');
    return response.json();
  },
  
  // Fetch products by category
  getProductsByCategory: async (categoryId: string, limit: number = 4): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/products?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch products by category');
    return response.json();
  }
};
