import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import ClientRepo from '@/repository/client.repository';
import { getFiles } from '@/utils/common.util';
import generalResponse from '@/utils/generalResponse';
import _ from 'lodash';

class ClientController {
	private ClientService = new ClientRepo();
	private msg = new MessageFormation('Client').message;

	public findAllClient = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ClientService.getAllClientService(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findAllClientForSearchDropdown = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ClientService.findAllClientForSearchDropdown(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getClientData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ClientService.getClientData(req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findClientById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ClientService.getClientByIdService(Number(id));
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findClientBySlug = catchAsync(async (req: Request, res: Response) => {
		const slug = req.params.slug;
		const responseData = await this.ClientService.getClientBySlugService(slug);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Add Client Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public addClient = catchAsync(async (req: Request, res: Response) => {
		const logo = getFiles(req);
		req.body = { ...req.body, logo: logo?.logo ?? null, stampLogo: logo?.stampLogo ?? null };
		_.omit(req.body, 'logo');
		_.omit(req.body, 'stampLogo');

		const responseData = await this.ClientService.addClientService({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	/**
	 * Update Client Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public updateClientStatus = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ClientService.updateClientStatus({
			body: req.body,
			id: +id,
		});
		return generalResponse(
			req,
			res,
			responseData,
			responseData.isActive === true ? 'Client Activated Successfully' : 'Client Archived Successfully',
			'success',
			true,
		);
	});

	public updateClient = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const logo = getFiles(req);
		req.body = {
			...req.body,
			logo: req?.body?.logo ? req?.body?.logo : logo?.logo ?? null,
			stampLogo: req?.body?.stampLogo ? req?.body?.stampLogo : logo?.stampLogo ?? null,
		};
		_.omit(req.body, 'logo');
		_.omit(req.body, 'stampLogo');
		// const { file: files } = req;
		// if (files) req.body = { ...req.body, logo: `/logo/${files.filename}` };
		// _.omit(req.body, 'logo');

		const responseData = await this.ClientService.updateClientService({
			body: req.body,
			user: req.user as User,
			id: Number(id),
			// image: image as Express.Multer.File,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	/**
	 * Delete Client Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteClient = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ClientService.deleteClientService({
			id: Number(id),
		});
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});

	public findClientFonction = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ClientService.findClientFonction(Number(id));
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});
}

export default ClientController;
