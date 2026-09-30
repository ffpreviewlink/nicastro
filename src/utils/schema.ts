import type { Service } from '../data/services';
import { site } from '../data/site';
import { hasValue } from './placeholder';

/**
 * Dati strutturati (schema.org) per la ricerca locale.
 * Regole: solo dati reali. I campi ancora segnaposto vengono omessi, e se manca
 * il nome dell'attività non viene emesso nulla.
 */
export function professionalSchema(origin: string) {
  if (!hasValue(site.businessName)) return null;
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${site.googleReviews.placeId}`;
  const sameAs = [site.social.facebook, mapsUrl].filter(hasValue);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${origin}/#professional`,
    name: site.businessName,
    description: site.description,
    ...(hasValue(site.name) && { founder: { '@type': 'Person', name: site.name } }),
    url: `${origin}/`,
    image: `${origin}${site.ogImage}`,
    areaServed: site.regions.map((name) => ({ '@type': 'AdministrativeArea', name })),
    ...(hasValue(site.email) && { email: site.email }),
    ...(hasValue(site.phone) && { telephone: site.phone }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.province,
      addressCountry: site.address.country,
    },
    ...(sameAs.length && { sameAs }),
  };
}

export function serviceSchema(service: Service, origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.seo.description,
    url: `${origin}${service.path}`,
    // Le prestazioni a domicilio non dichiarano la zona coperta: niente areaServed finché il cliente non la conferma
    ...(!service.atHome && {
      areaServed: site.regions.map((name) => ({ '@type': 'AdministrativeArea', name })),
    }),
    ...(hasValue(site.businessName) && {
      provider: { '@type': 'ProfessionalService', '@id': `${origin}/#professional`, name: site.businessName },
    }),
    ...(service.price && {
      offers: {
        '@type': 'Offer',
        price: service.price.amount,
        priceCurrency: 'EUR',
      },
    }),
  };
}
