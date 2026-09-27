import { site } from '../data/site';
import { hasValue } from './placeholder';

const digits = site.whatsapp.number.replace(/\D/g, '');

/** Vero quando in site.whatsapp.number c'è un numero reale. */
export const isWhatsappConfigured = hasValue(site.whatsapp.number) && digits.length >= 8;

let warned = false;

/**
 * Link WhatsApp con messaggio precompilato.
 * Il numero arriva da src/data/site.ts. Finché è un segnaposto il link porta
 * alla pagina Contatti, così nessun pulsante resta senza destinazione.
 */
export function whatsappUrl(message: string = site.whatsapp.defaultMessage): string {
  if (!isWhatsappConfigured) {
    if (!warned) {
      warned = true;
      console.warn('\n⚠  Numero WhatsApp non impostato (src/data/site.ts): i pulsanti puntano a /contatti/.\n');
    }
    return '/contatti/';
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Link mailto, oppure il modulo di contatto finché l'email è un segnaposto. */
export function emailUrl(subject?: string): string {
  if (!hasValue(site.email)) return '/contatti/#scrivimi';
  return `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
}
