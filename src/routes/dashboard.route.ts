import DashboardController from '@/controllers/dashboard.controller';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';

import { Router } from 'express';

class DashboardRoute implements Routes {
	public path = '/dashboard';
	public router = Router();
	public DashboardController = new DashboardController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(`${this.path}`, authMiddleware, this.DashboardController.getAllDashboardData); //Get all Dashboard Data

		this.router.get(`${this.path}/employee-data`, authMiddleware, this.DashboardController.getAllEmployeeData); //Get all Employee Data

		this.router.get(`${this.path}/transport-data`, authMiddleware, this.DashboardController.getAllTransportData); //Get all Transport Data

		this.router.get(`${this.path}/user-accounts`, authMiddleware, this.DashboardController.getAllUserAccountsData); //Get all User Account Data
	}
}

export default DashboardRoute;
