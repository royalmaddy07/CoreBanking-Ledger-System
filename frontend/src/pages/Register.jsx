import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Loader2, ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', cpassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side password match check
    if (formData.password !== formData.cpassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await register(formData);
    setIsLoading(false);

    if (res.success) {
      setSuccess('Registration complete! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(typeof res.error === 'object' ? JSON.stringify(res.error) : res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-royal-600/20 rounded-full blur-[100px] animate-glow-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-royal-800/25 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`w-full max-w-lg relative z-10 my-8 transition-all duration-[800ms] ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
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
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-royal-600 to-royal-400 flex items-center justify-center p-1 shadow-lg shadow-royal-500/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-white">
              Nexus<span className="text-royal-400">Wealth</span>
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-white text-center mb-2">Create an Account</h2>
          <p className="text-gray-400 text-center text-sm mb-8">Join the next generation of banking.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center animate-fade-in-up">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium text-center animate-fade-in-up">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  pattern="[0-9]{10}"
                  title="10-digit phone number"
                  className="form-input"
                  placeholder="1234567890"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.cpassword}
                  onChange={e => setFormData({...formData, cpassword: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !!success}
              className="w-full mt-6 btn-primary"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Creating Account...' : 'Open Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-royal-400 font-medium hover:text-royal-300">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
