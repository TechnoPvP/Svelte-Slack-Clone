import ApiError from '@errors/ApiError';
import { Status } from '@prisma/client';
import { status } from '@services/user-service';
import { catchAsync } from '@utils/ErrorUtil';
import { statusValidation } from '@validation/StatusValidation';
import { Request, Response } from 'express';

export const getStatus = catchAsync(async (req: Request, res: Response) => {
	const userId = parseInt(req.params.id, 10);
	if (!userId) throw new ApiError(`Invalid user id ${userId}`);

	const userStatus = await status.getStatus(userId);

	res.status(200).json(userStatus);
});

export const updateStatus = catchAsync(async (req: Request<{ id: string }, unknown, Status>, res: Response) => {
	const userId = parseInt(req.params.id, 10);
	if (!userId) throw new ApiError(`Invalid user id ${userId}`);

	const { error } = statusValidation.validate(req.body);
	if (error) throw new ApiError(error.message);

	const userStatus = await status.updateStatus(userId, req.body.status, req.body.emoji, req.body.clear_date);

	res.status(200).send(userStatus);
});

/* Unimplemented */
export const deleteStatus = catchAsync(async (req: Request<{ id: string }>, res: Response) => {
	const userId = parseInt(req.params.id, 10);
	if (!userId) throw new ApiError(`Invalid user id ${userId}`);

	const userStatus = await status.deleteStatus(userId);

	res.status(200).json(userStatus);
});
