import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Day {
    id: ID!
    week: Int!
    day_of_week: String!
    user_id: ID!
  }

  type Exercise {
    id: ID!
    name: String!
    weight: Float
    notes: String
    user_id: ID!
  }

  type DayExercise {
    id: ID!
    exercise: Exercise!
    dayExerciseId: ID!
    day_id: ID!
    exercise_order: Int!
  }

  input ExerciseOrderInput {
    id: ID!
    order: Int!
  }

  input ExerciseInput {
    name: String!
    weight: Float
    notes: String
  }

  type Query {
    getDays: [Day!]!
    getDayExercises(dayId: ID!): [DayExercise!]!
    searchExercises(query: String!): [Exercise!]!
    getAllExercises: [Exercise!]!
    getExercise(id: ID!): Exercise
  }

  type Mutation {
    addExerciseToDay(dayId: ID!, exerciseId: ID!): DayExercise!
    reorderExercises(dayId: ID!, exercises: [ExerciseOrderInput!]!): [DayExercise!]!
    removeExerciseFromDay(dayId: ID!, exerciseId: ID!): Boolean!
    removeDayExercise(dayExerciseId: ID!): Boolean!
    createExercise(exercise: ExerciseInput!, dayId: ID): Exercise!
    updateExercise(id: ID!, exercise: ExerciseInput!): Exercise!
    deleteExercise(id: ID!): Boolean!
    updateExerciseOrder(id: ID!, dayId: ID!, newOrder: Int!): Boolean!
  }
`;