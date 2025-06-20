import { IHistoryCreate } from '@/interfaces/model/history.interface';
import History from '@/models/history.model';
import { Transaction } from 'sequelize';

export const createHistoryRecord = async (
	historyData: Omit<IHistoryCreate, 'id' | 'createdAt'>,
	transaction: Transaction = null,
) => {
	try {
		await History.create(
			{
				...historyData,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{ transaction },
		);
	} catch (error) {
		throw new Error(error);
	}
};
