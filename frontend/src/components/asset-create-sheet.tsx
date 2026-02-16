/** @format */

import { PlusIcon } from 'lucide-react';
import AssetUpsertSheet from './asset-upsert-sheet';
import { Button } from './ui/button';

export default function AssetCreateSheet() {
	return (
		<AssetUpsertSheet
			mode='create'
			trigger={
				<Button className='gap-2'>
					<PlusIcon className='size-4' />
					Novo ativo
				</Button>
			}
		/>
	);
}
