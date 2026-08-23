export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ShopCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface ShopOrderConfirmation {
  id: string;
  reference: string;
  businessName: string;
  total: number;
}
