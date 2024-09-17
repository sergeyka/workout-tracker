"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaysExercises = exports.Exercise = exports.Day = void 0;
const typeorm_1 = require("typeorm");
let Day = class Day {
};
exports.Day = Day;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Day.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'day_of_week', type: 'varchar', length: 3 }),
    __metadata("design:type", String)
], Day.prototype, "day_of_week", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Day.prototype, "week", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DaysExercises, daysExercises => daysExercises.day),
    __metadata("design:type", Array)
], Day.prototype, "daysExercises", void 0);
exports.Day = Day = __decorate([
    (0, typeorm_1.Entity)('days')
], Day);
let Exercise = class Exercise {
};
exports.Exercise = Exercise;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Exercise.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], Exercise.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weight', type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Exercise.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Exercise.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DaysExercises, daysExercises => daysExercises.exercise),
    __metadata("design:type", Array)
], Exercise.prototype, "daysExercises", void 0);
exports.Exercise = Exercise = __decorate([
    (0, typeorm_1.Entity)('exercises')
], Exercise);
let DaysExercises = class DaysExercises {
};
exports.DaysExercises = DaysExercises;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DaysExercises.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'day_id' }),
    __metadata("design:type", Number)
], DaysExercises.prototype, "day_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exercise_id' }),
    __metadata("design:type", Number)
], DaysExercises.prototype, "exercise_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exercise_order' }),
    __metadata("design:type", Number)
], DaysExercises.prototype, "exercise_order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Day, day => day.daysExercises),
    (0, typeorm_1.JoinColumn)({ name: 'day_id' }),
    __metadata("design:type", Day)
], DaysExercises.prototype, "day", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exercise, exercise => exercise.daysExercises),
    (0, typeorm_1.JoinColumn)({ name: 'exercise_id' }),
    __metadata("design:type", Exercise)
], DaysExercises.prototype, "exercise", void 0);
exports.DaysExercises = DaysExercises = __decorate([
    (0, typeorm_1.Entity)('days_exercises'),
    (0, typeorm_1.Unique)(['day_id', 'exercise_order']),
    (0, typeorm_1.Unique)(['day_id', 'exercise_id'])
], DaysExercises);
