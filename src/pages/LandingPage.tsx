import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { ArrowRight, Zap, ShieldCheck, Share2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isConnected, openWalletModal } = useWallet();

  const features = [
    {
      icon: <ShieldCheck className="text-brand-purple" size={24} />,
      title: "Non-Custodial Payments",
      desc: "Payments flow directly from customer to your wallet. We never touch, hold, or escrow your funds."
    },
    {
      icon: <Zap className="text-brand-cyan" size={24} />,
      title: "Soroban Powered",
      desc: "Payment forms and tracking are managed on-chain using Soroban smart contracts on the Stellar network."
    },
    {
      icon: <Share2 className="text-brand-neon" size={24} />,
      title: "Simple Shareable Links",
      desc: "Create a custom form in seconds, copy the unique share link, and receive payments from anywhere in the world."
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col relative overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-brand-purple/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-brand-cyan/10 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-6 flex flex-col justify-center py-20 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap size={12} /> Powered by Stellar & Soroban
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Collect Payments Directly on <span className="text-gradient-purple-cyan">Stellar</span>
          </h1>
          
          <p className="text-lg text-brand-textMuted leading-relaxed mb-10 max-w-2xl mx-auto">
            Create payment forms, share a link, and get paid instantly in XLM. No registration fees, no middleman, completely peer-to-peer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isConnected ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold py-3 px-8 rounded-xl transition-all btn-glow-purple"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </Link>
            ) : (
              <button
                onClick={openWalletModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold py-3 px-8 rounded-xl transition-all btn-glow-cyan"
              >
                Get Started Now
                <ArrowRight size={16} />
              </button>
            )}
            
            <a
              href="#learn-more"
              className="w-full sm:w-auto flex items-center justify-center bg-brand-card hover:bg-white/5 border border-brand-border text-white font-semibold py-3 px-8 rounded-xl transition-all"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="learn-more" className="grid md:grid-cols-3 gap-8 mt-12 scroll-mt-24">
          {features.map((feat, index) => (
            <div key={index} className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-start">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 mb-5">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-brand-textMuted leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-brand-textMuted border-t border-white/5 relative z-10">
        <p>© 2026 StellarForms. Operating on Stellar Testnet.</p>
      </footer>
    </div>
  );
};
