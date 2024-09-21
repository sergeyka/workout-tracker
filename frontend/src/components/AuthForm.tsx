import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import './AuthForm.css';

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthChange(event, session);
    });

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      return;
    }
    handleAuthChange(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
  };

  const handleAuthChange = (event: string, session: Session | null) => {
    setUser(session?.user || null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setVerificationSent(true);
      setError(null);
      setEmail('');
      setPassword('');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    handleAuthResponse(data.user, error);
  };

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
    }
  };

  const handleAuthResponse = (user: User | null, error: Error | null) => {
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setEmail('');
      setPassword('');
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
  };

  return (
    <div>
      {user ? (
        <div className="auth-logged-in">
          <span>{user.email?.split('@')[0]}</span>
          <button className="auth-button" onClick={handleSignOut}>Log Out</button>
        </div>
      ) : (
        <div className="auth-container">
          <h2 className="auth-header">{isRegistering ? 'Register' : 'Sign In'}</h2>
          {verificationSent ? (
            <p className="verification-message">Please check your email and click the verification link to complete your registration.</p>
          ) : (
            <form onSubmit={isRegistering ? handleSignUp : handleSignIn} className="auth-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
              <button type="submit" className="auth-button">{isRegistering ? 'Register' : 'Sign In'}</button>
            </form>
          )}
          <button onClick={handleGoogleSignIn} className="auth-button google-button">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" />
            Sign in with Google
          </button>
          <button onClick={toggleAuthMode} className="auth-toggle-button">
            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>
        </div>
      )}
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
};

export default AuthForm;