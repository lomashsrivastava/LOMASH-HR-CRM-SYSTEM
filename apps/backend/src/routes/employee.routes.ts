import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { createEmployee, getEmployees, updateEmployee, deleteEmployee } from '../controllers/employee.controller';

const router = express.Router();

router.use(protect);
router.get('/', getEmployees);
router.post('/', createEmployee);
router.post('/bulk', createEmployee); // Re-using create potentially? No, distinct route.
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

import { bulkCreateEmployees } from '../controllers/employee.controller';
router.post('/bulk-upload', bulkCreateEmployees);

export default router;
