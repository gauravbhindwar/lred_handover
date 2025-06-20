import Joi from 'joi';

export const EmployeeContractCreateSchema = Joi.object({
	newContractNumber: [
		Joi.string().label('New Contract Number').required(),
		Joi.number().label('New Contract Number').allow('', null),
	],
	startDate: Joi.date().label('Start Date').allow('', null),
	endDate: Joi.date().label('End Date').allow('', null),
	description: Joi.string().trim().label('First Name').allow(null, ''),
	employeeId: Joi.number().label('Employee Id').required(),
	contractTemplateId: Joi.number().label('Contract Version Id').required(),
	type: Joi.string().label('Type'), // For Edit time Create Purpose
	contractVersionId: Joi.number().label('Contract Version Id').required(),
	workOrderDate: Joi.date().label('Work Order Date').allow(null, ''),
	contractorsPassport: Joi.any().label('Contractors Passport').allow(null, ''),
	endOfAssignmentDate: Joi.date().label('End Of Assignment Date').allow(null, ''),
	descriptionOfAssignmentAndOrderConditions: Joi.string()
		.label('Description Of Assignment And Order Conditions')
		.allow(null),
	durationOfAssignment: Joi.string().label('Duration Of Assignment').allow(null, ''),
	workLocation: Joi.string().label('Work Location').allow(null, ''),
	workOrderNumber: Joi.any().label('Work Order Number').allow(null, ''),
	remuneration: Joi.number().label('Remuneration').allow(null, 0),
	workCurrency: Joi.string().label('Work Currency').allow(null, ''),
}).options({
	abortEarly: false,
});

export const EndEmployeeContractUpdateSchema = Joi.object({
	employeeId: Joi.array().items(Joi.number().label('Employee ids')).required(),
	endDate: Joi.date().label('End Date').allow('', null),
}).options({
	abortEarly: false,
});
export const EmployeeContractUpdateSchema = Joi.object({
	newContractNumber: [
		Joi.string().label('New Contract Number').required(),
		Joi.number().label('New Contract Number').allow('', null),
	],
	startDate: Joi.date().label('Start Date').allow('', null),
	endDate: Joi.date().label('End Date').allow('', null),
	firstName: Joi.string().trim().label('First Name').required(),
	middleName: Joi.string().trim().label('Middle Name').required(),
	address: Joi.string().trim().label('Address').allow('', null),
	dateOfBirth: Joi.date().label('Date of Birth').allow('', null),
	bonusId: Joi.number().label('Bonus Id').allow('', null),
	monthlySalary: Joi.number().label('Monthly Salary').allow('', null),
	lastName: Joi.string().trim().label('Last Name').required(),
	email: Joi.string().trim().label('Email').allow('', null),
	contactNumber: [
		Joi.string().trim().label('Mobile Number').allow('', null),
		Joi.number().label('Mobile Number').allow('', null),
	],
	employeeId: Joi.number().label('Employee Id').required(),
	contractVersionId: Joi.number().label('Contract Version Id').required(),
}).options({
	abortEarly: false,
});

export const EmployeeContractFetchAllSchema = Joi.object({
	page: Joi.number().label('Page'),
	limit: Joi.number().label('Limit'),
	sort: Joi.string().label('Sort'),
	sortBy: Joi.string().label('SortBy').allow('', null),
	clientId: Joi.number().label('Client Id').required(),
	employeeId: Joi.number().label('Employee Id').required(),
}).options({
	abortEarly: false,
});
