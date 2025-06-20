import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import DashboardRepo from '@/repository/dashboard.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class DashboardController {
	private DashboardService = new DashboardRepo();
	private msg = new MessageFormation('Dashboard').message;

	public getAllDashboardData = catchAsync(async (req: Request, res: Response) => {
		const contractEndFilter = req.query.contractEndFilter;
		const responseData = await this.DashboardService.getAllDashboardData(
			req.query,
			+contractEndFilter,
			req.user as User,
		);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAllEmployeeData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.DashboardService.getAllEmployeeData(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAllTransportData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.DashboardService.getAllTransportData(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAllUserAccountsData = catchAsync(async (req: Request, res: Response) => {
		const clientId = req.query.clientId;
		const userAccountFilter = req.query.userAccountFilter;
		const responseData = await this.DashboardService.getAllUserAccountsData(+userAccountFilter, +clientId);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});
}

export default DashboardController;
