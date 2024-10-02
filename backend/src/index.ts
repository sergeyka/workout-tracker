import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import routes from './routes';
import { authenticateUser, authenticateUserGraphQL, authenticateUserStub } from './middleware/auth';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { Request } from 'express';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// Use cookie-parser before other middleware
app.use(cookieParser());

app.use(cors());
app.use(express.json());

// Apply the authentication middleware to all /api routes
app.use('/api', authenticateUser, routes);  

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const PORT = process.env.PORT || 5000;

AppDataSource.initialize().then(async () => {
    // Start Apollo Server
    await server.start();

    // Apply Apollo Server middleware
    app.use('/graphql', authenticateUserStub, expressMiddleware(server, {
        context: async ({ req }) => ({ user: req.authenticatedUser }),
    }));

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`GraphQL endpoint available at http://localhost:${PORT}/graphql`);
    });
}).catch(error => console.log("TypeORM connection error: ", error)); 

declare global { 
  namespace Express {
    interface Request {
      authenticatedUser?: any;
    }
  }
}
