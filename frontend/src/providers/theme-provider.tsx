/** @format */

import { useEffect, useMemo, useState } from 'react';
import {
	ThemeContext,
	type ResolvedTheme,
	type Theme,
} from '../contexts/theme-context';

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

function readStoredTheme(storageKey: string, fallbackTheme: Theme): Theme {
	if (typeof window === 'undefined') {
		return fallbackTheme;
	}

	const value = localStorage.getItem(storageKey);
	if (value === 'light' || value === 'dark' || value === 'system') {
		return value;
	}

	return fallbackTheme;
}

function resolveTheme(theme: Theme): ResolvedTheme {
	if (typeof window === 'undefined') {
		return 'light';
	}

	if (theme === 'system') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
	}

	return theme;
}

export function ThemeProvider({
	children,
	defaultTheme = 'system',
	storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() =>
		readStoredTheme(storageKey, defaultTheme),
	);
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
		resolveTheme(readStoredTheme(storageKey, defaultTheme)),
	);

	useEffect(() => {
		const root = document.documentElement;
		const applyTheme = (nextTheme: ResolvedTheme) => {
			root.classList.remove('light', 'dark');
			root.classList.add(nextTheme);
			setResolvedTheme(nextTheme);
		};

		if (theme !== 'system') {
			applyTheme(theme);
			return undefined;
		}

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = () => {
			applyTheme(media.matches ? 'dark' : 'light');
		};

		handleChange();
		media.addEventListener('change', handleChange);
		return () => media.removeEventListener('change', handleChange);
	}, [theme]);

	const value = useMemo(
		() => ({
			resolvedTheme,
			theme,
			setTheme: (nextTheme: Theme) => {
				localStorage.setItem(storageKey, nextTheme);
				setTheme(nextTheme);
			},
		}),
		[resolvedTheme, storageKey, theme],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}
