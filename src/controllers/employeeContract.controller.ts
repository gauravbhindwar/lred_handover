import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import EmployeeContractRepo from '@/repository/employeeContract.repository';
import generalResponse from '@/utils/generalResponse';

class EmployeeContractController {
	private EmployeeContractService = new EmployeeContractRepo();
	private msg = new MessageFormation('Employee Contract').message;

	/**
	 * Get Employee Contract Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findAllEmployeeContract = catchAsync(async (req: Request, res: Response) => {
		const { page, limit, clientId, employeeId, sort, sortBy } = req.query;
		const responseData = await this.EmployeeContractService.getAllEmployeeContractService(
			Number(page),
			Number(limit),
			Number(clientId),
			Number(employeeId),
			sort && String(sort),
			sortBy && String(sortBy),
		);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Get Employee Contract End Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findAllEmployeeContractEnd = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.EmployeeContractService.getAllEmployeeContractEndService(
			req.query,
			req.user as User,
		);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getEmployeeContractNumber = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.EmployeeContractService.getEmployeeContractNumber();
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Get By Id Employee Contract Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findEmployeeContractServiceById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.EmployeeContractService.getEmployeeContractByIdService(+id, req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Add Employee Contract Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public addEmployeeContract = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.EmployeeContractService.addEmployeeContract({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateEmployeeContractEnd = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.EmployeeContractService.updateEmployeeContractEnd({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	/**
	 * Update Employee Contract Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */

	public updateEmployeeContract = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.EmployeeContractService.updateEmployeeContract({
			body: req.body,
			user: req.user as User,
			id: Number(id),
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	/**
	 * Delete Employee Contract Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteEmployeeContract = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.EmployeeContractService.deleteEmployeeContractService({
			id: Number(id),
		});
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default EmployeeContractController;
