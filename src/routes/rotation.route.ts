import RotationController from '@/controllers/rotation.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import { RotationCreateSchema, RotationUpdateSchema } from '@/validationSchema/rotation.validation';
import { Router } from 'express';

class RotationRoute implements Routes {
	public path = '/rotation';
	public router = Router();
	public RotationController = new RotationController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Rotation, PermissionEnum.View),
			this.RotationController.getAllRotation,
		); // Get All Rotations (Private)

		this.router.get(`${this.path}/get-rotation-data`, authMiddleware, this.RotationController.getRotationData); // Get Rotations Data (Public)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Rotation, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.RotationController.getRotationById,
		); // Get Rotation By ID (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Rotation, PermissionEnum.Create),
			validationMiddleware(RotationCreateSchema, 'body'),
			this.RotationController.addRotation,
		); // Add Rotation (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Rotation, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(RotationUpdateSchema, 'body'),
			this.RotationController.updateRotation,
		); // Update Rotation (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Rotation, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.RotationController.deleteRotation,
		); // Delete Rotation (Private)
	}
}

export default RotationRoute;
