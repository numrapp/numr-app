export interface ReceivedInvoice {
  id: number;
  sender: string;
  senderLogoSvg: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  description: string;
  items: { description: string; quantity: number; unitPrice: number; btwRate: number }[];
  subtotal: number;
  btwAmount: number;
  total: number;
  status: 'paid' | 'unpaid';
}

const kpnLogo = `<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#00A94F"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="900" font-family="Arial">KPN</text></svg>`;
const vattenfallLogo = `<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#F5A623"/><text x="20" y="27" text-anchor="middle" fill="white" font-size="18" font-weight="900" font-family="Arial">V</text></svg>`;
const ziggoLogo = `<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#E91E63"/><text x="20" y="27" text-anchor="middle" fill="white" font-size="16" font-weight="900" font-family="Arial">Z</text></svg>`;
const gemeenteLogo = `<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#1565C0"/><text x="20" y="16" text-anchor="middle" fill="white" font-size="7" font-weight="700" font-family="Arial">GEM</text><text x="20" y="30" text-anchor="middle" fill="white" font-size="6" font-weight="700" font-family="Arial">AMS</text></svg>`;
const vgzLogo = `<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#3F51B5"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="12" font-weight="900" font-family="Arial">VGZ</text></svg>`;
const bamLogo = `<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#003D6B"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="13" font-weight="900" font-family="Arial">BAM</text></svg>`;
const heijmansLogo = `<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#E3000F"/><text x="20" y="27" text-anchor="middle" fill="white" font-size="16" font-weight="900" font-family="Arial">H</text></svg>`;
const volkerLogo = `<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#FF6600"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="10" font-weight="900" font-family="Arial">VW</text></svg>`;

export const mockReceivedInvoices: ReceivedInvoice[] = [
  {
    id: 1, sender: 'KPN', senderLogoSvg: kpnLogo,
    invoiceNumber: 'KPN-2026-4481', invoiceDate: '2026-03-01', dueDate: '2026-03-31',
    description: 'Mobiel abonnement maart 2026',
    items: [
      { description: 'KPN Mobiel Unlimited', quantity: 1, unitPrice: 38.02, btwRate: 21 },
    ],
    subtotal: 38.02, btwAmount: 7.97, total: 45.99, status: 'unpaid',
  },
  {
    id: 2, sender: 'Vattenfall', senderLogoSvg: vattenfallLogo,
    invoiceNumber: 'VF-2026-8823', invoiceDate: '2026-02-15', dueDate: '2026-03-15',
    description: 'Energie levering februari 2026',
    items: [
      { description: 'Elektriciteit', quantity: 1, unitPrice: 78.50, btwRate: 21 },
      { description: 'Gas', quantity: 1, unitPrice: 27.77, btwRate: 21 },
    ],
    subtotal: 106.27, btwAmount: 22.23, total: 128.50, status: 'paid',
  },
  {
    id: 3, sender: 'Ziggo', senderLogoSvg: ziggoLogo,
    invoiceNumber: 'ZG-2026-3351', invoiceDate: '2026-03-05', dueDate: '2026-04-05',
    description: 'Internet & TV maart 2026',
    items: [
      { description: 'Ziggo Internet 1000 Mbps', quantity: 1, unitPrice: 39.63, btwRate: 21 },
      { description: 'Ziggo TV Compleet', quantity: 1, unitPrice: 9.92, btwRate: 21 },
    ],
    subtotal: 49.55, btwAmount: 10.40, total: 59.95, status: 'unpaid',
  },
  {
    id: 4, sender: 'Gemeente Amsterdam', senderLogoSvg: gemeenteLogo,
    invoiceNumber: 'GEM-2026-0091', invoiceDate: '2026-01-15', dueDate: '2026-04-15',
    description: 'Gemeentelijke belastingen 2026',
    items: [
      { description: 'Onroerendezaakbelasting', quantity: 1, unitPrice: 245.00, btwRate: 0 },
      { description: 'Afvalstoffenheffing', quantity: 1, unitPrice: 144.00, btwRate: 0 },
    ],
    subtotal: 389.00, btwAmount: 0, total: 389.00, status: 'unpaid',
  },
  {
    id: 5, sender: 'VGZ Zorgverzekering', senderLogoSvg: vgzLogo,
    invoiceNumber: 'VGZ-2026-7712', invoiceDate: '2026-03-01', dueDate: '2026-03-28',
    description: 'Zorgpremie maart 2026',
    items: [
      { description: 'Basisverzekering', quantity: 1, unitPrice: 134.20, btwRate: 0 },
    ],
    subtotal: 134.20, btwAmount: 0, total: 134.20, status: 'paid',
  },
  {
    id: 6, sender: 'BAM Bouw en Techniek', senderLogoSvg: bamLogo,
    invoiceNumber: 'BAM-2026-1092', invoiceDate: '2026-03-10', dueDate: '2026-04-10',
    description: 'Bouwwerkzaamheden fase 2 - kantoorpand',
    items: [
      { description: 'Metselwerk binnenmuren', quantity: 48, unitPrice: 85.00, btwRate: 21 },
      { description: 'Stucwerk plafonds', quantity: 120, unitPrice: 32.50, btwRate: 21 },
      { description: 'Materiaalkosten', quantity: 1, unitPrice: 1450.00, btwRate: 21 },
    ],
    subtotal: 9530.00, btwAmount: 2001.30, total: 11531.30, status: 'unpaid',
  },
  {
    id: 7, sender: 'Heijmans Infra BV', senderLogoSvg: heijmansLogo,
    invoiceNumber: 'HEI-2026-3847', invoiceDate: '2026-03-15', dueDate: '2026-04-15',
    description: 'Grondwerk en bestrating bedrijfsterrein',
    items: [
      { description: 'Grondverzet en egaliseren', quantity: 1, unitPrice: 3200.00, btwRate: 21 },
      { description: 'Bestrating klinkers 400m2', quantity: 400, unitPrice: 18.50, btwRate: 21 },
      { description: 'Riolering aanleg', quantity: 1, unitPrice: 2800.00, btwRate: 21 },
    ],
    subtotal: 13400.00, btwAmount: 2814.00, total: 16214.00, status: 'unpaid',
  },
  {
    id: 8, sender: 'VolkerWessels Bouw', senderLogoSvg: volkerLogo,
    invoiceNumber: 'VW-2026-5521', invoiceDate: '2026-03-20', dueDate: '2026-04-20',
    description: 'Renovatie bedrijfshal - elektra en installatie',
    items: [
      { description: 'Elektra installatie compleet', quantity: 1, unitPrice: 4500.00, btwRate: 21 },
      { description: 'CV installatie', quantity: 1, unitPrice: 3800.00, btwRate: 21 },
      { description: 'Brandmeldinstallatie', quantity: 1, unitPrice: 2200.00, btwRate: 21 },
      { description: 'Arbeidsloon monteurs 80 uur', quantity: 80, unitPrice: 65.00, btwRate: 21 },
    ],
    subtotal: 15700.00, btwAmount: 3297.00, total: 18997.00, status: 'unpaid',
  },
];
