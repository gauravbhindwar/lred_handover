import Joi from 'joi';

export const BonusTypeCreateSchema = Joi.object({
	code: Joi.string().trim().label('Code').required(),
	name: Joi.string().trim().label('Bonus Type Name').required(),
	basePrice: Joi.number().label('Base Price').required(),
	dailyCost: Joi.number().label('Daily Cost').required(),
	timesheetName: Joi.string().trim().label('Timesheet Name').required(),
	isActive: Joi.boolean().default(true),
}).options({
	abortEarly: false,
});

export const BonusTypeUpdateSchema = Joi.object({
	code: Joi.string().trim().label('Code'),
	name: Joi.string().trim().label('Bonus Type Name'),
	basePrice: Joi.number().label('Base Price'),
	dailyCost: Joi.number().label('Daily Cost'),
	timesheetName: Joi.string().trim().label('Timesheet Name'),
	isActive: Joi.boolean(),
}).options({
	abortEarly: false,
});

export const BonusTypeStatusUpdateSchema = Joi.object({
	isActive: Joi.boolean().required(),
}).options({
	abortEarly: false,
});
