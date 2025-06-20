import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { createHistoryRecord } from '@/helpers/history.helper';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import { IRequestTypeCreate, RequestTypeAttributes } from '@/interfaces/model/requestType.interface';
import RequestType from '@/models/requestType.model';
import User from '@/models/user.model';
import { parse } from '@/utils/common.util';
import _ from 'lodash';
import BaseRepository from './base.repository';

export default class RequestTypeRepo extends BaseRepository<RequestType> {
	constructor() {
		super(RequestType.name);
	}

	private msg = new MessageFormation('RequestType').message;

	async getAllRequestType(query: IQueryParameters) {
		const { page, limit, isActive, sortBy, sort } = query;
		const sortedColumn = sortBy || null;
		let data = await this.getAllData({
			where: {
				deletedAt: null,
				...(isActive != undefined && { isActive: isActive }),
			},
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

	async getRequestTypeData() {
		let data = await this.getAllData({
			where: {
				deletedAt: null,
			},
			attributes: ['id', 'name', 'isActive'],
			order: [['name', 'asc']],
		});
		data = parse(data);
		const responseObj = {
			data: data?.rows,
			count: data?.count,
		};
		return responseObj;
	}

	async getRequestTypeById(id: number) {
		let data = await RequestType.findOne({
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

	async addRequestType({ body, user }: { body: IRequestTypeCreate; user: User }) {
		const bodyData = _.omit(body, 'notificationEmails');
		const notificationEmails = body.notificationEmails ? body.notificationEmails.toString() : '';

		const isExistRequestType = await RequestType.findOne({
			where: {
				name: body.name,
			},
		});
		if (isExistRequestType) {
			throw new HttpException(200, this.msg.exist, {}, true);
		}
		let data = await RequestType.create({ ...bodyData, notificationEmails, createdBy: user.id });
		data = parse(data);

		await createHistoryRecord({
			tableName: tableEnum.REQUEST_TYPE,
			jsonData: parse(data),
			status: statusEnum.CREATE,
		});

		return data;
	}

	async updateRequestTypeStatus({ body, id }: { body: IRequestTypeCreate; id: number }) {
		const isExistRequestType = await RequestType.findOne({ where: { id: id } });
		if (!isExistRequestType) {
			throw new HttpException(404, this.msg.notFound);
		}

		await RequestType.update({ isActive: body.isActive }, { where: { id: id } });
		const data = await this.getRequestTypeById(id);
		return data;
	}

	async updateRequestType({ body, user, id }: { body: RequestTypeAttributes; user: User; id: number }) {
		const bodyData = _.omit(body, 'notificationEmails');
		const notificationEmails = body.notificationEmails?.toString();

		const isExistRequestType = await RequestType.findOne({
			where: {
				id: id,
				deletedAt: null,
			},
		});
		if (!isExistRequestType) {
			throw new HttpException(404, this.msg.notFound);
		}
		await RequestType.update({ ...bodyData, notificationEmails, updatedBy: user.id }, { where: { id: id } });
		const updatedData = await this.getRequestTypeById(id);

		await createHistoryRecord({
			tableName: tableEnum.REQUEST_TYPE,
			jsonData: parse(updatedData),
			status: statusEnum.UPDATE,
		});

		return updatedData;
	}

	async deleteRequestType(id: number) {
		const isExistRequestType = await RequestType.findOne({
			where: {
				id: id,
				deletedAt: null,
			},
		});
		if (!isExistRequestType) {
			throw new HttpException(404, this.msg.notFound);
		}
		let data = await RequestType.update({ deletedAt: new Date() }, { where: { id: id } });
		data = parse(data);
		return data;
	}
}
