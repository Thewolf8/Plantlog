export type HarshEnvironmentFactor =
  | 'extreme_heat' | 'low_humidity' | 'sandy_soil' | 'clay_soil'
  | 'frost' | 'high_wind' | 'waterlogged' | 'alkaline_ph' | 'acidic_ph'
  | 'saltwater_spray' | 'full_shade' | 'waterlogging';

export type ClimateSectionType = 'shading' | 'soil_structure' | 'irrigation' | 'other';

export interface MicroclimateMod {
  id: string;
  type: ClimateSectionType;
  description: string;
  dateApplied: string;
  stillActive: boolean;
}

export interface Generation {
  number: number;
  parentPlantId: string | null;
  childPlantIds: string[];
  seedHarvestDate?: string;
  notes?: string;
}

export interface WateringSchedule {
  enabled: boolean;
  frequency: 'once_daily' | 'every_x_days' | 'weekly' | 'monthly' | 'specific_days';
  intervalDays?: number;
  specificDays?: number[];
  preferredTimeHHMM?: string;
  reminderEnabled: boolean;
  notificationIds?: number[];
  lastWateredAt?: string;
}

export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  origin?: string;
  isClimateDefiance: boolean;
  harshEnvironmentFactors: HarshEnvironmentFactor[];
  microclimateMods: MicroclimateMod[];
  germinationDate?: string;
  adoptionDate: string;
  heroPhotoId?: string;
  notes: string;
  tags: string[];
  generation: Generation;
  wateringSchedule?: WateringSchedule;
  createdAt: string;
  updatedAt: string;
}
