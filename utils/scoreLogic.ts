export type Tier = {
  name: string;
  icon: string;
  color: string;
  minTx: number;
};

export const TIERS: Tier[] = [
  { name: 'OG', icon: '🟡', color: '#FFD700', minTx: 1000 },
  { name: 'Power User', icon: '🟣', color: '#A855F7', minTx: 500 },
  { name: 'Builder', icon: '🔵', color: '#3B82F6', minTx: 101 },
  { name: 'Explorer', icon: '🟢', color: '#22C55E', minTx: 1 },
  { name: 'Newbie', icon: '⚪', color: '#94A3B8', minTx: 0 },
];

export const getTier = (txCount: number): Tier => {
  return TIERS.find(tier => txCount >= tier.minTx) || TIERS[TIERS.length - 1];
};