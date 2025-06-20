import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { ContactAttributes, IContactCreate } from '@/interfaces/model/contact.interface';
import Client from '@/models/client.model';
import Contact from '@/models/contact.model';
import LoginUser from '@/models/loginUser.model';
import User from '@/models/user.model';
import { createRandomHash, parse } from '@/utils/common.util';
import { Op } from 'sequelize';
import slugify from 'slugify';
import BaseRepository from './base.repository';
import { createHistoryRecord } from '@/helpers/history.helper';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';

export default class ContactRepo extends BaseRepository<Contact> {
	constructor() {
		super(Contact.name);
	}

	private msg = new MessageFormation('Contact').message;

	async getAllContacts(query: IQueryParameters) {
		const { page, limit, clientId, sortBy, sort, search } = query;
		const sortedColumn = sortBy || null;
		let data = await this.getAllData({
			where: {
				deletedAt: null,
				...(clientId ? { clientId: clientId } : {}),
				...(search && {
					[Op.or]: {
						name: { [Op.iLike]: '%' + search.toLowerCase() + '%' },
						email: { [Op.iLike]: '%' + search.toLowerCase() + '%' },
					},
				}),
			},
			include: [
				{ model: Client, attributes: ['id'], include: [{ model: LoginUser, attributes: ['name'] }] },
				{ model: User, attributes: ['id'], include: [{ model: LoginUser, attributes: ['name'] }] },
			],
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

	async getContactData(query: IQueryParameters) {
		const { clientId } = query;
		let data = await this.getAllData({
			where: {
				deletedAt: null,
				...(clientId ? { clientId: clientId } : {}),
			},
			include: [
				{ model: Client, attributes: ['id'], include: [{ model: LoginUser, attributes: ['name'] }] },
				{ model: User, attributes: ['id'], include: [{ model: LoginUser, attributes: ['name'] }] },
			],
			attributes: ['id', 'name'],
			order: [['name', 'asc']],
		});
		data = parse(data);
		const responseObj = {
			data: data?.rows,
			count: data?.count,
		};
		return responseObj;
	}

	async getContactById(id: number) {
		let data = await Contact.findOne({
			where: { id: id, deletedAt: null },
		});
		if (!data) {
			throw new HttpException(404, this.msg.notFound);
		}
		data = parse(data);
		return data;
	}

	async getContactBySlugService(slug: string) {
		let data = await Contact.findOne({
			where: { slug: slug, deletedAt: null },
		});
		if (!data) {
			throw new HttpException(404, this.msg.notFound);
		}
		data = parse(data);
		return data;
	}

	async addContact({ body, user }: { body: IContactCreate; user: User }) {
		const isExistContact = await Contact.findOne({
			where: {
				email: body.email,
			},
		});

		if (isExistContact) {
			throw new HttpException(200, this.msg.exist, {}, true);
		}

		const slugifyContact = body.name + createRandomHash(5);
		const slug = slugify(slugifyContact, { lower: true, replacement: '-' });

		let data = await Contact.create({ ...body, slug, createdBy: user.id });
		data = parse(data);
		data = await this.getContactById(data.id);

		await createHistoryRecord({
			tableName: tableEnum.CONTACT,
			jsonData: parse(data),
			status: statusEnum.CREATE,
		});

		return data;
	}

	async updateContact({ body, user, id }: { body: ContactAttributes; user: User; id: number }) {
		const isDataFound = await Contact.findOne({
			where: { id: id, deletedAt: null },
		});

		if (!isDataFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const slugifyContact = body.name + createRandomHash(5);
		const slug = slugify(slugifyContact, { lower: true, replacement: '-' });

		await Contact.update({ ...body, slug, updatedBy: user.id }, { where: { id: id, deletedAt: null } });
		const updatedData = await this.getContactById(id);

		await createHistoryRecord({
			tableName: tableEnum.CONTACT,
			jsonData: parse(updatedData),
			status: statusEnum.UPDATE,
		});

		return updatedData;
	}

	async deleteContact(id: number) {
		const isDataFound = await Contact.findOne({
			where: { id: id, deletedAt: null },
		});
		if (!isDataFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = await Contact.destroy({ where: { id: id } });
		return data;
	}
}
