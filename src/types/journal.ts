export type WaterSource =
  | 'tap_overnight' | 'well_borehole' | 'filtered' | 'rainwater'
  | 'distilled' | 'greywater' | 'other';

export type WeatherEventType =
  | 'sandstorm' | 'heatwave' | 'sudden_frost' | 'heavy_rain'
  | 'hailstorm' | 'drought' | 'high_humidity' | 'cold_snap';

export type FertilizerType = 'organic' | 'chemical' | 'foliar' | 'slow_release';
export type InterventionType = 'fertilizer' | 'pesticide' | 'fungicide' | 'other';

export interface WateringEntry {
  kind: 'watering';
  source: WaterSource;
  sourceNote?: string;
  amountLiters?: number;
  method?: string;
}

export interface FertilizerEntry {
  kind: 'fertilizer';
  fertilizerType: FertilizerType;
  productName: string;
  npk?: string;
  quantityGrams?: number;
  applicationMethod?: string;
}

export interface PesticideEntry {
  kind: 'pesticide';
  interventionType: InterventionType;
  productName: string;
  isOrganic: boolean;
  dilutionRatio?: string;
  targetPest?: string;
}

export interface WeatherEntry {
  kind: 'weather';
  eventType: WeatherEventType;
  severity?: 'mild' | 'moderate' | 'severe';
  durationHours?: number;
  note?: string;
}

export interface ObservationEntry {
  kind: 'observation';
  text: string;
  tags: string[];
  linkedPhotoIds: string[];
}

export interface MicroclimateEntry {
  kind: 'microclimate';
  modType: string;
  description: string;
}

export type JournalPayload =
  | WateringEntry
  | FertilizerEntry
  | PesticideEntry
  | WeatherEntry
  | ObservationEntry
  | MicroclimateEntry;

export interface JournalEntry {
  id: string;
  plantId: string;
  date: string;
  payload: JournalPayload;
  isWeatherFlag: boolean;
  createdAt: string;
}
