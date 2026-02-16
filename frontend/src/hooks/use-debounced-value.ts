/** @format */

import { useEffect, useState } from 'react';

function useDebouncedValue<TValue>(
	value: TValue,
	delayInMs: number,
): TValue {
	const [debouncedValue, setDebouncedValue] = useState<TValue>(value);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedValue(value);
		}, delayInMs);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [delayInMs, value]);

	return debouncedValue;
}

export { useDebouncedValue };

