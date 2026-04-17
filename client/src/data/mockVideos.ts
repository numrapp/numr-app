export interface StatusVideo {
  id: number;
  company: string;
  company_name?: string;
  logo: string;
  logoColor: string;
  logoBg: string;
  category: string;
  description: string;
  phone: string;
  videoBg: string;
  video_path?: string;
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
  { key: 'videoproductie', label: 'status.videoproductie' },
];

export const mockVideos: StatusVideo[] = [];
