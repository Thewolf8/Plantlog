import type { WaterSource, WeatherEventType, HarshEnvironmentFactor } from '../types';

export const STORAGE_KEYS = {
  plants: 'plantlog_plants',
  journalEntries: 'plantlog_journal',
  photos: 'plantlog_photos',
  tags: 'plantlog_tags',
  settings: 'plantlog_settings',
} as const;

export const WATER_SOURCES: { value: WaterSource; labelKey: string }[] = [
  { value: 'tap_overnight', labelKey: 'waterSource.tapOvernight' },
  { value: 'well_borehole', labelKey: 'waterSource.wellBorehole' },
  { value: 'filtered', labelKey: 'waterSource.filtered' },
  { value: 'rainwater', labelKey: 'waterSource.rainwater' },
  { value: 'distilled', labelKey: 'waterSource.distilled' },
  { value: 'greywater', labelKey: 'waterSource.greywater' },
  { value: 'other', labelKey: 'waterSource.other' },
];

export const WEATHER_EVENTS: { value: WeatherEventType; labelKey: string; icon: string }[] = [
  { value: 'sandstorm', labelKey: 'weather.sandstorm', icon: 'Wind' },
  { value: 'heatwave', labelKey: 'weather.heatwave', icon: 'Sun' },
  { value: 'sudden_frost', labelKey: 'weather.suddenFrost', icon: 'Snowflake' },
  { value: 'heavy_rain', labelKey: 'weather.heavyRain', icon: 'CloudRain' },
  { value: 'hailstorm', labelKey: 'weather.hailstorm', icon: 'CloudLightning' },
  { value: 'drought', labelKey: 'weather.drought', icon: 'SunDim' },
  { value: 'high_humidity', labelKey: 'weather.highHumidity', icon: 'Droplets' },
  { value: 'cold_snap', labelKey: 'weather.coldSnap', icon: 'Thermometer' },
];

export const HARSH_ENVIRONMENT_FACTORS: { value: HarshEnvironmentFactor; labelKey: string }[] = [
  { value: 'extreme_heat', labelKey: 'climate.extremeHeat' },
  { value: 'low_humidity', labelKey: 'climate.lowHumidity' },
  { value: 'sandy_soil', labelKey: 'climate.sandySoil' },
  { value: 'clay_soil', labelKey: 'climate.claySoil' },
  { value: 'frost', labelKey: 'climate.frost' },
  { value: 'high_wind', labelKey: 'climate.highWind' },
  { value: 'waterlogged', labelKey: 'climate.waterlogged' },
  { value: 'alkaline_ph', labelKey: 'climate.alkalinePh' },
  { value: 'acidic_ph', labelKey: 'climate.acidicPh' },
  { value: 'saltwater_spray', labelKey: 'climate.saltwaterSpray' },
  { value: 'full_shade', labelKey: 'climate.fullShade' },
  { value: 'waterlogging', labelKey: 'climate.waterlogging' },
];

export const DEFAULT_SETTINGS = {
  theme: 'system' as const,
  language: 'system' as const,
  dateFormat: 'DMY' as const,
  animationsEnabled: true,
  highContrastMode: false,
  defaultWaterSource: null as WaterSource | null,
  exportPreferences: {
    includePhotos: true,
    includeNotes: true,
    dateFormat: 'iso' as const,
  },
  notifications: {
    wateringRemindersEnabled: true,
  },
};

export const TAG_COLOR_OPTIONS = [
  { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', name: 'red' },
  { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', name: 'orange' },
  { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30', name: 'amber' },
  { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', name: 'yellow' },
  { bg: 'bg-lime-500/20', text: 'text-lime-300', border: 'border-lime-500/30', name: 'lime' },
  { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', name: 'green' },
  { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30', name: 'emerald' },
  { bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500/30', name: 'teal' },
  { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30', name: 'cyan' },
  { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/30', name: 'sky' },
  { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', name: 'blue' },
  { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30', name: 'indigo' },
  { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/30', name: 'violet' },
  { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30', name: 'purple' },
  { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/30', name: 'fuchsia' },
  { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/30', name: 'pink' },
  { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/30', name: 'rose' },
  { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30', name: 'slate' },
];
