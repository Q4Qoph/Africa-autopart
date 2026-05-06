/** Shape returned by GET /api/Inventory/getAllAdverts & GET /api/Inventory/getInventory/{id} */
export interface InventoryItem {
  id: number
  partName: string
  description: string
  vehicleMake: string
  vehicleModel: string
  price: number
  supplierName: string
  imageURL: string
}

/** DTO for POST /api/Inventory/addAdvert & PUT /api/Inventory/updateInventory/{id} */
export interface AddInventoryDTO {
  partName: string
  description: string
  vehicleMake: string
  vehicleModel: string
  price: number
  supplierName: string
  imageURL: string
}

// InventoryOrder status enum
export const InventoryOrderStatus = {
  Pending:    0,
  Paid:       1,
  InTransit:  2,
  Delivered:  3,
  Cancelled:  4,
} as const;

export type InventoryOrderStatusValue = typeof InventoryOrderStatus[keyof typeof InventoryOrderStatus];

// ---- DTOs ----
export interface CreateOrderItemDto {
  inventoryId: number;
  quantity: number;
}

export interface NewShipmentDTO {
  city: string;
  postalCode: string;
  county: string;
}

export interface CreateInventoryOrderDTO {
  userId: number;
  items: CreateOrderItemDto[];
  shipment: NewShipmentDTO;
}

// ---- Response shapes ----
export interface InventoryOrderItem {
  quantity: number;
  inventory: InventoryItem;        // re-uses InventoryItem from earlier
  priceAtPurchase: number;
}

export interface Shipment {
  city: string | null;
  postalCode: string | null;
  county: string | null;
}

export interface InventoryOrderResponse {
  id: number;
  status: number;
  totalAmount: number;
  userId: number;
  items: InventoryOrderItem[];
  shipment: Shipment;
}