/** @format */

import type { Asset } from '../api/types';
import AssetUpsertSheet from './asset-upsert-sheet';

type AssetEditSheetProps = {
	asset: Asset | null;
	onOpenChange: (open: boolean) => void;
	open: boolean;
};

export default function AssetEditSheet({
	asset,
	onOpenChange,
	open,
}: AssetEditSheetProps) {
	return (
		<AssetUpsertSheet
			mode='edit'
			asset={asset}
			open={open}
			onOpenChange={onOpenChange}
		/>
	);
}
