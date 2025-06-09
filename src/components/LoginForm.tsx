import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import 'boxicons/css/boxicons.min.css';
import { supabase } from '../SupabaseCilent';

const LoginForm = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  //  Redirect if session is already active
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/dashboard');
      }
    });
  }, []);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }

      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
    // Google login auto-handles redirection from Supabase dashboard callback URL
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-lg p-8 w-[350px] transition-all duration-300 ease-in-out shadow"
    >
      {/* Tabs */}
      <div className="flex gap-8 mb-6 w-fit border-b border-gray-300">
        <button
          onClick={() => setIsLogin(true)}
          className={`relative font-semibold text-sm pb-2 transition-colors duration-300 ${
            isLogin ? 'text-black' : 'text-gray-600'
          }`}
        >
          Login
          {isLogin && (
            <motion.span
              layoutId="underline"
              className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-red-500"
            />
          )}
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`relative font-semibold text-sm pb-2 transition-colors duration-300 ${
            !isLogin ? 'text-black' : 'text-gray-600'
          }`}
        >
          Sign Up
          {!isLogin && (
            <motion.span
              layoutId="underline"
              className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-red-500"
            />
          )}
        </button>
      </div>

      {/* Error */}
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      {/* Email */}
      <motion.input
        layout
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded-md border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
      />

      {/* Password */}
      <motion.div layout className="relative mb-4">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <i
          className={`bx ${showPassword ? 'bx-show' : 'bx-hide'} absolute right-3 top-3.5 text-gray-500 text-xl cursor-pointer`}
          onClick={() => setShowPassword(!showPassword)}
        ></i>
        {isLogin && (
          <div className="text-right text-sm text-blue-500 mt-1 cursor-pointer hover:underline transition-all duration-300">
            Forgot Password?
          </div>
        )}
      </motion.div>

      {/* Confirm Password */}
      <AnimatePresence initial={false}>
        {!isLogin && (
          <motion.div
            key="confirm"
            layout
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 overflow-hidden"
          >
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button
        layout
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md mb-4 transition-all duration-300"
      >
        {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
      </motion.button>

      <div className="flex items-center justify-center text-gray-500 mb-4">or</div>

      {/* Google OAuth */}
      <motion.button
        layout
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 border rounded-3xl py-2 hover:bg-gray-100 transition-all duration-300"
      >
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Continue with Google
      </motion.button>
    </motion.div>
  );
};

export default LoginForm;
