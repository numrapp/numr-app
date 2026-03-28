export interface User {
  id: number;
  email: string;
  company_name: string;
  company_address: string;
  company_postcode: string;
  company_city: string;
  kvk_number: string;
  btw_number: string;
  iban: string;
  phone: string;
  logo_path: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  default_payment_days: number;
  invoice_prefix: string;
  next_invoice_number: number;
  deepl_api_key: string;
}

export interface Client {
  id: number;
  user_id: number;
  company_name: string;
  contact_name: string;
  email: string;
  address: string;
  postcode: string;
  city: string;
  country: string;
  kvk_number: string;
  btw_number: string;
  created_at: string;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  btw_rate: number;
  btw_amount?: number;
  line_total?: number;
}

export interface Invoice {
  id: number;
  user_id: number;
  client_id: number;
  invoice_number: string;
  invoice_date: string;
  delivery_date: string;
  due_date: string;
  payment_terms_days: number;
  description: string;
  subtotal: number;
  btw_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid';
  pdf_path: string;
  sent_at: string | null;
  created_at: string;
  items?: InvoiceItem[];
  client?: Client;
  client_name?: string;
  client_email?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  company_name: string;
  company_address: string;
  company_postcode: string;
  company_city: string;
  kvk_number: string;
  btw_number: string;
  iban: string;
  phone: string;
}
