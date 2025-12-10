import { Router } from 'express';
import { getSchedules, createSchedule, deleteSchedule, toggleSchedule } from '../controllers/schedule.controller';

const router = Router();

router.get('/', getSchedules);
router.post('/', createSchedule);
router.delete('/:id', deleteSchedule);
router.patch('/:id/toggle', toggleSchedule);

export default router;
