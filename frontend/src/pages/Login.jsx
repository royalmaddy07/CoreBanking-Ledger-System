import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Loader2, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await login(formData.username, formData.password);
    setIsLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(typeof res.error === 'object' ? JSON.stringify(res.error) : res.error || 'Failed to login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-royal-600/20 rounded-full blur-[100px] animate-glow-pulse"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] bg-royal-800/25 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-[800ms] ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Home</span>
        </button>

        {/* Auth Card */}
        <div className="glass-card p-10 rounded-3xl shadow-2xl border-white/5">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-royal-600 to-royal-400 flex items-center justify-center p-1 shadow-lg shadow-royal-500/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-white">
              Nexus<span className="text-royal-400">Wealth</span>
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-white text-center mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-center text-sm mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center animate-fade-in-up">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                className="form-input"
                placeholder="name@example.com"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <a href="#" className="text-xs text-royal-400 hover:text-royal-300">Forgot password?</a>
              </div>
              <input 
                type="password" 
                required
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-6 btn-primary"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="text-royal-400 font-medium hover:text-royal-300">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
