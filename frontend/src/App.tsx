/** @format */

import { lazy, Suspense } from 'react';
import AssetCreateSheet from './components/asset-create-sheet';
import { Skeleton } from './components/ui/skeleton';
import { AnimatedThemeToggler } from './components/ui/animated-theme-toggler';

const AssetsListSection = lazy(
	() => import('./components/assets-list-section'),
);

export default function App() {
	return (
		<main className='mx-auto max-h-screen max-w-6xl px-6 py-12'>
			<header className='mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<AnimatedThemeToggler className='md:hidden' />
				<div>
					<h1 className='text-3xl font-semibold tracking-tight'>
						GeoSapiens Ativos
					</h1>
					<p className='mt-2 text-sm text-muted-foreground'>
						Gerenciamento e listagem completa de ativos
					</p>
				</div>
				<div className='flex items-center gap-5'>
					<AssetCreateSheet />
					<AnimatedThemeToggler className='max-md:hidden' />
				</div>
			</header>

			<Suspense fallback={<AssetsListFallback />}>
				<AssetsListSection />
			</Suspense>
		</main>
	);
}

function AssetsListFallback() {
	return (
		<section className='space-y-4'>
			<div className='flex flex-col gap-3 md:flex-row md:items-center'>
				<Skeleton className='h-9 w-full md:max-w-sm' />
				<div className='flex gap-2 md:ml-auto'>
					<Skeleton className='h-9 w-[220px]' />
					<Skeleton className='h-9 w-[180px]' />
				</div>
			</div>
			<div className='space-y-2 rounded-lg border p-4'>
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
			</div>
		</section>
	);
}
