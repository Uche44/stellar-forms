import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mockStorage } from '../utils/mockStorage';
import { CheckCircle2, ArrowRight, Copy, Check, ExternalLink, Calendar, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReceiptPage: React.FC = () => {
  const { txHash } = useParams<{ txHash: string }>();
  const navigate = useNavigate();
  const [copiedHash, setCopiedHash] = React.useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ['receipt', txHash],
    queryFn: () => {
      if (!txHash) throw new Error('Transaction hash is missing.');
      const pay = mockStorage.getPaymentByHash(txHash);
      if (!pay) throw new Error('Receipt record not found.');
      return pay;
    },
  });

  const copyHash = () => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopiedHash(true);
    toast.success('Transaction hash copied!');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 rounded-2xl max-w-sm space-y-4">
          <CheckCircle2 size={48} className="text-brand-textMuted mx-auto" />
          <h2 className="text-xl font-bold text-white">Receipt Not Found</h2>
          <p className="text-brand-textMuted text-xs leading-relaxed">
            The transaction receipt was not found in local cache. However, you can verify it directly on Stellar Expert.
          </p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold py-2.5 px-4 rounded-xl transition-all"
          >
            Stellar Expert
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between py-12 px-6">
      <div className="max-w-md w-full mx-auto glass-panel p-8 rounded-3xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-brand-neon/15 border border-brand-neon/20 flex items-center justify-center text-brand-neon mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Payment Complete!</h1>
          <p className="text-brand-textMuted text-xs">Your payment was successfully settled on Stellar Testnet.</p>
        </div>

        {/* Receipt Details Box */}
        <div className="bg-brand-card/60 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="text-center border-b border-white/5 pb-3 mb-2">
            <p className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider">Total Settled</p>
            <p className="text-3xl font-black text-brand-neon mt-0.5">{record.amount} XLM</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-textMuted">Form</span>
              <span className="font-semibold text-white text-right max-w-[200px] truncate">{record.formTitle}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-brand-textMuted">Sender</span>
              <span className="font-mono text-brand-cyan">{record.payer.slice(0, 8)}...{record.payer.slice(-6)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-brand-textMuted">Recipient</span>
              <span className="font-mono text-brand-cyan">{record.recipient.slice(0, 8)}...{record.recipient.slice(-6)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-brand-textMuted">Settlement Date</span>
              <span className="text-white">{new Date(record.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Submitted Metadata / Custom Fields */}
        {Object.keys(record.customFieldValues).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">Submitted Details</h3>
            <div className="bg-brand-bg/40 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
              {Object.entries(record.customFieldValues).map(([key, val]) => (
                <div key={key} className="flex flex-col space-y-0.5">
                  <span className="text-[10px] text-brand-textMuted font-medium">{key}</span>
                  <span className="text-white leading-relaxed font-semibold">{val || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction Hash Actions */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-2 bg-brand-bg border border-brand-border rounded-xl p-2 pl-3">
            <span className="text-[10px] text-brand-textMuted font-mono truncate max-w-[220px]">
              {txHash}
            </span>
            <button
              onClick={copyHash}
              className="p-2 rounded-lg bg-brand-card hover:bg-white/5 border border-white/5 text-brand-textMuted hover:text-white transition-all"
              title="Copy Transaction Hash"
            >
              {copiedHash ? <Check size={14} className="text-brand-neon" /> : <Copy size={14} />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-brand-card hover:bg-white/5 border border-brand-border text-white text-xs font-semibold py-3 px-4 rounded-xl transition-all"
            >
              <ExternalLink size={14} />
              Stellar Expert
            </a>

            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-bold py-3 px-4 rounded-xl transition-all btn-glow-purple"
            >
              Return Home
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
