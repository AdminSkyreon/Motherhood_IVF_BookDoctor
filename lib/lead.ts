import { INDIAN_MOBILE } from "@/lib/format";

export function isValidLead(lead: { name: string; phone: string; consent: boolean }) {
  return lead.name.trim().length >= 2 && INDIAN_MOBILE.test(lead.phone) && lead.consent;
}
