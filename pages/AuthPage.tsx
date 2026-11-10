
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth, createUserProfile, updateUserProfile, getUserProfile } from '../services/firebaseService';
import { useAppContext } from '../hooks/useAppContext';

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { appSettings, setUser } = useAppContext();
    const logoText = appSettings?.logoText || 'FilmySky';

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            if (mode === 'login') {
                if (!email || !password) throw new Error("Email and password are required.");
                await auth.signInWithEmailAndPassword(email, password);
                navigate('/profile');
            } else if (mode === 'signup') {
                if (!name || !email || !password) throw new Error("Name, email, and password are required.");
                if (password.length < 6) throw new Error("Password must be at least 6 characters long.");
                
                const currentUser = auth.currentUser;
                if (currentUser && currentUser.isAnonymous) {
                    // Upgrade anonymous user to a permanent account
                    const uid = currentUser.uid;
                    const credential = firebase.auth.EmailAuthProvider.credential(email, password);
                    await currentUser.linkWithCredential(credential);
                    await updateUserProfile(uid, name, email);
                    
                    // Explicitly set user state to override any stale data from the auth listener
                    const finalProfile = await getUserProfile(uid);
                    if (finalProfile) {
                        setUser({
                            ...finalProfile,
                            id: uid,
                            isAnonymous: false,
                            email: email
                        });
                    }

                } else {
                    // Regular new user signup
                    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                    if (userCredential.user) {
                        const newUserProfile = await createUserProfile(userCredential.user.uid, name, email);
                        // Explicitly set user state
                        setUser({
                            ...newUserProfile,
                            id: userCredential.user.uid,
                            isAnonymous: false,
                            email: email
                        });
                    }
                }
                navigate('/profile');
            } else if (mode === 'reset') {
                if (!email) throw new Error("Email is required to reset password.");
                await auth.sendPasswordResetEmail(email);
                setMessage('Password reset email sent! Please check your inbox.');
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            
            if (result.user) {
                const { uid, displayName, email } = result.user;
                // Check if user profile exists in RTDB
                let userProfile = await getUserProfile(uid);
                
                if (!userProfile) {
                    // Create new profile if it doesn't exist
                    const newName = displayName || email?.split('@')[0] || 'User';
                    userProfile = await createUserProfile(uid, newName, email || '');
                }

                // Update context
                setUser({
                    ...userProfile,
                    id: uid,
                    isAnonymous: false,
                    email: email || userProfile?.email
                });
                
                navigate('/profile');
            }
        } catch (err: any) {
            console.error("Google Login Error:", err);
            setError(err.message || 'Failed to sign in with Google.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 relative bg-gradient-to-br from-black via-[#1a1a2e] to-[#0f3460] overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary-color)]/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-20 text-white/70 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10">
                <i className="fas fa-arrow-left"></i> Go Back
            </button>

             <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white flex items-center justify-center drop-shadow-md">
                        <i className="fas fa-play-circle text-[var(--primary-color)] mr-3 text-4xl"></i>
                        {logoText}
                    </h1>
                    <p className="text-gray-300 mt-3 text-sm font-medium">
                        {mode === 'login' && 'Welcome back! Sign in to continue.'}
                        {mode === 'signup' && 'Create an account to get started.'}
                        {mode === 'reset' && 'Enter your email to reset your password.'}
                    </p>
                </div>
                
                <form onSubmit={handleAuthAction} className="space-y-5">
                    {mode === 'signup' && (
                        <div className="relative group">
                            <i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors"></i>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                                required
                            />
                        </div>
                    )}
                    {mode !== 'reset' ? (
                        <>
                            <div className="relative group">
                                <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors"></i>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors"></i>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                         <div className="relative group">
                            <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors"></i>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                                required
                            />
                        </div>
                    )}

                    {error && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}
                    {message && <p className="text-green-400 text-sm text-center bg-green-500/10 py-2 rounded-lg border border-green-500/20">{message}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-[var(--primary-color)] to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-[var(--primary-color)]/30 hover:shadow-[var(--primary-color)]/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isLoading ? <i className="fas fa-spinner fa-spin"></i> : (
                            mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
                        )}
                    </button>

                    {mode !== 'reset' && (
                        <>
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or continue with</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full py-3.5 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                            >
                                <i className="fab fa-google text-lg"></i>
                                <span>Google</span>
                            </button>
                        </>
                    )}
                </form>

                <div className="text-center mt-6 text-sm">
                    {mode === 'login' && (
                        <div className="space-y-3">
                            <button onClick={() => setMode('reset')} className="text-gray-400 hover:text-white transition-colors">Forgot Password?</button>
                            <div className="border-t border-white/10 pt-4">
                                <p className="text-gray-400">
                                    Don't have an account? <button onClick={() => setMode('signup')} className="font-bold text-[var(--primary-color)] hover:text-white transition-colors ml-1">Sign Up</button>
                                </p>
                            </div>
                        </div>
                    )}
                    {(mode === 'signup' || mode === 'reset') && (
                        <div className="border-t border-white/10 pt-4 mt-2">
                            <p className="text-gray-400">
                                Already have an account? <button onClick={() => setMode('login')} className="font-bold text-[var(--primary-color)] hover:text-white transition-colors ml-1">Login</button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
