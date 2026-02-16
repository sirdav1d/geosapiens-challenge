/** @format */

import { useContext } from 'react';
import { ThemeContext, type ThemeState } from '../contexts/theme-context';

export function useTheme(): ThemeState {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}

	return context;
}
