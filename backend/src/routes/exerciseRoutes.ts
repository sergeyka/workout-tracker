import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Exercise, DaysExercises } from '../entities';
import {ILike, Like} from 'typeorm';
import {setQueryLogging} from "../setQueryLogging";

const router = Router();



// GET search exercises
router.get('/search', async (req, res) => {
  const { query } = req.query;
  const exerciseRepository = AppDataSource.getRepository(Exercise);
  if (typeof query !== 'string' || query.trim() === '') {
    return res.json([]);
  }

  try {
    setQueryLogging(AppDataSource, true);
    const exercises = await exerciseRepository.find({
      where: { name: ILike(`%${query}%`) }
    });
    setQueryLogging(AppDataSource, false);
    console.log(exercises)
    res.json(exercises);
  } catch (error) {
    console.error('Error searching exercises:', error);
    res.status(500).json({ message: 'Error searching exercises' });
  }
});

// GET all exercises
router.get('/', async (req, res) => {
  const exerciseRepository = AppDataSource.getRepository(Exercise);
  const exercises = await exerciseRepository.find();
  res.json(exercises);
});

// GET single exercise
router.get('/:id', async (req, res) => {

  const exerciseRepository = AppDataSource.getRepository(Exercise);
  const exercise = await exerciseRepository.findOne({ where: { id: parseInt(req.params.id) } });
  if (!exercise) {
    return res.status(404).json({ message: 'Exercise not found' });
  }
  res.json(exercise);
});

// POST new exercise
router.post('/', async (req, res) => {
  const exerciseRepository = AppDataSource.getRepository(Exercise);
  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);

  try {
    const { name, dayId } = req.body;

    // Create new exercise
    const newExercise = exerciseRepository.create({ name });
    const savedExercise = await exerciseRepository.save(newExercise);

    if (dayId) {
      // Get the max order for the current day
      const maxOrder = await daysExercisesRepository.createQueryBuilder('de')
        .where('de.day_id = :dayId', { dayId })
        .select('MAX(de.exercise_order)', 'maxOrder')
        .getRawOne();

      const newOrder = (maxOrder?.maxOrder || 0) + 1;

      // Create new DaysExercises entry
      const newDaysExercises = daysExercisesRepository.create({
        day_id: dayId,
        exercise_id: savedExercise.id,
        exercise_order: newOrder
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
router.put('/:id', async (req, res) => {
  const exerciseRepository = AppDataSource.getRepository(Exercise);
  const exercise = await exerciseRepository.findOne({ where: { id: parseInt(req.params.id) } });
  if (!exercise) {
    return res.status(404).json({ message: 'Exercise not found' });
  }
  exerciseRepository.merge(exercise, req.body);
  console.log(req.body);
  const result = await exerciseRepository.save(exercise);
  console.log(result);
  res.json(result);
});

// DELETE exercise from a day
router.delete('/:id/day/:dayId', async (req, res) => {
  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);
  const result = await daysExercisesRepository.delete({
    day_id: parseInt(req.params.dayId),
    exercise_id: parseInt(req.params.id)
  });
  if (result.affected === 0) {
    return res.status(404).json({ message: 'Exercise not found for this day' });
  }
  res.json({ message: 'Exercise removed from day successfully' });
});



// PUT update exercise order
router.put('/:id/order', async (req, res) => {
  const { day_id, newOrder } = req.body;
  const exercise_id = parseInt(req.params.id);

  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);

  try {
    const daysExercise = await daysExercisesRepository.findOne({
      where: {
        day_id,
        exercise_id
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