import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { createHistoryRecord } from '@/helpers/history.helper';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import { IRotationCreate, RotationAttributes } from '@/interfaces/model/rotation.interface';
import Rotation from '@/models/rotation.model';
import User from '@/models/user.model';
import { parse } from '@/utils/common.util';
import BaseRepository from './base.repository';

export default class RotationRepo extends BaseRepository<Rotation> {
	constructor() {
		super(Rotation.name);
	}

	private msg = new MessageFormation('Rotation').message;

	async getAllRotation(query: IQueryParameters) {
		const { page, limit, sortBy, sort } = query;
		const sortedColumn = sortBy || null;
		let data = await this.getAllData({
			where: { deletedAt: null },
			offset: page && limit ? (page - 1) * limit : undefined,
			limit: limit ?? undefined,
			order: [[sortedColumn ?? 'name', sort ?? 'asc']],
		});
		data = parse(data);
		const responseObj = {
			data: data?.rows,
			count: data?.count,
			currentPage: page ?? undefined,
			limit: limit ?? undefined,
			lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
		};
		return responseObj;
	}

	async getRotationData() {
		let data = await this.getAllData({
			where: { deletedAt: null },
			attributes: ['name', 'id'],
			order: [['name', 'asc']],
		});
		data = parse(data);
		const responseObj = {
			data: data?.rows,
			count: data?.count,
		};
		return responseObj;
	}

	async getRotationById(id: number) {
		let data = await Rotation.findOne({
			where: {
				id: id,
				deletedAt: null,
			},
		});
		if (!data) {
			throw new HttpException(404, this.msg.notFound);
		}
		data = parse(data);
		return data;
	}

	async addRotation({ body, user }: { body: IRotationCreate; user: User }) {
		const isExistRotation = await Rotation.findOne({
			where: {
				name: body.name,
			},
		});

		if (isExistRotation) {
			throw new HttpException(200, this.msg.exist, {}, true);
		}
		const weekOn = body.weekOn;
		const weekOff = body.weekOff;
		let description = '';
		const daysWorked = body.daysWorked ? body.daysWorked.split(',') : [];
		let isAllDays = false;

		if (daysWorked.length == 7) {
			isAllDays = true;
		}

		const dayWork = body.daysWorked ? body.daysWorked : '';
		if (body.isResident) {
			if (weekOff != undefined) {
				description = `Resident ${weekOff} days off, working ${isAllDays ? 'all days' : dayWork}`;
			}
		} else {
			if (weekOn != undefined && weekOff != undefined) {
				description = `Rotation ${weekOn} weeks on and ${weekOff} weeks off`;
			}
		}
		let data = await Rotation.create({ ...body, description, isAllDays, createdBy: user.id });
		data = parse(data);

		await createHistoryRecord({
			tableName: tableEnum.ROTATION,
			jsonData: parse(data),
			status: statusEnum.CREATE,
		});

		return data;
	}

	async updateRotation({ body, user, id }: { body: RotationAttributes; user: User; id: number }) {
		const isExistRotation = await Rotation.findOne({
			where: {
				id: id,
				deletedAt: null,
			},
		});

		if (!isExistRotation) {
			throw new HttpException(404, this.msg.notFound);
		}
		const weekOn = body.weekOn;
		const weekOff = body.weekOff;
		let description = '';
		const daysWorked = body.daysWorked ? body.daysWorked.split(',') : [];
		let isAllDays = false;
		if (daysWorked.length == 7) {
			isAllDays = true;
		}
		const dayWork = body.daysWorked ? body.daysWorked : '';
		if (body.isResident) {
			if (weekOff != undefined && weekOff != null) {
				description = `Resident ${weekOff} days off, working ${isAllDays ? 'all days' : dayWork}`;
			}
		} else {
			if (weekOn != undefined && weekOn != null && weekOff != undefined && weekOff != null) {
				description = `Rotation ${weekOn} weeks on and ${weekOff} weeks off`;
			}
		}
		await Rotation.update(
			{ ...body, description, isAllDays, updatedBy: user.id },
			{ where: { id: id, deletedAt: null } },
		);
		const updatedData = await this.getRotationById(id);

		await createHistoryRecord({
			tableName: tableEnum.ROTATION,
			jsonData: parse(updatedData),
			status: statusEnum.UPDATE,
		});

		return updatedData;
	}

	async deleteRotation(id: number) {
		const isExistRotation = await Rotation.findOne({
			where: {
				id: id,
				deletedAt: null,
			},
		});

		if (!isExistRotation) {
			throw new HttpException(404, this.msg.notFound);
		}
		let data = await Rotation.destroy({
			where: {
				id: id,
			},
		});
		data = parse(data);
		return data;
	}
}
