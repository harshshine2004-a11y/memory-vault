import React, { createContext, useContext, useState } from 'react';
import type { ThemeId, ThemeConfig } from '../types';
import { audioEngine } from '../utils/audio';

export const THEMES: Record<ThemeId | string, ThemeConfig> = {
  abyssal_ocean: {
    id: 'abyssal_ocean',
    name: 'Underwater Ocean',
    category: 'Nature World',
    bgType: 'deep_water',
    particleColor: '#00f0ff',
    particleCount: 1800,
    accentColor: '#00f0ff',
    lightIntensity: 1.6,
    ambientLightColor: '#003366',
    fogColor: '#001122',
    nodeMaterial: 'glass',
    glassBlur: 'backdrop-blur-xl bg-slate-950/80 border-cyan-500/30 text-cyan-200'
  },
  garden: {
    id: 'garden',
    name: 'Lush Garden & Butterflies',
    category: 'Nature World',
    bgType: 'garden_green',
    particleColor: '#4ade80',
    particleCount: 1500,
    accentColor: '#22c55e',
    lightIntensity: 1.8,
    ambientLightColor: '#14532d',
    fogColor: '#052e16',
    nodeMaterial: 'crystal',
    glassBlur: 'backdrop-blur-xl bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
  },
  solar_system: {
    id: 'solar_system',
    name: 'Solar System Orbits',
    category: 'Cosmic World',
    bgType: 'solar_system',
    particleColor: '#fbbf24',
    particleCount: 2200,
    accentColor: '#f59e0b',
    lightIntensity: 2.2,
    ambientLightColor: '#451a03',
    fogColor: '#0f0501',
    nodeMaterial: 'gold',
    glassBlur: 'backdrop-blur-xl bg-amber-950/80 border-amber-500/30 text-amber-200'
  },
  galaxy: {
    id: 'galaxy',
    name: 'Deep Space Galaxy',
    category: 'Cosmic World',
    bgType: 'nebula_space',
    particleColor: '#a855f7',
    particleCount: 2500,
    accentColor: '#c084fc',
    lightIntensity: 1.7,
    ambientLightColor: '#3b0764',
    fogColor: '#1e0536',
    nodeMaterial: 'crystal',
    glassBlur: 'backdrop-blur-xl bg-purple-950/80 border-purple-500/30 text-purple-200'
  },
  ancient_library: {
    id: 'ancient_library',
    name: 'Ancient Library & Runes',
    category: 'Fantasy World',
    bgType: 'library_candles',
    particleColor: '#f59e0b',
    particleCount: 1200,
    accentColor: '#d97706',
    lightIntensity: 1.5,
    ambientLightColor: '#78350f',
    fogColor: '#291003',
    nodeMaterial: 'gold',
    glassBlur: 'backdrop-blur-xl bg-amber-950/85 border-amber-600/30 text-amber-100'
  },
  cyberpunk_city: {
    id: 'cyberpunk_city',
    name: 'Cyberpunk Neon Rain',
    category: 'Sci-Fi World',
    bgType: 'neon_grid',
    particleColor: '#ff007f',
    particleCount: 2000,
    accentColor: '#ff007f',
    lightIntensity: 2.0,
    ambientLightColor: '#4a044e',
    fogColor: '#1f0224',
    nodeMaterial: 'wireframe',
    glassBlur: 'backdrop-blur-xl bg-fuchsia-950/80 border-fuchsia-500/40 text-fuchsia-200'
  },
  snow_mountain: {
    id: 'snow_mountain',
    name: 'Snow Mountain Blizzard',
    category: 'Nature World',
    bgType: 'snow_blizzard',
    particleColor: '#e0f2fe',
    particleCount: 2200,
    accentColor: '#38bdf8',
    lightIntensity: 1.9,
    ambientLightColor: '#0c4a6e',
    fogColor: '#032030',
    nodeMaterial: 'glass',
    glassBlur: 'backdrop-blur-xl bg-sky-950/80 border-sky-400/30 text-sky-100'
  },
  desert_oasis: {
    id: 'desert_oasis',
    name: 'Desert Sunset Oasis',
    category: 'Nature World',
    bgType: 'desert_dunes',
    particleColor: '#f97316',
    particleCount: 1400,
    accentColor: '#fb923c',
    lightIntensity: 1.9,
    ambientLightColor: '#7c2d12',
    fogColor: '#270a02',
    nodeMaterial: 'gold',
    glassBlur: 'backdrop-blur-xl bg-orange-950/80 border-orange-500/30 text-orange-200'
  },
  zen_garden: {
    id: 'zen_garden',
    name: 'Japanese Zen & Sakura',
    category: 'Nature World',
    bgType: 'sakura_petals',
    particleColor: '#f472b6',
    particleCount: 1600,
    accentColor: '#ec4899',
    lightIntensity: 1.7,
    ambientLightColor: '#831843',
    fogColor: '#2e0618',
    nodeMaterial: 'crystal',
    glassBlur: 'backdrop-blur-xl bg-pink-950/80 border-pink-500/30 text-pink-200'
  },
  fantasy_kingdom: {
    id: 'fantasy_kingdom',
    name: 'Fantasy Floating Realm',
    category: 'Fantasy World',
    bgType: 'floating_realm',
    particleColor: '#818cf8',
    particleCount: 2000,
    accentColor: '#6366f1',
    lightIntensity: 1.8,
    ambientLightColor: '#312e81',
    fogColor: '#11103c',
    nodeMaterial: 'glass',
    glassBlur: 'backdrop-blur-xl bg-indigo-950/80 border-indigo-500/30 text-indigo-200'
  },
  rainforest: {
    id: 'rainforest',
    name: 'Rainforest & Fireflies',
    category: 'Nature World',
    bgType: 'jungle_fireflies',
    particleColor: '#a3e635',
    particleCount: 1700,
    accentColor: '#84cc16',
    lightIntensity: 1.7,
    ambientLightColor: '#365314',
    fogColor: '#101d03',
    nodeMaterial: 'crystal',
    glassBlur: 'backdrop-blur-xl bg-lime-950/80 border-lime-500/30 text-lime-200'
  }
};

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (themeId: ThemeId | string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<ThemeConfig>(THEMES.abyssal_ocean);

  const setTheme = (themeId: ThemeId | string) => {
    const theme = THEMES[themeId] || THEMES.abyssal_ocean;
    setCurrentThemeState(theme);
    audioEngine.playThemeAmbient(theme.id);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
