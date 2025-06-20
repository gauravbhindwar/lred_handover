import { MessageFormation } from '@/constants/messages.constants';
import db from '@/models';
import User from '@/models/user.model';
import AccountPORepo from '@/repository/accountPo.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class AccountPOController {
	private AccountPOService = new AccountPORepo();
	private msg = new MessageFormation('AccountPO').message;

	public getAllSegmentsData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.AccountPOService.getAllSegmentsData(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	// public getAllAccountSummaryData = catchAsync(async (req: Request, res: Response) => {
	// 	const responseData = await this.AccountPOService.getAllAccountSummaryData(req.query);
	// 	return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	// });

	public getAllAccountPOData = catchAsync(async (req: Request, res: Response) => {
		const clientId = req.params.id;
		const responseData = await this.AccountPOService.getAllAccountPOData(+clientId, req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAllAccountPODataByEmployee = catchAsync(async (req: Request, res: Response) => {
		const clientId = req.params.id;
		const responseData = await this.AccountPOService.getAllAccountPODataByEmployee(
			+clientId,
			req.query,
			req.user as User,
		);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
		const transaction = await db.transaction();
		try {
			const ids = req?.body?.ids;
			const responseData = [];
			for (const id of ids) {
				const data = await this.AccountPOService.updatePaymentStatus({ id: +id, user: req.user as User }, transaction);
				responseData.push(data);
			}
			transaction.commit();
			return generalResponse(req, res, responseData, 'Invoice generated Successfully', 'success', true);
		} catch (error) {
			await transaction.rollback();
			return generalResponse(req, res, error, this.msg.wrong, 'error', true, 400);
		}
	});
}
export default AccountPOController;
