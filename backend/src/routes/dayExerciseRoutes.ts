import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { DaysExercises } from '../entities';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.delete('/:dayExerciseId', async (req: AuthenticatedRequest, res) => {
  const dayExerciseId = parseInt(req.params.dayExerciseId);
  const user_id = req.authenticatedUser?.id;

  const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);

  try {
    const dayExercise = await daysExercisesRepository.findOne({
      where: { id: dayExerciseId, user_id },
      relations: ['day']
    });

    if (!dayExercise) {
      return res.status(404).json({ message: 'Day exercise not found' });
    }

    const dayId = dayExercise.day.id;

    await daysExercisesRepository.remove(dayExercise);

    // Reorder remaining exercises
    const remainingExercises = await daysExercisesRepository.find({
      where: { day_id: dayId, user_id },
      order: { exercise_order: 'ASC' }
    });

    for (let i = 0; i < remainingExercises.length; i++) {
      remainingExercises[i].exercise_order = i + 1;
      await daysExercisesRepository.save(remainingExercises[i]);
    }

    res.json({ message: 'Exercise removed from day successfully' });
  } catch (error) {
    console.error('Error removing exercise from day:', error);
    res.status(500).json({ message: 'Error removing exercise from day' });
  }
});

export default router;