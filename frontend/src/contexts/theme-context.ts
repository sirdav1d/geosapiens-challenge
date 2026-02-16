/** @format */

import { createContext } from 'react';

export type Theme = 'dark' | 'light' | 'system';

export type ThemeState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeState | undefined>(undefined);
