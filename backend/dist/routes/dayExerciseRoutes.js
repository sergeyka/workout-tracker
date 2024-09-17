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
router.delete('/:dayExerciseId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dayExerciseId = parseInt(req.params.dayExerciseId);
    const daysExercisesRepository = data_source_1.AppDataSource.getRepository(entities_1.DaysExercises);
    try {
        const dayExercise = yield daysExercisesRepository.findOne({
            where: { id: dayExerciseId },
            relations: ['day']
        });
        if (!dayExercise) {
            return res.status(404).json({ message: 'Day exercise not found' });
        }
        const dayId = dayExercise.day.id;
        yield daysExercisesRepository.remove(dayExercise);
        // Reorder remaining exercises
        const remainingExercises = yield daysExercisesRepository.find({
            where: { day_id: dayId },
            order: { exercise_order: 'ASC' }
        });
        for (let i = 0; i < remainingExercises.length; i++) {
            remainingExercises[i].exercise_order = i + 1;
            yield daysExercisesRepository.save(remainingExercises[i]);
        }
        res.json({ message: 'Exercise removed from day successfully' });
    }
    catch (error) {
        console.error('Error removing exercise from day:', error);
        res.status(500).json({ message: 'Error removing exercise from day' });
    }
}));
exports.default = router;
