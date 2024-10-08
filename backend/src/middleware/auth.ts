import { Request, Response, NextFunction } from 'express';
import { createClient, User } from '@supabase/supabase-js';


const supabaseUrl = 'https://hjhaczmkxtkfwfbkwvts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaGFjem1reHRrZndmYmt3dnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MTA4NjcsImV4cCI6MjA0MjA4Njg2N30.8OMn8dGEgU60J_wKgZS30esuqjDhEx0vCIvtmXL7WoY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AuthenticatedRequest extends Request {
  authenticatedUser?: User;
}

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach the user to the request object
    req.authenticatedUser = user;
    console.log('authenticatedUser', user.email);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
