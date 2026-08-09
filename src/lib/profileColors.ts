export const BRUNO_UUID = '1675cf50-82b8-4e59-8de5-36a35fbd0348';
export const FERNANDA_UUID = 'b798d5a0-4048-486a-8f14-b347c355a476';

export interface ProfileColorConfig {
  bg: string;
  bgSolid: string;
  text: string;
  dot: string;
  border: string;
  badgeBg: string;
  name: string;
}

export const MEMBER_PROFILE_COLORS: Record<string, ProfileColorConfig> = {
  [BRUNO_UUID]: {
    bg: 'bg-sky-500',
    bgSolid: 'bg-sky-600',
    text: 'text-sky-400',
    dot: 'bg-sky-400',
    border: 'border-sky-500/30',
    badgeBg: 'bg-sky-500/10',
    name: 'Bruno',
  },
  [FERNANDA_UUID]: {
    bg: 'bg-pink-400',
    bgSolid: 'bg-pink-500',
    text: 'text-pink-400',
    dot: 'bg-pink-400',
    border: 'border-pink-400/30',
    badgeBg: 'bg-pink-400/10',
    name: 'Fernanda',
  },
};

export function getMemberProfileColor(userId?: string, displayName?: string): ProfileColorConfig {
  if (userId && MEMBER_PROFILE_COLORS[userId]) {
    return MEMBER_PROFILE_COLORS[userId];
  }
  if (displayName) {
    const name = displayName.toLowerCase();
    if (name.includes('fernanda')) return MEMBER_PROFILE_COLORS[FERNANDA_UUID];
    if (name.includes('bruno')) return MEMBER_PROFILE_COLORS[BRUNO_UUID];
  }
  return {
    bg: 'bg-indigo-500',
    bgSolid: 'bg-indigo-600',
    text: 'text-indigo-400',
    dot: 'bg-indigo-400',
    border: 'border-indigo-500/30',
    badgeBg: 'bg-indigo-500/10',
    name: displayName || 'Membro',
  };
}
