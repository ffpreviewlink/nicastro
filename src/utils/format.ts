import { site } from '../data/site';

/** "Via Vittorio Bachelet, 15, 62024 Matelica (MC)" */
export const formatAddress = ({ street, postalCode, city, province } = site.address): string =>
  `${street}, ${postalCode} ${city} (${province})`;

/** Numero WhatsApp leggibile, es. "+39 328 653 7596" (formato italiano); altrimenti "+cifre". */
export function formatWhatsappNumber(number: string = site.whatsapp.number): string {
  const d = number.replace(/\D/g, '');
  return d.startsWith('39') && d.length === 12
    ? `+39 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`
    : `+${d}`;
}
