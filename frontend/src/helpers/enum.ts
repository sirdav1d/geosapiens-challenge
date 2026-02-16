/** @format */

function isEnumValue<TValue extends string>(
	value: string,
	allowedValues: readonly TValue[],
): value is TValue {
	return allowedValues.some((allowedValue) => allowedValue === value);
}

export { isEnumValue };
