import { z } from "zod";
import { onlyDigits } from "./utils";

export const checkoutSchema = z.object({
  buyer_name: z.string().min(3, "Informe o nome completo."),
  buyer_whatsapp: z.string().refine((value) => onlyDigits(value).length >= 10, "Informe um WhatsApp válido."),
  buyer_city: z.string().min(2, "Informe a cidade."),
  buyer_state: z.string().min(2, "Informe o estado.").max(2, "Use a UF com 2 letras."),
  buyer_email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  selected_numbers: z.array(z.number().int().positive()).min(1, "Escolha pelo menos 1 número.")
});

export const consultSchema = z.object({
  query: z.string().min(3, "Informe o WhatsApp ou código do pedido.")
});

export const campaignSchema = z.object({
  title: z.string().min(3),
  beneficiary_name: z.string().min(2),
  story: z.string().min(10),
  surgery_text: z.string().optional(),
  hope_text: z.string().optional(),
  goal_amount: z.coerce.number().positive(),
  ticket_price: z.coerce.number().positive(),
  total_numbers: z.coerce.number().int().min(1).max(10000),
  pix_key: z.string().min(3),
  pix_receiver_name: z.string().min(2),
  whatsapp_contact: z.string().min(10),
  draw_date: z.string().optional(),
  image_url: z.string().optional(),
  legal_notice: z.string().optional(),
  authorization_number: z.string().optional(),
  regulation_url: z.string().optional()
});
