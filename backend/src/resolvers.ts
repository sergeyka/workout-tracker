import { AppDataSource } from './data-source';
import { Day, Exercise, DaysExercises } from './entities';
import { ILike } from 'typeorm';
import { GraphQLResolveInfo } from 'graphql';

// Define a type for the context
type Context = {
  user: {
    id: string | number;
  };
};

export const resolvers = {
  Query: {
    getDays: async (_: any, __: any, { user }: Context, ___: GraphQLResolveInfo) => {
      const dayRepository = AppDataSource.getRepository(Day);
      return await dayRepository.find({
        where: { user_id: user.id.toString() },
        order: { week: 'ASC', day_of_week: 'ASC' }
      });
    },
    getDayExercises: async (_: any, { dayId }: { dayId: string }, { user }: Context, ___: GraphQLResolveInfo) => {
      const daysExercisesRepository = AppDataSource.getRepository(DaysExercises);
      const exercises = await daysExercisesRepository.find({
        where: { 
          user_id: user.id.toString(),
          day_id: parseInt(dayId),
        },
        relations: ['exercise'],
        order: { exercise_order: 'ASC' },
      });
      return exercises.map(de => ({
        id: de.id,
        exercise: de.exercise,
        dayExerciseId: de.id,
        day_id: de.day_id,
        exercise_order: de.exercise_order
      }));
    },
    searchExercises: async (_: any, { query }: { query: string }, { user }: Context, ___: GraphQLResolveInfo) => {
      const exerciseRepository = AppDataSource.getRepository(Exercise);
      return await exerciseRepository.find({
        where: { name: ILike(`%${query}%`), user_id: user.id.toString() }
      });
    },
    getAllExercises: async (_: any, __: any, { user }: Context, ___: GraphQLResolveInfo) => {
      const exerciseRepository = AppDataSource.getRepository(Exercise);
      return await exerciseRepository.find({
        where: { user_id: user.id.toString() },
        order: { id: 'ASC' }
      });
    },
    getExercise: async (_: any, { id }: { id: string }, { user }: Context, ___: GraphQLResolveInfo) => {
      const exerciseRepository = AppDataSource.getRepository(Exercise);
      return await exerciseRepository.findOne({ 
        where: { id: parseInt(id), user_id: user.id.toString() } 
      });
    },
  },
  Mutation: {
    addExerciseToDay: async (_: any, { dayId, exerciseId }: { dayId: string, exerciseId: string }, { user }: Context, ___: GraphQLResolveInfo) => {
      // ... implementation ...
    },
    reorderExercises: async (_: any, { dayId, exercises }: { dayId: string, exercises: { id: string, order: number }[] }, { user }: Context, ___: GraphQLResolveInfo) => {
      // ... implementation ...
    },
    removeExerciseFromDay: async (_: any, { dayId, exerciseId }: { dayId: string, exerciseId: string }, { user }: Context, ___: GraphQLResolveInfo) => {
      // ... implementation ...
    },
    removeDayExercise: async (_: any, { dayExerciseId }: { dayExerciseId: string }, { user }: Context, ___: GraphQLResolveInfo) => {
      // ... implementation ...
    },
    createExercise: async (_: any, { exercise, dayId }: { exercise: { name: string, weight?: number, notes?: string }, dayId?: string }, { user }: Context, ___: GraphQLResolveInfo) => {
      // ... implementation ...
    },
    updateExercise: async (_: any, { id, exercise }: { id: string, exercise: { name?: string, weight?: number, notes?: string } }, { user }: Context, ___: GraphQLResolveInfo) => {
      // ... implementation ...
    },
    deleteExercise: async (_: any, { id }: { id: string }, { user }: Context, ___: GraphQLResolveInfo) => {
      // ... implementation ...
    },
    updateExerciseOrder: async (_: any, { id, dayId, newOrder }: { id: string, dayId: string, newOrder: number }, { user }: Context, ___: GraphQLResolveInfo) => {
      // ... implementation ...
    },
  },
};