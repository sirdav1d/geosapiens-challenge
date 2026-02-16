/** @format */

const CATEGORY_VALUES = [
	'COMPUTER',
	'PERIPHERAL',
	'NETWORK_EQUIPMENT',
	'SERVER_INFRA',
	'MOBILE_DEVICE',
] as const;

const STATUS_VALUES = [
	'IN_USE',
	'IN_STOCK',
	'MAINTENANCE',
	'RETIRED',
] as const;

const CATEGORY_LABELS: Record<(typeof CATEGORY_VALUES)[number], string> = {
	COMPUTER: 'Computador',
	PERIPHERAL: 'Periférico',
	NETWORK_EQUIPMENT: 'Equipamento de rede',
	SERVER_INFRA: 'Infra de servidor',
	MOBILE_DEVICE: 'Dispositivo móvel',
};

const STATUS_LABELS: Record<(typeof STATUS_VALUES)[number], string> = {
	IN_USE: 'Em uso',
	IN_STOCK: 'Em estoque',
	MAINTENANCE: 'Manutenção',
	RETIRED: 'Descartado',
};

export { CATEGORY_LABELS, CATEGORY_VALUES, STATUS_LABELS, STATUS_VALUES };

