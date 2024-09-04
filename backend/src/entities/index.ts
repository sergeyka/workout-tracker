import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Unique, JoinColumn} from 'typeorm';

@Entity('days')
export class Day {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'day_of_week', type: 'varchar', length: 3 })
    day_of_week!: string;

    @Column({ type: 'int' })
    week!: number;

    @OneToMany(() => DaysExercises, daysExercises => daysExercises.day)
    daysExercises!: DaysExercises[];
}

@Entity('exercises')
export class Exercise {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    name!: string;

    @Column({ name: 'weight', type: 'numeric', precision: 5, scale: 2, nullable: true })
    weight?: number;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @OneToMany(() => DaysExercises, daysExercises => daysExercises.exercise)
    daysExercises!: DaysExercises[];
}

@Entity('days_exercises')
@Unique(['day_id', 'exercise_order'])
@Unique(['day_id', 'exercise_id'])
export class DaysExercises {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'day_id' })
    day_id!: number;

    @Column({ name: 'exercise_id' })
    exercise_id!: number;

    @Column({ name: 'exercise_order' })
    exercise_order!: number;

    @ManyToOne(() => Day, day => day.daysExercises)
    @JoinColumn({ name: 'day_id' })
    day!: Day;

    @ManyToOne(() => Exercise, exercise => exercise.daysExercises)
    @JoinColumn({ name: 'exercise_id' })
    exercise!: Exercise;
}