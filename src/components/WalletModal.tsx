import React from 'react';
import { X } from 'lucide-react';

// Replicate WalletType enum from the kit to prevent import failures
export const WalletType = {
  FREIGHTER: 'freighter',
  ALBEDO: 'albedo',
  XBULL: 'xbull',
} as const;

export type WalletType = (typeof WalletType)[keyof typeof WalletType];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (wallet: WalletType) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const wallets = [
    {
      id: WalletType.FREIGHTER,
      name: 'Freighter',
      desc: 'Official Stellar extension',
      icon: '🛸',
      detected: !!(window as any).stellar,
    },
    {
      id: WalletType.ALBEDO,
      name: 'Albedo',
      desc: 'Browser-based sign-in',
      icon: '🛡️',
      detected: true, // Browser-based wallet, always available
    },
    {
      id: WalletType.XBULL,
      name: 'xBull',
      desc: 'Advanced DeFi wallet',
      icon: '🐂',
      detected: true, // Usually fallback is available or detected dynamically
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-bg/85 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl animate-slide-up space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-base font-bold text-white">Select Stellar Wallet</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 text-brand-textMuted hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => {
                onSelect(wallet.id);
                onClose();
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-brand-card/50 hover:bg-brand-card border border-white/5 hover:border-brand-cyan/30 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">
                    {wallet.name}
                  </p>
                  <p className="text-[10px] text-brand-textMuted">{wallet.desc}</p>
                </div>
              </div>

              {wallet.detected ? (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-neon/10 text-brand-neon font-semibold border border-brand-neon/20">
                  Detected
                </span>
              ) : (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-brand-textMuted font-semibold border border-white/5">
                  Install
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="text-[10px] text-brand-textMuted text-center leading-relaxed">
          Ensure you have the selected extension unlocked and configured on Stellar Testnet.
        </p>
      </div>
    </div>
  );
};
