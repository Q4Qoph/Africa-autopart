export default {
  // Page headers
  page_label: 'Part Requests',
  page_heading: 'My Requests',
  new_request_btn: '+ New Request',

  // New request
  new_label: 'New Request',
  new_heading: 'Request a Part',
  back_to_requests: '← Back to Requests',
  back_to_home: '← Back to Home',

  // Sections
  section_vehicle: 'Vehicle Details',
  section_part: 'Part Details',
  section_delivery: 'Delivery & Contact',
  section_images: 'Supporting Images',
  step_label: 'Step',

  // Vehicle fields
  field_make: 'Make *',
  field_model: 'Model *',
  field_year: 'Year *',
  field_engine: 'Engine Type',
  field_chassis: 'Chassis / VIN Number',

  // Part fields
  field_partName: 'Part Name *',
  field_partNumber: 'Part Number',
  field_condition: 'Condition Preference',
  field_urgency: 'Urgency',
  field_description: 'Description',
  field_description_placeholder: 'Additional details about the part or condition…',

  // Delivery fields
  field_country: 'Country *',
  field_phone: 'Phone *',
  field_email: 'Email *',
  field_email_hint: 'Use your account email to track this request after submission.',

  // Condition options
  condition_any: 'Any Condition',
  condition_oem: 'OEM',
  condition_aftermarket: 'Aftermarket',
  condition_secondHand: 'Second Hand',
  condition_openToAll: 'Open to All',

  // Urgency options
  urgency_standard: 'Standard — flexible timeline',
  urgency_express: 'Express — within a few days',
  urgency_urgent: 'Urgent — as soon as possible',

  // Short urgency labels (for badges)
  urgency_standard_short: 'Standard',
  urgency_express_short: 'Express',
  urgency_urgent_short: 'Urgent',

  // Images
  images_upload_label: 'Click to upload images of the damaged or reference part',
  images_format_hint: 'PNG, JPG supported',
  images_uploading: 'Uploading…',

  // Submit
  submit_btn: 'Submit Request',
  submit_loading: 'Submitting…',
  cancel_btn: 'Cancel',

  // Errors
  error_submit: 'Failed to submit request. Please try again.',
  error_image_upload: 'Image upload failed. Please try again.',
  error_load: 'Failed to load requests.',

  // Empty state
  empty_text: "You haven't submitted any requests yet.",
  empty_cta: 'Request your first part',

  // Guest success
  success_heading: 'Request submitted!',
  success_text: 'Your request has been sent to suppliers. They will reach out to you at',
  success_track_label: 'Want to track your request?',
  success_track_desc: 'Create a free account with the same email address to track your request status, view supplier quotes, and manage orders in one place.',
  success_create_account: 'Create Free Account',
  success_back_home: 'Back to Home',

  // Request detail
  detail_back: '← Back to Requests',
  detail_label: 'Request Details',
  detail_edit_heading: 'Edit Request',
  detail_field_partName: 'Part Name *',
  detail_field_partNumber: 'Part Number',
  detail_field_condition: 'Condition Preference',
  detail_field_urgency: 'Urgency',
  detail_field_country: 'Country',
  detail_field_phone: 'Phone',
  detail_field_email: 'Email',
  detail_field_description: 'Description',
  detail_field_make: 'Make',
  detail_field_model: 'Model',
  detail_field_year: 'Year',
  detail_vehicle_locked: 'Vehicle details are locked after submission',
  detail_save: 'Save Changes',
  detail_saving: 'Saving…',
  detail_edit_btn: 'Edit',
  detail_close_edit: 'Close Edit',
  detail_cancel_request: 'Cancel Request',
  detail_cancelling: 'Cancelling…',
  detail_confirm_cancel: 'Cancel this request? This cannot be undone.',
  detail_error_save: 'Failed to save changes. Please try again.',
  detail_error_load: 'Failed to load request details.',
  detail_cancel_fail: 'Failed to cancel request. Please try again.',

  // Detail labels
  detail_engine: 'Engine Type',
  detail_chassis: 'Chassis / VIN',
  detail_partNumber: 'Part Number',
  detail_condition: 'Condition',
  detail_country: 'Country',
  detail_submitted: 'Submitted',
  detail_description_label: 'Description',

  // Order section
  order_label: 'Order',
  order_awaiting: 'No order yet',
  order_awaiting_desc: 'Browse available parts and place your order.',
  order_find_parts_btn: 'Find Available Parts',
  order_part: 'Part',
  order_partNum: 'Part #',
  order_condition: 'Condition',
  order_supplier: 'Supplier',
  order_price: 'Price',
  order_status: 'Status',
  order_tracking: 'Tracking',
  order_date: 'Date',

  // Parts search page
  parts_heading: 'Available Parts for Your Request',
  parts_loading: 'Searching for matching parts…',
  parts_empty: 'No matching parts found. Try a different search.',
  parts_search_again: 'Search Again',
  parts_search_placeholder: 'Search for a part…',
  parts_order_btn: 'Order This Part',
  parts_ordering: 'Placing order…',
  parts_order_error: 'Failed to place order. Please try again.',
  parts_col_part: 'Part',
  parts_col_supplier: 'Supplier',
  parts_col_condition: 'Condition',
  parts_col_stock: 'Stock',
  parts_col_price: 'Price',
} as const
