import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Wallet, LogOut, Code, BarChart3, LayoutDashboard, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const { isConnected, address, balance, openWalletModal, disconnect } = useWallet();
  const location = useLocation();
  const [copied, setCopied] = React.useState(false);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/dashboard/create', label: 'Create Form', icon: <Code size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-brand-purple/20 group-hover:scale-105 transition-transform duration-300">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight text-gradient-purple-cyan">
            StellarForms
          </span>
        </Link>

        {isConnected && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/5 text-white border-l-2 border-brand-cyan'
                      : 'text-brand-textMuted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isConnected && address ? (
          <div className="flex items-center gap-2 bg-brand-bg/60 border border-brand-border rounded-xl p-1.5 pl-3">
            <div className="hidden sm:block text-right pr-2">
              <p className="text-xs text-brand-textMuted font-medium">Balance</p>
              <p className="text-sm font-semibold text-brand-cyan">{balance ? `${balance} XLM` : 'Loading...'}</p>
            </div>
            
            <button
              onClick={copyAddress}
              className="flex items-center gap-1.5 bg-brand-card hover:bg-white/5 text-white text-xs px-3 py-2 rounded-lg border border-white/5 transition-all font-mono"
              title="Copy Address"
            >
              {copied ? <Check size={14} className="text-brand-neon" /> : <Copy size={14} className="text-brand-textMuted" />}
              {truncateAddress(address)}
            </button>

            <button
              onClick={disconnect}
              className="bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger p-2 rounded-lg transition-all"
              title="Disconnect Wallet"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={openWalletModal}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all btn-glow-cyan"
          >
            <Wallet size={16} />
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};
