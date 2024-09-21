import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Unique, JoinColumn, Index} from 'typeorm';

@Entity('days')
@Index(['user_id', 'week', 'day_of_week'], { unique: true })
export class Day {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'day_of_week', type: 'varchar', length: 3 })
    day_of_week!: string;

    @Column({ type: 'int' })
    week!: number;

    @Column({ name: 'user_id', type: 'uuid', default: '00000000-0000-0000-0000-000000000000' })
    user_id!: string;

    @OneToMany(() => DaysExercises, daysExercises => daysExercises.day)
    daysExercises!: DaysExercises[];
}

@Entity('exercises')
@Index(['user_id', 'name'], { unique: true })
export class Exercise {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ name: 'weight', type: 'numeric', precision: 5, scale: 2, nullable: true })
    weight?: number;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'user_id', type: 'uuid', default: '00000000-0000-0000-0000-000000000000' })
    user_id!: string;

    @OneToMany(() => DaysExercises, daysExercises => daysExercises.exercise)
    daysExercises!: DaysExercises[];
}

@Entity('days_exercises')
@Unique(['user_id', 'day_id', 'exercise_order'])
@Unique(['user_id', 'day_id', 'exercise_id'])

export class DaysExercises {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'day_id' })
    day_id!: number;

    @Column({ name: 'exercise_id' })
    exercise_id!: number;

    @Column({ name: 'exercise_order' })
    exercise_order!: number;

    @Column({ name: 'user_id', type: 'uuid', default: '00000000-0000-0000-0000-000000000000' })
    user_id!: string;

    @ManyToOne(() => Day, day => day.daysExercises)
    @JoinColumn({ name: 'day_id' })
    day!: Day;

    @ManyToOne(() => Exercise, exercise => exercise.daysExercises)
    @JoinColumn({ name: 'exercise_id' })
    exercise!: Exercise;
}