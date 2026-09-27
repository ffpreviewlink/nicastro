import { services } from './services';

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

/** Navigazione principale, nell'ordine in cui compare in header, menu mobile e footer. */
export const navigation: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Servizi',
    href: '/servizi/',
    children: services.map((s) => ({ label: s.name, href: s.path })),
  },
  { label: 'Chi sono', href: '/chi-sono/' },
  { label: 'Per i professionisti', href: '/professionisti/' },
  { label: 'Recensioni', href: '/recensioni/' },
  { label: 'Contatti', href: '/contatti/' },
];
