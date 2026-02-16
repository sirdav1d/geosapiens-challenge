/** @format */

const ptBrDateFormatter = new Intl.DateTimeFormat('pt-BR');

function isValidDateInput(value: string): boolean {
	if (!value) {
		return false;
	}

	return !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

function getTodayDateInputValue(): string {
	const now = new Date();
	const localDate = new Date(
		now.getTime() - now.getTimezoneOffset() * 60 * 1000,
	);
	return localDate.toISOString().slice(0, 10);
}

function formatLocalDate(value: string): string {
	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return ptBrDateFormatter.format(date);
}

function parseDateInput(value: string | null | undefined): Date | undefined {
	if (!value) {
		return undefined;
	}

	const parsedDate = new Date(`${value}T00:00:00`);
	if (Number.isNaN(parsedDate.getTime())) {
		return undefined;
	}

	return parsedDate;
}

function toDateInputValue(date: Date): string {
	const year = String(date.getFullYear());
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export {
	formatLocalDate,
	getTodayDateInputValue,
	isValidDateInput,
	parseDateInput,
	toDateInputValue,
};
