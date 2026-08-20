// ============================================================
// SBR POS — Database Type Definitions
// Matches exactly the Supabase schema from migration 001
// ============================================================

export type UserRole = 'super_admin' | 'kasir' | 'admin_gudang' | 'sales'
export type UserStatus = 'active' | 'inactive'
export type CustomerCategory = 'retail' | 'grosir' | 'horeca'
export type PaymentMethod = 'tunai' | 'transfer' | 'qris' | 'tempo'
export type DebtPaymentMethod = 'tunai' | 'transfer' | 'qris'
export type PaymentStatus = 'lunas' | 'piutang'
export type TransactionType = 'sale' | 'retur'
export type ExpenseCategory = 'operasional' | 'logistik' | 'sdm' | 'lain-lain'
export type StockAdjustmentType = 'tambah' | 'kurang' | 'opname' | 'retur_masuk'
export type CashTransactionType = 'setor_kas' | 'tarik_kas' | 'mutasi_ke_bank' | 'mutasi_ke_kas'

// ============================================================
// Table row types
// ============================================================

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
  branch_id: string | null
  id_role: string | null
  custom_permissions: string[] | null
  // Joined
  branch?: Branch | null
}

export interface Branch {
  id: string
  name: string
  address: string | null
  phone: string | null
  instagram: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Warehouse {
  id: string
  branch_id: string | null
  name: string
  address: string | null
  is_active: boolean
  code?: string
  created_at: string
  updated_at: string
  // Joined
  branches?: { id: string, name: string } | null
}

export interface StoreSettings {
  id: string
  store_name: string
  store_address: string | null
  store_phone: string | null
  receipt_footer_text: string | null
  tax_percentage: number
  social_instagram: string | null
  store_website: string | null
  payment_cash: boolean
  payment_transfer: boolean
  payment_qris: boolean
  payment_tempo: boolean
  bank_name: string | null
  bank_account_number: string | null
  bank_account_name: string | null
  qris_image_url: string | null
  logo_url: string | null
  updated_at: string
}

export interface Product {
  id: string
  name: string
  category: string | null
  sku: string
  barcode: string | null
  unit: string
  hpp: number
  price_retail: number
  price_grosir: number | null
  price_horeca: number | null
  stock_quantity: number
  min_stock_alert: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined
  product_stocks?: ProductStock[]
}

export interface ProductStock {
  id: string
  product_id: string
  warehouse_id: string
  stock_quantity: number
  min_stock_alert: number
  updated_at: string
  // Joined
  warehouse?: Warehouse | null
}

export interface ProductBatch {
  id: string
  product_id: string
  warehouse_id: string
  batch_number: string | null
  stock_quantity: number
  production_date: string | null
  exp_date: string | null
  created_at: string
  updated_at: string
  // Joined
  product?: Product | null
  warehouse?: Warehouse | null
}

export interface Customer {
  id: string
  name: string
  phone: string | null
  address: string | null
  category: CustomerCategory
  credit_limit: number
  payment_terms: string
  current_debt: number
  is_active: boolean
  code?: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  invoice_number: string
  customer_id: string | null
  user_id: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  due_date: string | null
  amount_paid: number
  notes: string | null
  transaction_type: TransactionType
  original_transaction_id: string | null
  status: 'completed' | 'voided'
  order_status: 'pending' | 'approved' | 'processing' | 'completed' | 'cancelled'
  branch_id: string
  warehouse_id: string | null
  created_at: string
  // Joined
  customer?: Customer | null
  user?: Profile | null
  branch?: Branch | null
  warehouse?: Warehouse | null
  items?: TransactionItem[]
}

export interface TransactionItem {
  id: string
  transaction_id: string
  product_id: string
  product_name: string
  product_sku: string
  qty: number
  unit: string
  unit_price: number
  hpp_snapshot: number
  discount_amount: number
  subtotal: number
  // Joined
  product?: Product | null
}

export interface Expense {
  id: string
  user_id: string
  category: ExpenseCategory
  amount: number
  payment_method: PaymentMethod
  description: string | null
  receipt_url: string | null
  expense_date: string
  branch_id: string
  created_at: string
  // Joined
  user?: Profile | null
  branch?: Branch | null
}

export interface StockTransfer {
  id: string
  reference_number: string
  from_warehouse_id: string
  to_warehouse_id: string
  user_id: string
  received_by: string | null
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  transfer_date: string
  receive_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined
  from_warehouse?: Warehouse | null
  to_warehouse?: Warehouse | null
  user?: Profile | null
  receiver?: Profile | null
  items?: StockTransferItem[]
}

export interface StockTransferItem {
  id: string
  transfer_id: string
  product_id: string
  batch_id: string | null
  qty_sent: number
  qty_received: number
  notes: string | null
  // Joined
  product?: Product | null
  batch?: ProductBatch | null
}

export interface StockAdjustment {
  id: string
  product_id: string
  user_id: string
  type: StockAdjustmentType
  qty_before: number
  qty_change: number
  qty_after: number
  reason: string | null
  reference_id: string | null
  branch_id: string
  created_at: string
  // Joined
  product?: Product | null
  user?: Profile | null
  branch?: Branch | null
}

export interface DebtPayment {
  id: string
  transaction_id: string
  customer_id: string
  user_id: string
  amount: number
  payment_method: DebtPaymentMethod
  notes: string | null
  branch_id: string
  payment_date: string
  // Joined
  transaction?: Transaction | null
  customer?: Customer | null
  user?: Profile | null
  branch?: Branch | null
}

export interface Category {
  id: string
  name: string
  code?: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  address: string | null
  payment_terms: string
  is_active: boolean
  code?: string
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  invoice_number: string
  supplier_id: string | null
  user_id: string
  total_amount: number
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  purchase_date: string
  notes: string | null
  branch_id: string
  created_at: string
  updated_at: string
  // Joined
  supplier?: Supplier | null
  user?: Profile | null
  branch?: Branch | null
  items?: PurchaseItem[]
}

export interface PurchaseItem {
  id: string
  purchase_id: string
  product_id: string
  qty: number
  unit_price: number
  subtotal: number
  // Joined
  product?: Product | null
}

export interface CashierShift {
  id: string
  user_id: string
  start_time: string
  end_time: string | null
  starting_cash: number
  ending_cash_system: number | null
  ending_cash_actual: number | null
  status: 'open' | 'closed'
  notes: string | null
  created_at: string
  updated_at: string
  // Joined
  user?: Profile | null
}

export interface CashTransaction {
  id: string
  user_id: string
  type: CashTransactionType
  amount: number
  payment_method: PaymentMethod
  description: string | null
  transaction_date: string
  created_at: string
  updated_at: string
  // Joined
  user?: Profile | null
}

// ============================================================
// Cart types (POS)
// ============================================================

export interface CartItem {
  product: Product
  qty: number
  unit_price: number
  discount_amount: number
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  customer: Customer | null
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
}

// ============================================================
// Dashboard types
// ============================================================

export interface DashboardSummary {
  today_revenue: number
  today_revenue_change: number // % change from yesterday
  active_receivables: number
  monthly_expenses: number
  monthly_net_profit: number
  monthly_net_profit_change: number
}

export interface SalesChartData {
  date: string
  revenue: number
  transactions: number
  profit: number
}

export interface TopProduct {
  product_id: string
  product_name: string
  total_qty: number
  total_revenue: number
  total_profit: number
}

// ============================================================
// Report types
// ============================================================

export interface ProfitLossReport {
  period_start: string
  period_end: string
  gross_revenue: number
  total_discount: number
  net_revenue: number
  total_hpp: number
  gross_profit: number
  expenses_operasional: number
  expenses_logistik: number
  expenses_sdm: number
  expenses_other: number
  total_expenses: number
  net_profit: number
}

// ============================================================
// Form types
// ============================================================

export interface ProductForm {
  name: string
  category: string
  sku?: string
  barcode?: string
  unit: string
  hpp: number
  price_retail: number
  price_grosir?: number
  price_horeca?: number
  stock_quantity: number
  min_stock_alert: number
  image_url?: string
  is_active: boolean
}

export interface CustomerForm {
  name: string
  phone?: string
  address?: string
  category: CustomerCategory
  credit_limit: number
  code?: string
  notes?: string
}

export interface ExpenseForm {
  category: ExpenseCategory
  amount: number
  description?: string
  expense_date: string
  receipt_url?: string
}

export interface CheckoutPayload {
  customer_id?: string
  items: Array<{
    product_id: string
    qty: number
    unit_price: number
    hpp_snapshot: number
    discount_amount: number
    subtotal: number
  }>
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  payment_method: PaymentMethod
  due_date?: string
  notes?: string
}

export interface CategoryForm {
  name: string
  description?: string
}

export interface Unit {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface UnitForm {
  name: string
  description?: string
}

export interface SupplierForm {
  name: string
  contact_person?: string
  phone?: string
  address?: string
  payment_terms: string
  code?: string
  is_active: boolean
}

export interface PurchaseForm {
  supplier_id: string
  invoice_number: string
  purchase_date: string
  payment_status: PaymentStatus
  notes?: string
  items: Array<{
    product_id: string
    qty: number
    unit_price: number
    subtotal: number
  }>
  total_amount: number
}
