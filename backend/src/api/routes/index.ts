import { Router, Request, Response } from 'express';

const router = Router();

/* GET home page. */
router.get('/blog/test', (req: Request, res: Response) => {
	res.redirect('/blog/user');
});

export default router;
