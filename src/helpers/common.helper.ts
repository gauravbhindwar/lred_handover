import { Request } from 'express';

export const isNumeric = (n: any) => {
	return n && !isNaN(parseFloat(n)) && isFinite(n);
};

export const cleanObj = (obj: { [key: string]: any }) => {
	Object.keys(obj).forEach((key: string) => {
		try {
			if (obj[key] === '') {
				obj[key] = null;
			} else if (typeof obj[key] === 'string') {
				obj[key] = JSON.parse(obj[key]);
			}
		} catch (err) {
			// do nothing
		}
	});
	return obj;
};

export const dateFormat = (value: string | Date | null | undefined) => {
	if (value) {
		if (!Number.isNaN(new Date(value).getTime())) {
			return new Date(value);
		}
		return null;
	}
	return null;
};

export const checkParamId = (value: string | number, moduleName: string) => {
	const param = Number(value);
	if (!param || isNaN(param) || param === undefined) {
		throw new Error(`${moduleName} id is missing`);
	}
	return param;
};

export const getPaginationParams = (req: Request) => {
	const page: number = req.query.page ? Number(req.query.page) : 1;
	const limit = req.query.limit ? Number(req.query.limit) : 10;
	const clientId = req.query.clientId ? req.query.clientId : undefined;
	const employeeId = req.query.employeeId ? req.query.employeeId : undefined;
	const search = req.query.search && req.query.search.toString() !== '' ? req.query.search.toString() : '';
	const skip: number = (Number(page) - 1) * Number(limit);
	const filter = req.query.filter ? req.query.filter : false;
	const id = req.query.id ? Number(req.query.id) : null;
	const listView = !!req.query.view;
	return { page, limit, search, skip, filter, id, listView, clientId, employeeId };
};

export const getDate = (date: any) => {
	const dateOffset = 24 * 60 * 60 * 1000 * 1; //1 days
	const myDate = new Date(date);
	myDate.setTime(myDate.getTime() - dateOffset);
	return myDate.toISOString();
};

export const numDate = (date: number) => {
	const baseDate = new Date(1899, 11, 30, 0, 0, 0);
	const dateTime = baseDate.getTime() + (new Date().getTimezoneOffset() - baseDate.getTimezoneOffset()) * 60000;
	const dataTimeItem = new Date();
	dataTimeItem.setTime(date * 24 * 60 * 60 * 1000 + dateTime + 10000);
	return dataTimeItem.toISOString();
};

export const getMonthDateRange = async (year: number, month: number) => {
	const moment = require('moment');

	// month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
	// array is 'year', 'month', 'day', etc
	const startDate = moment([year, month - 1]);

	// Clone the value before .endOf()
	const endDate = moment(startDate).endOf('month');

	// make sure to call toDate() for plain JavaScript date type
	return { start: startDate.toISOString(), end: endDate.toISOString() };
};

export const getPageAndSize = (req: Request) => {
	const page: number | null = req.query.page ? Number(req.query.page) : null;
	const limit: number | null = req.query.limit ? Number(req.query.limit) : null;
	return { page, limit };
};

export const getFiles = (req: Request) => {
	const temp: { [key: string]: string | string[] } = {};

	if (req.files) {
		Object.entries(req.files).forEach((e) => {
			const [key, value] = e;

			if (value) {
				if (value.length === 1) {
					temp[key] = value[0].path.replace('public/', '');
				} else if (value.length > 1) {
					value.forEach((item) => {
						temp[key] = temp[key]
							? [...temp[key], item.path.replace('public/', '')]
							: [item.path.replace('public/', '')];
					});
				}
			}
		});
	}
	return temp;
};
