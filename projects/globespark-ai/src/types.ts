export type Locale = 'en' | 'ar' | 'tr';

export type CategoryKey = 'culture' | 'food' | 'history' | 'language' | 'nature';

export type FactPayload = Record<CategoryKey, string> & {
  summary: string;
};

export type FactsResponse = FactPayload & {
  cached: boolean;
  generatedAt: string;
};

export type SelectedCountry = {
  name: string;
  code?: string;
};

export type CountryMetadata = {
  code: string;
  name: string;
  capital: string | null;
  region: string | null;
  incomeLevel: string | null;
  longitude: number | null;
  latitude: number | null;
  population: number | null;
  populationYear: string | null;
  source: 'World Bank';
  retrievedAt: string;
};

export type HeritageSite = {
  id: number | null;
  name: string;
  category: string | null;
  inscriptionYear: number | null;
  inDanger: boolean;
  url: string;
};

export type HeritageResponse = {
  totalCount: number;
  sites: HeritageSite[];
  source: 'UNESCO DataHub';
  sourceUrl: string;
  retrievedAt: string;
};

export type GroundedStatus = 'supported' | 'insufficient_evidence';

export type GroundedSource = {
  id: string;
  title: string;
  provider: string;
  url: string;
  retrievedAt: string;
  evidence: Record<string, unknown>;
};

export type GroundedStatement = {
  text: string;
  status: GroundedStatus;
  sourceIds: string[];
};

export type GroundedBriefResponse = {
  summary: GroundedStatement;
  claims: Array<GroundedStatement & { theme: CategoryKey }>;
  sources: GroundedSource[];
  providerStates: { worldBank: 'live' | 'unavailable'; unesco: 'live' | 'unavailable' };
  cached: boolean;
  generatedAt: string;
};

export type Position = [number, number];
export type PolygonCoordinates = Position[][];
export type MultiPolygonCoordinates = Position[][][];

export type GeoFeature = {
  properties?: Record<string, unknown>;
  geometry?: {
    type?: string;
    coordinates?: PolygonCoordinates | MultiPolygonCoordinates;
  };
};
