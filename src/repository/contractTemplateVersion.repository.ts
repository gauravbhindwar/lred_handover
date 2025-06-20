import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { createHistoryRecord } from '@/helpers/history.helper';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { IContractTemplateVersionCreate } from '@/interfaces/model/contractTempleteVersion.interface';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import ContractTemplate from '@/models/contractTemplete.model';
import ContractTemplateVersion from '@/models/contractTempleteVersion.model';
import LoginUser from '@/models/loginUser.model';
import User from '@/models/user.model';
import { parse } from '@/utils/common.util';
import { Op } from 'sequelize';
import BaseRepository from './base.repository';

export default class ContractTemplateVersionRepo extends BaseRepository<ContractTemplateVersion> {
	constructor() {
		super(ContractTemplateVersion.name);
	}

	private msg = new MessageFormation('Contract Template Version').message;

	async getAllContractTemplateVersionService(query: IQueryParameters) {
		const { page, limit, contractTemplateId, clientId, sortBy, sort } = query;
		const sortedColumn = sortBy || null;
		let data = await this.getAllData({
			where: {
				deletedAt: null,
				[Op.or]: [{ clientId: clientId }, { clientId: null }],
				...(contractTemplateId ? { contractTemplateId: contractTemplateId } : {}),
			},
			offset: page && limit ? (page - 1) * limit : undefined,
			include: [
				{ model: User, attributes: ['loginUserId'], include: [{ model: LoginUser, attributes: ['name', 'email'] }] },
				{
					model: ContractTemplate,
					attributes: ['contractName', 'clientId'],
					where: {
						deletedAt: null,
					},
				},
			],

			limit: limit ?? undefined,
			order: [[sortedColumn ?? 'versionNo', sort ?? 'asc']],
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

	async getContractTemplateVersionDataService(query: IQueryParameters) {
		const { contractTemplateId, clientId } = query;
		let data = await this.getAllData({
			where: {
				[Op.or]: [{ clientId: clientId }, { clientId: null }],
				contractTemplateId: contractTemplateId,
				deletedAt: null,
			},
			attributes: ['id', 'versionName'],
			order: [['versionNo', 'asc']],
		});
		data = parse(data);
		const responseObj = {
			data: data?.rows,
			count: data?.count,
		};
		return responseObj;
	}

	async findAllContractTemplateVersionLastInsertedData(query: IQueryParameters) {
		const { contractTemplateId, clientId } = query;
		const isFoundData = await ContractTemplateVersion.findAll({
			where: {
				[Op.or]: [{ clientId: clientId }, { clientId: null }],
				deletedAt: null,
				contractTemplateId: contractTemplateId,
			},
			limit: 1,
			attributes: ['id', 'description'],
			order: [['createdAt', 'DESC']],
		});
		if (!isFoundData) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = parse(isFoundData);
		return data;
	}

	async getContractTemplateVersionByIdService(id: number) {
		const isFound = await ContractTemplateVersion.findOne({
			where: { id: id, deletedAt: null },
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = parse(isFound);
		return data;
	}

	async addContractTemplateVersion({ body, user }: { body: IContractTemplateVersionCreate; user: User }) {
		const isExist = await ContractTemplateVersion.findOne({
			where: {
				description: body.description,
				contractTemplateId: body.contractTemplateId,
				...(body.clientId != undefined && { clientId: body.clientId }),
			},
		});
		if (isExist) throw new HttpException(200, this.msg.exist, {}, true);

		let data = await ContractTemplateVersion.create({ ...body, createdBy: user.id });

		data = parse(data);

		await createHistoryRecord({
			tableName: tableEnum.CONTRACT_TEMPLATE_VERSION,
			jsonData: parse(data),
			status: statusEnum.CREATE,
		});

		return data;
	}

	async updateContractTemplateVersion({
		body,
		user,
		id,
	}: {
		body: IContractTemplateVersionCreate;
		user: User;
		id: number;
	}) {
		const isExist = await ContractTemplateVersion.findOne({ where: { id: id, deletedAt: null } });
		if (!isExist) {
			throw new HttpException(200, this.msg.notFound, {}, true);
		}
		await ContractTemplateVersion.update({ ...body, updatedBy: user.id }, { where: { id: id } });
		const data = await this.getContractTemplateVersionByIdService(id);

		await createHistoryRecord({
			tableName: tableEnum.CONTRACT_TEMPLATE_VERSION,
			jsonData: parse(data),
			status: statusEnum.UPDATE,
		});

		return data;
	}

	async deleteContractTemplateVersionService({ id }: { id: number }) {
		const isExistUser = await this.get({
			where: { id, deletedAt: null },
			attributes: ['id'],
		});
		if (isExistUser) {
			await this.update({ deletedAt: new Date() }, { where: { id: +isExistUser.id } });
			let data = await this.getAllData({
				where: {
					id: {
						[Op.gt]: isExistUser.id,
					},
					deletedAt: null,
				},
				attributes: ['id', 'versionNo', 'contractTemplateId', 'description', 'isActive'],
				order: [['id', 'ASC']],
			});
			data = parse(data);

			const dataValue = [];
			data.rows.forEach((e: { id: number; versionNo: number }, index) => {
				const item = data.rows[index].versionNo - 1;
				dataValue.push({
					versionNo: item,
					id: e.id,
				});
			});

			let updateData;
			for (const iterator of dataValue) {
				updateData = await ContractTemplateVersion.update(
					{ versionNo: iterator.versionNo },
					{ where: { id: iterator.id } },
				);
			}

			return updateData;
		}
	}
}
