/** @format */

import type { ComponentType } from 'react';
import type { Category } from '../api/types';
import { CpuIcon } from '../components/ui/cpu';
import { KeyboardIcon } from '../components/ui/keyboard';
import { LaptopMinimalCheckIcon } from '../components/ui/laptop-minimal-check';
import { SmartphoneNfcIcon } from '../components/ui/smartphone-nfc';
import { WaypointsIcon } from '../components/ui/waypoints';

type CategoryIconProps = {
	className?: string;
	size?: number;
};

export const CATEGORY_ICONS: Record<Category, ComponentType<CategoryIconProps>> = {
	COMPUTER: LaptopMinimalCheckIcon,
	PERIPHERAL: KeyboardIcon,
	NETWORK_EQUIPMENT: WaypointsIcon,
	SERVER_INFRA: CpuIcon,
	MOBILE_DEVICE: SmartphoneNfcIcon,
};
