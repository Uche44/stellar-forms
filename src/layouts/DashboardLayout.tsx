import React from 'react';
import { Outlet } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Header } from '../components/Header';
import { Wallet, Sparkles } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { isConnected, connect } = useWallet();

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg relative selection:bg-brand-cyan/20 selection:text-brand-cyan">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isConnected ? (
          <div className="animate-fade-in">
            <Outlet />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple mb-6 animate-pulse-slow">
              <Wallet size={32} />
            </div>
            
            <h1 className="text-3xl font-extrabold text-white mb-3">
              Access Creator Dashboard
            </h1>
            
            <p className="text-brand-textMuted mb-8 text-sm leading-relaxed">
              Connect your Stellar wallet to build customizable payment forms, view real-time receipt logs, and monitor direct payments from your audience.
            </p>
            
            <button
              onClick={connect}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold py-3 px-6 rounded-xl transition-all btn-glow-purple"
            >
              <Sparkles size={18} />
              Connect Stellar Wallet
            </button>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-brand-textMuted border-t border-white/5">
        <p>© 2026 StellarForms. Settled entirely on Stellar Testnet.</p>
      </footer>
    </div>
  );
};
