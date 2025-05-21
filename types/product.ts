export interface ProductTag {
  id: string;
  product_id: string;
  video_id: string;
  position_x: number; // Percentage 0-100
  position_y: number; // Percentage 0-100
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  store_id: string; // ID of the business user/store
}
