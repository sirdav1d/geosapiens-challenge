/** @format */

export const ASSET_MUTATION_TOAST_MESSAGES = {
	create: {
		loading: 'Criando ativo...',
		success: 'Ativo criado com sucesso.',
		errorFallback: 'Não foi possível criar o ativo. Tente novamente.',
	},
	update: {
		loading: 'Salvando alterações...',
		success: 'Ativo atualizado com sucesso.',
		errorFallback: 'Não foi possível atualizar o ativo. Tente novamente.',
	},
	delete: {
		loading: 'Excluindo ativo...',
		success: 'Ativo excluído com sucesso.',
		errorFallback: 'Não foi possível excluir o ativo. Tente novamente.',
	},
} as const;

export type AssetMutationToastAction = keyof typeof ASSET_MUTATION_TOAST_MESSAGES;
