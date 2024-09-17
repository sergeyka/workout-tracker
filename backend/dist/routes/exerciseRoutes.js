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
const typeorm_1 = require("typeorm");
const setQueryLogging_1 = require("../setQueryLogging");
const router = (0, express_1.Router)();
// GET search exercises
router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    const exerciseRepository = data_source_1.AppDataSource.getRepository(entities_1.Exercise);
    if (typeof query !== 'string' || query.trim() === '') {
        return res.json([]);
    }
    try {
        (0, setQueryLogging_1.setQueryLogging)(data_source_1.AppDataSource, true);
        const exercises = yield exerciseRepository.find({
            where: { name: (0, typeorm_1.ILike)(`%${query}%`) }
        });
        (0, setQueryLogging_1.setQueryLogging)(data_source_1.AppDataSource, false);
        console.log(exercises);
        res.json(exercises);
    }
    catch (error) {
        console.error('Error searching exercises:', error);
        res.status(500).json({ message: 'Error searching exercises' });
    }
}));
// GET all exercises
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exerciseRepository = data_source_1.AppDataSource.getRepository(entities_1.Exercise);
    const exercises = yield exerciseRepository.find({
        order: {
            id: 'ASC'
        }
    });
    res.json(exercises);
}));
// GET single exercise
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exerciseRepository = data_source_1.AppDataSource.getRepository(entities_1.Exercise);
    const exercise = yield exerciseRepository.findOne({ where: { id: parseInt(req.params.id) } });
    if (!exercise) {
        return res.status(404).json({ message: 'Exercise not found' });
    }
    res.json(exercise);
}));
// POST new exercise
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exerciseRepository = data_source_1.AppDataSource.getRepository(entities_1.Exercise);
    const daysExercisesRepository = data_source_1.AppDataSource.getRepository(entities_1.DaysExercises);
    try {
        const { name, dayId } = req.body;
        // Create new exercise
        const newExercise = exerciseRepository.create({ name });
        const savedExercise = yield exerciseRepository.save(newExercise);
        if (dayId) {
            // Get the max order for the current day
            const maxOrder = yield daysExercisesRepository.createQueryBuilder('de')
                .where('de.day_id = :dayId', { dayId })
                .select('MAX(de.exercise_order)', 'maxOrder')
                .getRawOne();
            const newOrder = ((maxOrder === null || maxOrder === void 0 ? void 0 : maxOrder.maxOrder) || 0) + 1;
            // Create new DaysExercises entry
            const newDaysExercises = daysExercisesRepository.create({
                day_id: dayId,
                exercise_id: savedExercise.id,
                exercise_order: newOrder
            });
            yield daysExercisesRepository.save(newDaysExercises);
        }
        res.status(201).json(savedExercise);
    }
    catch (error) {
        console.error('Error adding new exercise:', error);
        res.status(500).json({ message: 'Error adding new exercise' });
    }
}));
// PUT update exercise
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exerciseRepository = data_source_1.AppDataSource.getRepository(entities_1.Exercise);
    const exercise = yield exerciseRepository.findOne({ where: { id: parseInt(req.params.id) } });
    if (!exercise) {
        return res.status(404).json({ message: 'Exercise not found' });
    }
    try {
        exerciseRepository.merge(exercise, req.body);
        const result = yield exerciseRepository.save(exercise);
        res.json(result);
    }
    catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ message: 'Error updating exercise' });
    }
}));
// DELETE exercise from a day
router.delete('/:id/day/:dayId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const daysExercisesRepository = data_source_1.AppDataSource.getRepository(entities_1.DaysExercises);
    const result = yield daysExercisesRepository.delete({
        day_id: parseInt(req.params.dayId),
        exercise_id: parseInt(req.params.id)
    });
    if (result.affected === 0) {
        return res.status(404).json({ message: 'Exercise not found for this day' });
    }
    res.json({ message: 'Exercise removed from day successfully' });
}));
// DELETE exercise
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exerciseRepository = data_source_1.AppDataSource.getRepository(entities_1.Exercise);
    const daysExercisesRepository = data_source_1.AppDataSource.getRepository(entities_1.DaysExercises);
    try {
        const exerciseId = parseInt(req.params.id);
        // First, delete all associated entries in DaysExercises
        yield daysExercisesRepository.delete({ exercise_id: exerciseId });
        // Then, delete the exercise
        const result = yield exerciseRepository.delete(exerciseId);
        if (result.affected === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }
        res.json({ message: 'Exercise deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ message: 'Error deleting exercise' });
    }
}));
// PUT update exercise order
router.put('/:id/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { day_id, newOrder } = req.body;
    const exercise_id = parseInt(req.params.id);
    const daysExercisesRepository = data_source_1.AppDataSource.getRepository(entities_1.DaysExercises);
    try {
        const daysExercise = yield daysExercisesRepository.findOne({
            where: {
                day_id,
                exercise_id
            }
        });
        if (!daysExercise) {
            return res.status(404).json({ message: 'Exercise not found for this day' });
        }
        daysExercise.exercise_order = newOrder;
        yield daysExercisesRepository.save(daysExercise);
        res.json({ message: 'Exercise order updated successfully' });
    }
    catch (error) {
        console.error('Error updating exercise order:', error);
        res.status(500).json({ message: 'Error updating exercise order' });
    }
}));
exports.default = router;
