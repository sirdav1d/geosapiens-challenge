/** @format */

const ASSETS_TABLE_ROW_CLASSNAME =
	'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors will-change-transform';

const ASSETS_TABLE_ROW_LAYOUT_TRANSITION = {
	type: 'spring',
	stiffness: 420,
	damping: 34,
	mass: 0.8,
} as const;

const ASSETS_TABLE_ROW_OPACITY_TRANSITION = {
	duration: 0.14,
	ease: 'easeOut',
} as const;

const ASSETS_TABLE_MAX_VISIBLE_PAGES = 5;

export {
	ASSETS_TABLE_MAX_VISIBLE_PAGES,
	ASSETS_TABLE_ROW_CLASSNAME,
	ASSETS_TABLE_ROW_LAYOUT_TRANSITION,
	ASSETS_TABLE_ROW_OPACITY_TRANSITION,
};
