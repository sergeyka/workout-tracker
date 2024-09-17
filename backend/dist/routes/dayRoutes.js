"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const entities_1 = require("../entities");
const router = (0, express_1.Router)();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dayRepository = data_source_1.AppDataSource.getRepository(entities_1.Day);
    const days = yield dayRepository.find({ order: { week: 'ASC', day_of_week: 'ASC' } });
    res.json(days);
}));
router.get('/:id/exercises', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const daysExercisesRepository = data_source_1.AppDataSource.getRepository(entities_1.DaysExercises);
    const exercises = yield daysExercisesRepository.find({
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
}));
router.post('/:id/exercises', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const day_id = parseInt(req.params.id);
    const { exercise_id } = req.body;
    const dayRepository = data_source_1.AppDataSource.getRepository(entities_1.Day);
    const exerciseRepository = data_source_1.AppDataSource.getRepository(entities_1.Exercise);
    const daysExercisesRepository = data_source_1.AppDataSource.getRepository(entities_1.DaysExercises);
    try {
        const day = yield dayRepository.findOne({ where: { id: day_id } });
        const exercise = yield exerciseRepository.findOne({ where: { id: exercise_id } });
        if (!day || !exercise) {
            return res.status(404).json({ message: 'Day or Exercise not found' });
        }
        const maxOrderResult = yield daysExercisesRepository.findOne({
            where: { day_id },
            order: { exercise_order: 'DESC' },
        });
        const newOrder = maxOrderResult ? maxOrderResult.exercise_order + 1 : 1;
        const newDaysExercises = daysExercisesRepository.create({
            day_id,
            exercise_id,
            exercise_order: newOrder,
        });
        yield daysExercisesRepository.save(newDaysExercises);
        res.status(201).json({ message: 'Exercise added to day successfully', order: newOrder });
    }
    catch (error) {
        console.error('Error adding exercise to day:', error);
        res.status(500).json({ message: 'Error adding exercise to day' });
    }
}));
router.put('/:id/exercises/reorder', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dayId = parseInt(req.params.id);
    const reorderedExercises = req.body;
    const daysExercisesRepository = data_source_1.AppDataSource.getRepository(entities_1.DaysExercises);
    try {
        yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            // Step 1: Assign temporary order values
            for (let i = 0; i < reorderedExercises.length; i++) {
                yield transactionalEntityManager.update(entities_1.DaysExercises, { day_id: dayId, exercise_id: reorderedExercises[i].id }, { exercise_order: -1 * (i + 1) } // Temporary negative values
                );
            }
            // Step 2: Assign final order values
            for (let i = 0; i < reorderedExercises.length; i++) {
                yield transactionalEntityManager.update(entities_1.DaysExercises, { day_id: dayId, exercise_id: reorderedExercises[i].id }, { exercise_order: i + 1 });
            }
        }));
        res.json({ message: 'Exercises reordered successfully' });
    }
    catch (error) {
        console.error('Error reordering exercises:', error);
        res.status(500).json({ message: 'Error reordering exercises' });
    }
}));
router.delete('/:dayId/exercises/:exerciseId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const day_id = parseInt(req.params.dayId);
    const exercise_id = parseInt(req.params.exerciseId);
    const daysExercisesRepository = data_source_1.AppDataSource.getRepository(entities_1.DaysExercises);
    try {
        const result = yield daysExercisesRepository.delete({
            day_id,
            exercise_id,
        });
        if (result.affected === 0) {
            return res.status(404).json({ message: 'Exercise not found for this day' });
        }
        res.json({ message: 'Exercise removed from day successfully' });
    }
    catch (error) {
        console.error('Error removing exercise from day:', error);
        res.status(500).json({ message: 'Error removing exercise from day' });
    }
}));
exports.default = router;
