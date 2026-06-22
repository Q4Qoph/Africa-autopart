// ─── /api/Vin/allVehicles item ──────────────────────────────────────────────
export interface VehicleSummary {
  vin_id: string
  vin: string
  vin_type: string
  brand: string
  model_name: string
  model_year: number
  production_date: string
  market_region: string
  nation_or_market_code: string
  model_code: string
  trim_grade: string
  body_type: string
  drive_type: string
  steering_position: string
  fuel_type: string
  engine_code: string
  engine_number: string
  engine_displacement: string
  engine_configuration: string
  transmission_code: string
  transmission_type: string
  color_code: string
  color_name: string
  emission_standard: string
  remarks: string
  created_at: string
}

// ─── /api/Vin/getPartsByVin/{vin} response ──────────────────────────────────
export interface VinPart {
  part_id: string
  callout_code: string
  item_number: number
  part_number: string
  part_name: string
  part_description: string
  part_type: string
  quantity_required: number
  unit_of_measure: string
  remarks: string
  production_date_from: string
  production_date_to: string | null
  fitment_note: string
  side: string
  material: string
  criticality_level: string
  service_interval_note: string
  replacement_difficulty: string
  requires_programming: boolean
  requires_calibration: boolean
  related_tools_needed: string
  diagram_coordinate_x: number
  diagram_coordinate_y: number
  diagram_callout_shape: string
  primary_image_id: string
  thumbnail_image_id: string
}

export interface VinCategory {
  category_id: string
  category_code: string
  category_name: string
  category_description: string
  sort_order: number
  category_icon_identifier: string
  category_thumbnail_image_id: string
  parts: VinPart[]
}

export interface VinPartsResponse {
  vin_id: string
  vin: string
  vin_type: string
  brand: string
  model_name: string
  model_year: number
  production_date: string
  market_region: string
  nation_or_market_code: string
  model_code: string
  trim_grade: string
  body_type: string
  drive_type: string
  steering_position: string
  fuel_type: string
  engine_code: string
  engine_number: string
  engine_displacement: string
  engine_configuration: string
  transmission_code: string
  transmission_type: string
  color_code: string
  color_name: string
  emission_standard: string
  remarks: string
  created_at: string
  categories: VinCategory[]
}

// ─── /api/Vin/getPartByPartId/{partId} response ────────────────────────────
export interface PartMarketData {
  market_data_id: string
  part_id: string
  part_number: string
  display_name: string
  brand_make: string
  manufacturer_family: string
  availability_count: number
  availability_status: string
  demo_price_usd: number
  demo_price_local_currency: number
  local_currency_code: string
  supplier_code: string
  supplier_name: string
  warehouse_location: string
  estimated_dispatch_days: number
  estimated_shipping_days: number
  weight_kg: number
  dimensions_l_cm: number
  dimensions_w_cm: number
  dimensions_h_cm: number
  compatibility_status: string
  compatibility_note: string
  supersession_status: string
  commercial_notes: string
  is_demo_pricing: number
  part: VinPart
}

export interface PartDetailResponse {
  marketData: PartMarketData
  imageURL: string
}

// ─── POST /api/Vin/search/{vin} response ──────────────────────────────────
export interface VinSearchResponse {
  vin: string
  isValid: boolean
  errorCode: string
  errorText: string
  make: string
  model: string
  modelYear: string
  manufacturer: string
  vehicleType: string
  bodyClass: string
  series: string | null
  trim: string | null
  driveType: string | null
  transmissionStyle: string | null
  engineCylinders: string | null
  engineHP: string | null
  displacementL: string
  fuelTypePrimary: string
  plantCity: string
  plantState: string | null
  plantCountry: string
  gvwr: string
  doors: string
  rawAttributes: Record<string, string>
}

// ─── POST /api/Vin/search/parts/{category} response item ───────────────────
export interface VinSearchPart {
  partNumber: string
  name: string
  description: string
  price: number
}