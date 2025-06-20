import { MessageFormation } from '@/constants/messages.constants';
import { createHistoryRecord } from '@/helpers/history.helper';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import User from '@/models/user.model';
import UserSegment from '@/models/userSegment.model';
import UserSegmentApproval from '@/models/userSegmentApproval.model';
import { parse } from '@/utils/common.util';
import BaseRepository from './base.repository';

export default class UserSegmentRepo extends BaseRepository<UserSegment> {
	constructor() {
		super(UserSegment.name);
	}

	private msg = new MessageFormation('User Segment').message;

	async updateUserSegmentData({
		body,
		user,
		id,
		clientId,
	}: {
		body: { type: string; segment: string[]; segmentApproval: string[] };
		user: User;
		id: number;
		clientId?: number;
	}) {
		const isExistUser = await User.findOne({ where: { id: id } });
		if (body.type === 'SEGMENT') {
			await UserSegment.destroy({ where: { userId: id, clientId: clientId || null }, force: true });
			for (const element of body.segment) {
				const segmentValue = element.split('-');
				await this.create({
					segmentId: Number(segmentValue[0]),
					subSegmentId: segmentValue[1] ? Number(segmentValue[1]) : null,
					userId: id,
					clientId: clientId || null,
					createdBy: user.id,
				});
			}
		} else if (body.type === 'SEGMENTAPPROVAL') {
			await UserSegmentApproval.destroy({ where: { userId: id, clientId: clientId || null }, force: true });
			for (const element of body.segmentApproval) {
				const segmentApprovalValue = element.split('-');
				await UserSegmentApproval.create({
					segmentId: Number(segmentApprovalValue[0]),
					subSegmentId: segmentApprovalValue[1] ? Number(segmentApprovalValue[1]) : null,
					userId: id,
					clientId: clientId || null,
					createdBy: user.id,
				});
			}
		}
		const responseData = parse(isExistUser);
		await createHistoryRecord({
			tableName: tableEnum.USER_SEGMENT,
			jsonData: parse(responseData),
			status: statusEnum.CREATE,
		});
		return responseData;
	}

	readonly deleteUserSegment = async (id: number, type: string) => {
		if (type === 'SEGMENT') {
			const isExistUserSegment = await this.get({
				where: { id, deletedAt: null },
			});
			if (isExistUserSegment) {
				await this.deleteData({ where: { id: id }, force: true });
				return true;
			}
		} else if (type === 'SEGMENTAPPROVAL') {
			const isExistUserSegmentApproval = await UserSegmentApproval.findOne({
				where: { id, deletedAt: null },
			});
			if (isExistUserSegmentApproval) {
				await UserSegmentApproval.destroy({ where: { id: id }, force: true });
				return true;
			}
		}
	};
}
