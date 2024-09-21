import express from 'express';
import dayRoutes from './dayRoutes';
import exerciseRoutes from './exerciseRoutes';
import dayExerciseRoutes from './dayExerciseRoutes';

const router = express.Router();

router.use('/days', dayRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/dayExercises', dayExerciseRoutes);

export default router;