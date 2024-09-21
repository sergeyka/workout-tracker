import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Exercise, DaysExercises } from '../entities';
import { ILike } from 'typeorm';
import { setQueryLogging } from "../setQueryLogging";
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET search exercises
// TODO: exclude exercises that are already in the current day for the user
router.get('/search', async (req: AuthenticatedRequest, res) => {
  const { query } = req.query;
  const user_id = req.authenticatedUser?.id;
  const exerciseRepository = AppDataSource.getRepository(Exercise);
  if (typeof query !== 'string' || query.trim() === '') {
    return res.json([]);
  }

  try {
    setQueryLogging(AppDataSource, true);
    const exercises = await exerciseRepository.find({
      where: { name: ILike(`%${query}%`), user_id }
    });
    setQueryLogging(AppDataSource, false);
    res.json(exercises);
  } catch (error) {
    console.error('Error searching exercises:', error);
    res.status(500).json({ message: 'Error searching exercises' });
  }
});

// GET all exercises
router.get('/', async (req: AuthenticatedRequest, res) => {
  const user_id = req.authenticatedUser?.id;
  const exerciseRepository = AppDataSource.getRepository(Exercise);
  const exercises = await exerciseRepository.find({
    where: { user_id },
    order: { id: 'ASC' }
  });
  res.json(exercises);
});

// GET single exercise
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  const user_id = req.authenticatedUser?.id;
  const exerciseRepository = AppDataSource.getRepository(Exercise);
  const exercise = await exerciseRepository.findOne({ 
    where: { id: parseInt(req.params.id), user_id } 
  });
  if (!exercise) {
    return res.status(404).json({ message: 'Exercise not found' });
  }
  res.json(exercise);
});

// POST new exercise
router.post('/', async (req: AuthenticatedRequest, res) => {
  const user_id = req.authenticatedUser?.id;
  const exerciseRepository = AppDataSource.getRepository(Exercise);
  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);

  try {
    const { name, dayId } = req.body;

    // Create new exercise
    const newExercise = exerciseRepository.create({ name, user_id });
    const savedExercise = await exerciseRepository.save(newExercise);

    if (dayId) {
      // Get the max order for the current day
      const maxOrder = await daysExercisesRepository.createQueryBuilder('de')
        .where('de.day_id = :dayId AND de.user_id = :user_id', { dayId, user_id })
        .select('MAX(de.exercise_order)', 'maxOrder')
        .getRawOne();

      const newOrder = (maxOrder?.maxOrder || 0) + 1;

      // Create new DaysExercises entry
      const newDaysExercises = daysExercisesRepository.create({
        day_id: dayId,
        exercise_id: savedExercise.id,
        exercise_order: newOrder,
        user_id
      });
      await daysExercisesRepository.save(newDaysExercises);
    }

    res.status(201).json(savedExercise);
  } catch (error) {
    console.error('Error adding new exercise:', error);
    res.status(500).json({ message: 'Error adding new exercise' });
  }
});

// PUT update exercise
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  const user_id = req.authenticatedUser?.id;
  const exerciseRepository = AppDataSource.getRepository(Exercise);
  const exercise = await exerciseRepository.findOne({ 
    where: { id: parseInt(req.params.id), user_id } 
  });
  if (!exercise) {
    return res.status(404).json({ message: 'Exercise not found' });
  }
  try {
    exerciseRepository.merge(exercise, req.body);
    const result = await exerciseRepository.save(exercise);
    res.json(result);
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ message: 'Error updating exercise' });
  }
});

// DELETE exercise from a day
router.delete('/:id/day/:dayId', async (req: AuthenticatedRequest, res) => {
  const user_id = req.authenticatedUser?.id;
  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);
  const result = await daysExercisesRepository.delete({
    day_id: parseInt(req.params.dayId),
    exercise_id: parseInt(req.params.id),
    user_id
  });
  if (result.affected === 0) {
    return res.status(404).json({ message: 'Exercise not found for this day' });
  }
  res.json({ message: 'Exercise removed from day successfully' });
});

// DELETE exercise
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  const user_id = req.authenticatedUser?.id;
  const exerciseRepository = AppDataSource.getRepository(Exercise);
  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);

  try {
    const exerciseId = parseInt(req.params.id);

    // First, delete all associated entries in DaysExercises
    await daysExercisesRepository.delete({ exercise_id: exerciseId, user_id });

    // Then, delete the exercise
    const result = await exerciseRepository.delete({ id: exerciseId, user_id });

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ message: 'Error deleting exercise' });
  }
});

// PUT update exercise order
router.put('/:id/order', async (req: AuthenticatedRequest, res) => {
  const { day_id, newOrder } = req.body;
  const exercise_id = parseInt(req.params.id);
  const user_id = req.authenticatedUser?.id;

  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);

  try {
    const daysExercise = await daysExercisesRepository.findOne({
      where: {
        day_id,
        exercise_id,
        user_id
      }
    });

    if (!daysExercise) {
      return res.status(404).json({ message: 'Exercise not found for this day' });
    }

    daysExercise.exercise_order = newOrder;
    await daysExercisesRepository.save(daysExercise);

    res.json({ message: 'Exercise order updated successfully' });
  } catch (error) {
    console.error('Error updating exercise order:', error);
    res.status(500).json({ message: 'Error updating exercise order' });
  }
});

export default router;