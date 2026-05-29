export type NumberStatus = "available" | "reserved" | "paid" | "cancelled";
export type OrderStatus = "awaiting_payment" | "proof_sent" | "paid" | "cancelled";

export type Campaign = {
  id: string;
  title: string;
  beneficiary_name: string;
  story: string;
  surgery_text: string | null;
  hope_text: string | null;
  goal_amount: number;
  ticket_price: number;
  total_numbers: number;
  pix_key: string;
  pix_receiver_name: string;
  whatsapp_contact: string;
  draw_date: string | null;
  image_url: string | null;
  legal_notice: string | null;
  authorization_number: string | null;
  regulation_url: string | null;
};

export type RaffleNumber = {
  id: string;
  number: number;
  status: NumberStatus;
  order_id: string | null;
  buyer_name: string | null;
  buyer_whatsapp: string | null;
};

export type Order = {
  id: string;
  campaign_id: string;
  buyer_name: string;
  buyer_whatsapp: string;
  buyer_city: string;
  buyer_state: string;
  buyer_email: string | null;
  selected_numbers: number[];
  total_amount: number;
  status: OrderStatus;
  payment_proof_url: string | null;
  created_at: string;
  updated_at: string;
};
