export interface StatusVideo {
  id: number;
  company: string;
  logo: string;
  logoColor: string;
  logoBg: string;
  category: 'bouwbedrijf' | 'taxi' | 'transport' | 'horeca' | 'zorg' | 'it' | 'videoproductie' | 'boekhouder';
  description: string;
  phone: string;
  videoBg: string;
  postedAt: string;
  location: string;
}

export const CATEGORIES = [
  { key: 'alle', label: 'status.alle' },
  { key: 'bouwbedrijf', label: 'status.bouwbedrijf' },
  { key: 'taxi', label: 'status.taxi' },
  { key: 'transport', label: 'status.transport' },
  { key: 'horeca', label: 'status.horeca' },
  { key: 'zorg', label: 'status.zorg' },
  { key: 'it', label: 'status.it' },
  { key: 'videoproductie', label: 'status.videoproductie' },
  { key: 'boekhouder', label: 'status.boekhouder' },
];

export const mockVideos: StatusVideo[] = [
  { id: 1, company: 'Van der Berg Bouw BV', logo: 'VB', logoColor: '#fff', logoBg: '#F59E0B', category: 'bouwbedrijf', description: 'Renovatie project Amsterdam', phone: '06-12345678', videoBg: 'linear-gradient(135deg, #92400E 0%, #F59E0B 100%)', postedAt: '2 uur geleden', location: 'Amsterdam' },
  { id: 2, company: 'Jansen Aannemers', logo: 'JA', logoColor: '#fff', logoBg: '#DC2626', category: 'bouwbedrijf', description: 'Nieuwbouw woningen Utrecht', phone: '06-23456789', videoBg: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)', postedAt: '3 uur geleden', location: 'Utrecht' },
  { id: 3, company: 'De Groot Constructie', logo: 'DG', logoColor: '#fff', logoBg: '#2563EB', category: 'bouwbedrijf', description: 'Verbouwing kantoorpand Den Haag', phone: '06-34567890', videoBg: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', postedAt: '5 uur geleden', location: 'Den Haag' },
  { id: 4, company: 'Amsterdam Taxi Service', logo: 'AT', logoColor: '#fff', logoBg: '#16A34A', category: 'taxi', description: '24/7 taxiservice Amsterdam', phone: '06-45678901', videoBg: 'linear-gradient(135deg, #14532D 0%, #16A34A 100%)', postedAt: '1 uur geleden', location: 'Amsterdam' },
  { id: 5, company: 'Schiphol Taxi Direct', logo: 'ST', logoColor: '#fff', logoBg: '#7C3AED', category: 'taxi', description: 'Luchthaven vervoer - altijd op tijd', phone: '06-56789012', videoBg: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)', postedAt: '4 uur geleden', location: 'Schiphol' },
  { id: 6, company: 'CityRide Taxi', logo: 'CR', logoColor: '#fff', logoBg: '#0891B2', category: 'taxi', description: 'Zakelijk vervoer Randstad', phone: '06-67890123', videoBg: 'linear-gradient(135deg, #164E63 0%, #0891B2 100%)', postedAt: '6 uur geleden', location: 'Rotterdam' },
  { id: 7, company: 'Holland Transport BV', logo: 'HT', logoColor: '#fff', logoBg: '#EA580C', category: 'transport', description: 'Internationaal transport Europa', phone: '06-78901234', videoBg: 'linear-gradient(135deg, #9A3412 0%, #EA580C 100%)', postedAt: '2 uur geleden', location: 'Rotterdam' },
  { id: 8, company: 'Express Logistics NL', logo: 'EL', logoColor: '#fff', logoBg: '#0D9488', category: 'transport', description: 'Same-day delivery heel Nederland', phone: '06-89012345', videoBg: 'linear-gradient(135deg, #134E4A 0%, #0D9488 100%)', postedAt: '3 uur geleden', location: 'Eindhoven' },
  { id: 9, company: 'Dutch Cargo Services', logo: 'DC', logoColor: '#fff', logoBg: '#4F46E5', category: 'transport', description: 'Verhuisservice heel NL', phone: '06-90123456', videoBg: 'linear-gradient(135deg, #312E81 0%, #4F46E5 100%)', postedAt: '7 uur geleden', location: 'Den Haag' },
  { id: 10, company: 'ByteForce IT', logo: 'BF', logoColor: '#fff', logoBg: '#6366F1', category: 'it', description: 'Webontwikkeling & Cloud', phone: '06-11122233', videoBg: 'linear-gradient(135deg, #3730A3 0%, #6366F1 100%)', postedAt: '1 uur geleden', location: 'Amsterdam' },
  { id: 11, company: 'NetSolutions BV', logo: 'NS', logoColor: '#fff', logoBg: '#0EA5E9', category: 'it', description: 'Netwerk & Security services', phone: '06-22233344', videoBg: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)', postedAt: '4 uur geleden', location: 'Utrecht' },
  { id: 12, company: 'CreativeFrame', logo: 'CF', logoColor: '#fff', logoBg: '#EC4899', category: 'videoproductie', description: 'Bedrijfsfilm & reclame', phone: '06-33344455', videoBg: 'linear-gradient(135deg, #9D174D 0%, #EC4899 100%)', postedAt: '2 uur geleden', location: 'Rotterdam' },
  { id: 13, company: 'LensWork Studio', logo: 'LW', logoColor: '#fff', logoBg: '#F43F5E', category: 'videoproductie', description: 'Social media content', phone: '06-44455566', videoBg: 'linear-gradient(135deg, #9F1239 0%, #F43F5E 100%)', postedAt: '5 uur geleden', location: 'Den Haag' },
  { id: 14, company: 'FinAdmin Boekhouding', logo: 'FA', logoColor: '#fff', logoBg: '#059669', category: 'boekhouder', description: 'Boekhouding voor ZZP\'ers', phone: '06-55566677', videoBg: 'linear-gradient(135deg, #065F46 0%, #059669 100%)', postedAt: '3 uur geleden', location: 'Amsterdam' },
  { id: 15, company: 'MKB Administratie', logo: 'MA', logoColor: '#fff', logoBg: '#D97706', category: 'boekhouder', description: 'MKB boekhouding & belasting', phone: '06-66677788', videoBg: 'linear-gradient(135deg, #92400E 0%, #D97706 100%)', postedAt: '6 uur geleden', location: 'Eindhoven' },
];
