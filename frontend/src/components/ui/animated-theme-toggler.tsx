/** @format */

import { useCallback, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';
import { useTheme } from '@/hooks/use-theme';

import { cn } from '@/lib/utils';

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'button'> {
	duration?: number;
}

export const AnimatedThemeToggler = ({
	className,
	duration = 400,
	...props
}: AnimatedThemeTogglerProps) => {
	const { resolvedTheme, setTheme } = useTheme();
	const buttonRef = useRef<HTMLButtonElement>(null);

	const isDark = resolvedTheme === 'dark';

	const toggleTheme = useCallback(async () => {
		const nextTheme = isDark ? 'light' : 'dark';
		const applyTheme = () => {
			flushSync(() => {
				setTheme(nextTheme);
			});
		};

		if (!buttonRef.current) {
			applyTheme();
			return;
		}

		const supportsViewTransition =
			'startViewTransition' in document &&
			typeof (document as Document & { startViewTransition?: unknown })
				.startViewTransition === 'function';
		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;

		if (!supportsViewTransition || prefersReducedMotion) {
			applyTheme();
			return;
		}

		const transition = (
			document as Document & {
				startViewTransition: (updateCallback: () => void) => {
					ready: Promise<void>;
				};
			}
		).startViewTransition(applyTheme);
		await transition.ready;

		const { top, left, width, height } =
			buttonRef.current.getBoundingClientRect();
		const x = left + width / 2;
		const y = top + height / 2;
		const maxRadius = Math.hypot(
			Math.max(left, window.innerWidth - left),
			Math.max(top, window.innerHeight - top),
		);

		document.documentElement.animate(
			{
				clipPath: [
					`circle(0px at ${x}px ${y}px)`,
					`circle(${maxRadius}px at ${x}px ${y}px)`,
				],
			},
			{
				duration,
				easing: 'ease-in-out',
				pseudoElement: '::view-transition-new(root)',
			},
		);
	}, [duration, isDark, setTheme]);

	return (
		<button
			ref={buttonRef}
			type='button'
			onClick={toggleTheme}
			className={cn(className, 'cursor-pointer')}
			{...props}>
			{isDark ? <Sun size={18} /> : <Moon size={18} />}
			<span className='sr-only'>Toggle theme</span>
		</button>
	);
};
