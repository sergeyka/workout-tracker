import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Day, Exercise, DaysExercises } from '../entities';

const router = Router();

router.get('/', async (req, res) => {
  const dayRepository = AppDataSource.getRepository(Day);
  const days = await dayRepository.find({ order: { week: 'ASC', day_of_week: 'ASC' } });
  res.json(days);
});

router.get('/:id/exercises', async (req, res) => {
  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);
  const exercises = await daysExercisesRepository.find({
    where: { day_id: parseInt(req.params.id) },
    relations: ['exercise'],
    order: { exercise_order: 'ASC' },
  });
  res.json(exercises.map(de => ({
    id: de.exercise.id,
    name: de.exercise.name,
    weight: de.exercise.weight,
    notes: de.exercise.notes,
    dayExerciseId: de.id,
    day_id: de.day_id,
    exercise_order: de.exercise_order
  })));
});

router.post('/:id/exercises', async (req, res) => {
  const day_id = parseInt(req.params.id);
  const { exercise_id } = req.body;

  const dayRepository = AppDataSource.getRepository(Day);
  const exerciseRepository = AppDataSource.getRepository(Exercise);
  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);

  try {
    const day = await dayRepository.findOne({ where: { id: day_id } });
    const exercise = await exerciseRepository.findOne({ where: { id: exercise_id } });

    if (!day || !exercise) {
      return res.status(404).json({ message: 'Day or Exercise not found' });
    }

    const maxOrderResult = await daysExercisesRepository.findOne({
      where: { day_id },
      order: { exercise_order: 'DESC' },
    });

    const newOrder = maxOrderResult ? maxOrderResult.exercise_order + 1 : 1;

    const newDaysExercises = daysExercisesRepository.create({
      day_id,
      exercise_id,
      exercise_order: newOrder,
    });

    await daysExercisesRepository.save(newDaysExercises);

    res.status(201).json({ message: 'Exercise added to day successfully', order: newOrder });
  } catch (error) {
    console.error('Error adding exercise to day:', error);
    res.status(500).json({ message: 'Error adding exercise to day' });
  }
});

router.put('/:id/exercises/reorder', async (req, res) => {
  const dayId = parseInt(req.params.id);
  const reorderedExercises = req.body;

  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);

  try {
    await AppDataSource.manager.transaction(async transactionalEntityManager => {
      // Step 1: Assign temporary order values
      for (let i = 0; i < reorderedExercises.length; i++) {
        await transactionalEntityManager.update(DaysExercises,
          { id: reorderedExercises[i].id },
          { exercise_order: -1 * (i + 1) } // Temporary negative values
        );
      }

      // Step 2: Assign final order values
      for (let i = 0; i < reorderedExercises.length; i++) {
        await transactionalEntityManager.update(DaysExercises,
          { id: reorderedExercises[i].id },
          { exercise_order: reorderedExercises[i].order} 
        );
      }
    });

    console.log('Exercises reordered successfully');
    res.json({ message: 'Exercises reordered successfully' });
  } catch (error) {
    console.error('Error reordering exercises:', error);
    res.status(500).json({ message: 'Error reordering exercises' });
  }
});

router.delete('/:dayId/exercises/:exerciseId', async (req, res) => {
  const day_id = parseInt(req.params.dayId);
  const exercise_id = parseInt(req.params.exerciseId);

  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);

  try {
    const result = await daysExercisesRepository.delete({
      day_id,
      exercise_id,
    });

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Exercise not found for this day' });
    }

    res.json({ message: 'Exercise removed from day successfully' });
  } catch (error) {
    console.error('Error removing exercise from day:', error);
    res.status(500).json({ message: 'Error removing exercise from day' });
  }
});

export default router;