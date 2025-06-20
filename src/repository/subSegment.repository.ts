import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { createHistoryRecord } from '@/helpers/history.helper';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import { ISubSegmentCreate } from '@/interfaces/model/subSegment.interface';
import Segment from '@/models/segment.model';
import User from '@/models/user.model';
import UserSegment from '@/models/userSegment.model';
import UserSegmentApproval from '@/models/userSegmentApproval.model';
import { getSubSegmentAccessForUser, parse } from '@/utils/common.util';
import { Op } from 'sequelize';
import slugify from 'slugify';
import { default as SubSegment } from '../models/subSegment.model';
import BaseRepository from './base.repository';

export default class SubSegmentRepo extends BaseRepository<SubSegment> {
	constructor() {
		super(SubSegment.name);
	}

	private msg = new MessageFormation('SubSegment').message;

	async getAllSubSegmentService(query: IQueryParameters, user: User) {
		const { page, limit, clientId, segmentId, sortBy, sort, isActive } = query;
		const subSegmentIds = getSubSegmentAccessForUser(user);
		const sortedColumn = sortBy || null;
		let data = await this.getAllData({
			where: {
				deletedAt: null,
				...(isActive !== undefined && { isActive }),
				...(segmentId && { segmentId: segmentId }),
				...(subSegmentIds?.length > 0 && { id: { [Op.in]: subSegmentIds } }),
			},
			include: [{ model: Segment, attributes: ['id', 'name'], where: { ...(clientId ? { clientId: clientId } : {}) } }],
			offset: page && limit ? (page - 1) * limit : undefined,
			limit: limit ?? undefined,
			// order: [[sortedColumn ?? 'code', sort ?? 'asc']],
			order: [
				['segment', 'name', 'asc'],
				['name', 'asc'],
			],
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

	async getSubSegmentDataService(query: IQueryParameters, user: User) {
		const { segmentId, isActive } = query;
		const subSegmentIds = getSubSegmentAccessForUser(user);
		let data = await this.getAllData({
			where: {
				deletedAt: null,
				segmentId: segmentId,
				...(subSegmentIds?.length > 0 && { id: { [Op.in]: subSegmentIds } }),
				...(isActive && { isActive }),
			},
			attributes: ['id', 'name'],
			order: [['code', 'asc']],
		});
		data = parse(data);
		const responseObj = {
			data: data?.rows,
			count: data?.count,
		};
		return responseObj;
	}

	async getSubSegmentByIdService(id: number) {
		const isFound = await SubSegment.findOne({
			where: { id: id, deletedAt: null },
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = parse(isFound);
		return data;
	}

	async getSubSegmentBySlugService(slug: string) {
		const isFound = await SubSegment.findOne({
			include: [
				{
					model: Segment,
					attributes: ['name'],
				},
			],
			where: { slug: slug, deletedAt: null },
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = parse(isFound);
		return data;
	}

	async addSubSegmentService({ body, user }: { body: ISubSegmentCreate; user: User }) {
		const isExist = await SubSegment.findOne({ where: { code: body.code, segmentId: body.segmentId } });

		if (isExist) {
			throw new HttpException(200, this.msg.exist, {}, true);
		}

		const uniqueSlug = body.name + body.code;

		const slug = slugify(uniqueSlug, { lower: true, replacement: '-' });

		let data = await SubSegment.create({ ...body, slug, createdBy: user.id });
		data = parse(data);

		await createHistoryRecord({
			tableName: tableEnum.SUB_SEGMENT,
			jsonData: parse(data),
			status: statusEnum.CREATE,
		});

		return data;
	}

	async updateSubSegmentService({ body, user, id }: { body: ISubSegmentCreate; user: User; id: number }) {
		let isExist = await SubSegment.findOne({
			where: { code: body.code, id: { [Op.ne]: id }, segmentId: body.segmentId },
		});

		if (isExist) {
			throw new HttpException(200, this.msg.exist, {}, true);
		}

		isExist = await SubSegment.findOne({ where: { id: id, deletedAt: null } });

		if (!isExist) {
			throw new HttpException(404, this.msg.notFound);
		}

		const uniqueSlug = body.name + body.code;

		const slug = slugify(uniqueSlug, { lower: true, replacement: '-' });

		await SubSegment.update({ ...body, slug, updatedBy: user.id }, { where: { id: id } });
		const data = await this.getSubSegmentByIdService(id);

		await createHistoryRecord({
			tableName: tableEnum.SUB_SEGMENT,
			jsonData: parse(data),
			status: statusEnum.UPDATE,
		});

		return data;
	}

	async updateSubSegmentStatus({ body, id }: { body: ISubSegmentCreate; id: number }) {
		const isExistClient = await SubSegment.findOne({ where: { id: id } });
		if (!isExistClient) {
			throw new HttpException(404, this.msg.notFound);
		}

		await SubSegment.update({ isActive: body.isActive }, { where: { id: id } });
		const data = await this.getSubSegmentByIdService(id);
		return data;
	}

	async deleteSubSegmentService({ id }: { id: number }) {
		const isFound = await SubSegment.findOne({ where: { id: id } });
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = await SubSegment.destroy({ where: { id: id } });

		await Promise.all([
			UserSegment.destroy({ where: { subSegmentId: isFound.id, deletedAt: null } }),
			UserSegmentApproval.destroy({ where: { subSegmentId: isFound.id, deletedAt: null } }),
		]);
		return data;
	}
}
