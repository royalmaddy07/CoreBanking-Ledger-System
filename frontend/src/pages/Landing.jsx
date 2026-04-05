import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, TrendingUp, Smartphone, ArrowRight, Wallet, 
  Zap, Lock, Globe, CheckCircle2, ArrowUpRight, ArrowDownRight,
  BarChart3, RefreshCcw
} from 'lucide-react';

// Custom hook for scroll animations
const useOnScreen = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  
  return [ref, visible];
};

const Landing = () => {
  const navigate = useNavigate();
  const [heroVisible, setHeroVisible] = useState(false);
  
  const [statsRef, statsVisible] = useOnScreen(0.2);
  const [high1Ref, high1Visible] = useOnScreen(0.2);
  const [high2Ref, high2Visible] = useOnScreen(0.2);
  const [featuresRef, featuresVisible] = useOnScreen(0.1);
  const [ctaRef, ctaVisible] = useOnScreen(0.3);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <Wallet className="w-8 h-8 text-royal-500" />
          <span className="text-xl font-display font-bold tracking-tight text-white">
            Nexus<span className="text-royal-400">Wealth</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#transfers" className="hover:text-royal-400 transition-colors">Transfers</a>
          <a href="#deposits" className="hover:text-royal-400 transition-colors">Fixed Deposits</a>
          <a href="#features" className="hover:text-royal-400 transition-colors">Features</a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-gray-300 hover:text-white hidden sm:inline-block transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="text-sm font-semibold bg-royal-600 hover:bg-royal-500 text-white px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all transform hover:-translate-y-0.5"
          >
            Open Account
          </button>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <main className="relative min-h-[95vh] pt-32 pb-20 flex flex-col justify-center items-center px-6 md:px-12 mx-auto max-w-7xl">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-royal-600/10 rounded-full blur-[150px] pointer-events-none animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-royal-800/20 rounded-full blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>

        <div className="flex flex-col lg:flex-row items-center gap-16 w-full">
          {/* Hero Content */}
          <div className={`flex-1 z-10 transition-all duration-[1200ms] ease-out ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 border-royal-500/30">
              <span className="block w-2 h-2 rounded-full bg-royal-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-royal-300 uppercase tracking-wider text-glow">The Future of Banking is Here</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl lg:leading-[1.1] font-display font-extrabold tracking-tight text-white mb-6">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-400 to-royal-200">
                Wealth Experience.
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
              Experience next-generation private banking with Nexus Wealth. Automate fixed deposits, perform high-speed transfers, and monitor your portfolio with military-grade security.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-white to-gray-200 text-background font-bold px-8 py-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 text-white font-medium px-8 py-4 rounded-full glass-panel hover:bg-white/10 transition-all w-full sm:w-auto border border-white/5"
              >
                Access Dashboard
              </button>
            </div>
          </div>

          {/* Hero Visual DOM Mockup */}
          <div className={`flex-1 relative z-10 w-full max-w-lg transition-all duration-[1200ms] ease-out delay-300 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="relative w-full aspect-[4/5] rounded-[2.5rem] glass-panel p-6 overflow-hidden border border-royal-500/20 shadow-[0_20px_60px_rgba(91,33,182,0.4)] animate-float">
              <div className="absolute inset-0 bg-gradient-to-b from-royal-500/10 to-transparent pointer-events-none"></div>
              
              <div className="relative flex justify-between items-center mb-8">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Balance</p>
                  <div className="text-4xl font-display font-bold text-white mt-1">$124,500<span className="text-royal-400">.00</span></div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-royal-600 to-royal-400 flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="relative space-y-4">
                {/* Fake Chart */}
                <div className="h-32 w-full rounded-2xl bg-[#0D0A14]/50 border border-white/5 flex items-end p-4 gap-2 mb-6">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-royal-500 to-royal-300 rounded-t-sm opacity-80"
                      style={{ height: `${heroVisible ? h : 0}%`, transition: `height 1s ease ${(i * 100) + 500}ms` }}
                    />
                  ))}
                </div>
                
                {/* Mock Transactions */}
                <div className="glass-card p-4 rounded-2xl flex justify-between items-center border-white/5 backdrop-blur-md">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                       <ArrowDownRight className="w-5 h-5 text-green-400" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-white">Wire Transfer</p>
                       <p className="text-xs text-gray-400 font-medium">Deposit Received</p>
                     </div>
                   </div>
                   <span className="font-bold text-green-400">+$2,500.00</span>
                </div>
                
                <div className="glass-card p-4 rounded-2xl flex justify-between items-center border-white/5 backdrop-blur-md">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-royal-500/20 flex items-center justify-center">
                       <ShieldCheck className="w-5 h-5 text-royal-400" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-white">Fixed Deposit</p>
                       <p className="text-xs text-royal-300 font-medium">5.00% APY Active</p>
                     </div>
                   </div>
                   <span className="font-bold text-white tracking-wider">LOCKED</span>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -right-4 top-1/3 glass-panel py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-3 border-green-500/30 animate-[float_5s_ease-in-out_infinite-reverse] z-20">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-[ping_1.5s_ease-in-out_infinite]"></div>
                <span className="text-sm font-bold text-white">Network Secure</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 2. Global Statistics */}
      <section ref={statsRef} className="py-12 border-y border-white/5 bg-surfaceLight/10 relative overflow-hidden">
        <div className={`max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5 transition-all duration-1000 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center">
            <h3 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">99.9<span className="text-royal-500">%</span></h3>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Uptime SLA</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">&lt;10<span className="text-royal-500">ms</span></h3>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Transfer Latency</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">0<span className="text-royal-500"></span></h3>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Security Breaches</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl lg:text-5xl font-display font-bold text-white mb-2">5.0<span className="text-royal-500">%</span></h3>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Deposit APY</p>
          </div>
        </div>
      </section>

      {/* 3. Highlight 1: Lightning Transfers */}
      <section id="transfers" ref={high1Ref} className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16">
          <div className={`flex-1 space-y-6 transition-all duration-1000 ${high1Visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="w-14 h-14 rounded-2xl bg-royal-500/10 flex items-center justify-center border border-royal-500/20">
              <Zap className="w-7 h-7 text-royal-400" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
              Move money at the <br/><span className="text-royal-400">speed of light.</span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
              Say goodbye to multi-day waiting periods. With our proprietary ledger architecture, transfers to saved beneficiaries settle instantly, 24/7/365. Confirm with your password and see funds arrive before you blink.
            </p>
            <ul className="space-y-4 pt-4">
              {['Zero transfer fees', 'Instant settlement times', 'Saved beneficiary routing'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={`flex-1 relative transition-all duration-1000 delay-300 ${high1Visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            {/* Visual Graphic */}
            <div className="relative w-full max-w-md mx-auto aspect-square glass-card rounded-full flex items-center justify-center border-royal-500/20 shadow-[0_0_50px_rgba(124,58,237,0.15)]">
               <div className="absolute inset-4 rounded-full border border-dashed border-white/10 animate-[spin_60s_linear_infinite]"></div>
               <div className="absolute inset-12 rounded-full border border-dashed border-royal-500/30 animate-[spin_40s_linear_infinite_reverse]"></div>
               <div className="glass-panel p-8 rounded-3xl z-10 text-center shadow-2xl border-white/10 relative">
                 <div className="w-16 h-16 rounded-full bg-green-500/10 mx-auto flex items-center justify-center mb-4">
                   <ArrowUpRight className="w-8 h-8 text-green-400" />
                 </div>
                 <h4 className="text-2xl font-bold text-white mb-2">$5,000.00</h4>
                 <p className="text-sm text-gray-400 font-medium">Transfer Sent Successfully</p>
                 <div className="mt-4 px-4 py-2 bg-background/50 rounded-xl flex items-center justify-center gap-2 border border-white/5">
                   <Lock className="w-3 h-3 text-royal-400" />
                   <span className="text-xs text-gray-300">256-bit Encrypted</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Highlight 2: Fixed Deposits */}
      <section id="deposits" ref={high2Ref} className="py-32 bg-surfaceLight/20 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row-reverse items-center gap-16">
          <div className={`flex-1 space-y-6 transition-all duration-1000 ${high2Visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="w-14 h-14 rounded-2xl bg-gold-400/10 flex items-center justify-center border border-gold-400/20">
              <TrendingUp className="w-7 h-7 text-gold-400" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
              Grow your wealth <br/><span className="text-gold-400">automatically.</span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
              Don't let your assets sit idle. Lock your funds into secure Fixed Deposits and earn an industry-leading 5.00% APY. Track maturity progress directly from your dashboard and withdraw any time if plans change.
            </p>
            <button onClick={() => navigate('/register')} className="mt-4 font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-2 transition-colors">
              Explore Deposit Rates <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className={`flex-1 relative transition-all duration-1000 delay-300 ${high2Visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            {/* Visual Graphic */}
            <div className="w-full max-w-md mx-auto glass-panel p-8 rounded-[2rem] border-gold-400/20 shadow-[0_0_50px_rgba(251,191,36,0.1)] relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-gold-400/10 rounded-full blur-[60px]"></div>
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <p className="text-sm text-gray-400">Maturity Projection</p>
                  <p className="text-2xl font-bold text-white mt-1">$50,000 → <span className="text-gold-400">$51,250</span></p>
                </div>
                <div className="px-3 py-1.5 bg-gold-400/10 text-gold-400 text-xs font-bold rounded-lg border border-gold-400/20">
                  5.00% APY
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-xs text-gray-400 font-medium">
                  <span>Day 1</span>
                  <span>6 Months</span>
                </div>
                <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-gold-400/50 to-gold-400 w-3/4 rounded-full relative">
                    <div className="absolute right-0 top-0 bottom-0 w-10 bg-white/30 blur-sm animate-shimmer"></div>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-4">75% until maturity (45 days remaining)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Grid Map */}
      <section id="features" ref={featuresRef} className="py-32 relative">
        <div className="text-center max-w-2xl mx-auto px-6 mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">Engineered for Excellence</h2>
          <p className="text-gray-400">We've built a robust architecture from the ground up to ensure your banking experience is flawless, secure, and insightful.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: 'Military-Grade Security', desc: 'Protected with state-of-the-art encryption, password confirmations for irreversible actions, and continuous auditing.', delay: 0 },
            { icon: BarChart3, title: 'Deep Analytics', desc: 'Search, filter, and analyze your transaction history. Understand your credit/debit volume at a glance.', delay: 150 },
            { icon: RefreshCcw, title: 'Multi-Account Sync', desc: 'Create up to 5 discrete accounts mapping to one profile. Move money fluidly between your own portfolios.', delay: 300 },
          ].map(({ icon: Icon, title, desc, delay }) => (
            <div 
              key={title}
              className={`glass-panel p-8 rounded-3xl group hover:-translate-y-2 transition-all duration-500 ease-out border-white/5 hover:border-royal-500/30 hover:shadow-[0_10px_40px_rgba(139,92,246,0.1)] ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${delay}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-royal-500/10 flex items-center justify-center mb-6 group-hover:bg-royal-500/20 transition-all duration-500">
                <Icon className="w-6 h-6 text-royal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Huge CTA Banner */}
      <section ref={ctaRef} className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className={`relative w-full rounded-[3rem] overflow-hidden transition-all duration-1000 ${ctaVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-royal-600 to-royal-900 border border-royal-400/20"></div>
          
          {/* Abstract CTA Background shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/20 rounded-full blur-[80px]"></div>

          <div className="relative z-10 px-8 py-20 md:py-32 text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-6 tracking-tight">
              Ready to claim your wealth?
            </h2>
            <p className="text-royal-100 text-lg max-w-xl mx-auto mb-10 leading-relaxed opacity-90">
              Join thousands of high-net-worth individuals who trust Nexus for their advanced banking and asset management needs.
            </p>
            <button 
              onClick={() => navigate('/register')}
              className="group bg-white text-royal-900 font-bold px-10 py-5 rounded-full text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all flex items-center gap-3"
            >
              Open Your Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4 md:mb-0 opacity-70">
          <Wallet className="w-5 h-5 text-gray-400" />
          <span className="text-lg font-display font-bold text-gray-400">
            Nexus<span className="text-gray-500">Wealth</span>
          </span>
        </div>
        <div className="flex gap-6 text-sm text-gray-500 font-medium">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <p className="text-gray-600 text-xs mt-6 md:mt-0 font-mono">
          © {new Date().getFullYear()} Nexus Wealth Systems. All rights reserved.
        </p>
      </footer>

    </div>
  );
};

export default Landing;
