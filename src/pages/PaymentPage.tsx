import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { TransactionBuilder, Asset, Operation, Networks, Horizon } from '@stellar/stellar-sdk';
import { mockStorage } from '../utils/mockStorage';
import { useWallet } from '../context/WalletContext';
import { ShieldCheck, Wallet, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { isConnected, address: payerAddress, openWalletModal, signTransaction } = useWallet();
  const horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org');

  // Load form details
  const { data: form, isLoading, error } = useQuery({
    queryKey: ['payForm', formId],
    queryFn: () => {
      if (!formId) throw new Error('Form ID is missing.');
      const f = mockStorage.getFormById(formId);
      if (!f) throw new Error('Form not found.');
      return f;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm();

  const [isPaying, setIsPaying] = React.useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !form || form.status === 'inactive') {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 rounded-2xl max-w-sm space-y-4">
          <AlertCircle size={48} className="text-brand-danger mx-auto" />
          <h2 className="text-xl font-bold text-white">Payment Form Unavailable</h2>
          <p className="text-brand-textMuted text-xs leading-relaxed">
            This payment form might have been disabled, deleted, or the link is invalid. Please contact the creator.
          </p>
          <button onClick={() => navigate('/')} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs px-4 py-2 rounded-xl transition-all">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async (data: any) => {
    if (!isConnected || !payerAddress) {
      toast.error('Please connect your wallet.');
      return;
    }

    const payAmount = form.isVariableAmount ? data.customAmount : form.amount;
    if (!payAmount || parseFloat(payAmount) <= 0) {
      toast.error('Invalid payment amount.');
      return;
    }

    setIsPaying(true);
    const loadingToast = toast.loading('Initiating payment... please approve in wallet');

    try {
      // 1. Load payer account details to get current sequence number
      const payerAccount = await horizonServer.loadAccount(payerAddress);

      // 2. Build the transaction
      const transaction = new TransactionBuilder(payerAccount, {
        fee: '100', // Standard base fee in stroops (100 stroops = 0.00001 XLM)
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: form.creator,
            asset: Asset.native(),
            amount: parseFloat(payAmount).toFixed(7), // Stellar requires 7 decimal places for native payments
          })
        )
        // Add a text memo to link this payment to the form ID
        .addMemo(new Horizon.Memo(Horizon.MemoText, form.id.slice(0, 28)))
        .setTimeout(30) // Transaction expires in 30 seconds
        .build();

      const xdr = transaction.toXDR();

      // 3. Request signature from the connected wallet
      const signedXdr = await signTransaction(xdr);

      // 4. Submit signed transaction to Horizon Testnet
      toast.loading('Submitting transaction to Stellar network...', { id: loadingToast });
      const submitResponse = await horizonServer.submitTransaction(
        TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET)
      );

      if (submitResponse.successful) {
        // 5. Extract fields data
        const fieldValues: Record<string, string> = {};
        form.customFields.forEach((field) => {
          fieldValues[field.label] = data[field.label] || '';
        });

        // 6. Record receipt details in mock storage
        const savedRecord = mockStorage.savePayment({
          formId: form.id,
          formTitle: form.title,
          payer: payerAddress,
          recipient: form.creator,
          amount: parseFloat(payAmount).toFixed(2),
          hash: submitResponse.hash,
          customFieldValues: fieldValues,
        });

        toast.success('Payment completed successfully!', { id: loadingToast });
        navigate(`/receipt/${submitResponse.hash}`);
      } else {
        throw new Error('Transaction submission failed.');
      }
    } catch (err: any) {
      console.error('Payment Error:', err);
      toast.error(err.message || 'Payment transaction failed or was rejected.', { id: loadingToast });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between py-12 px-6">
      <div className="absolute top-0 left-0 w-full h-full bg-cover pointer-events-none opacity-20" />
      
      <div className="max-w-md w-full mx-auto glass-panel p-8 rounded-3xl relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-1 text-[10px] text-brand-textMuted font-bold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse-slow" /> Testnet Payment
          </div>
          <ShieldCheck size={18} className="text-brand-cyan" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-white leading-tight">{form.title}</h1>
          <p className="text-xs text-brand-textMuted mt-1 leading-relaxed">{form.description}</p>
        </div>

        <form onSubmit={handleSubmit(handlePayment)} className="space-y-5">
          {/* Price Selector / Input */}
          <div className="bg-brand-card/60 border border-white/5 p-5 rounded-2xl text-center">
            <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block mb-2">Payment Amount</span>
            {form.isVariableAmount ? (
              <div className="flex items-center justify-center gap-2 max-w-[180px] mx-auto">
                <input
                  type="number"
                  step="0.01"
                  {...register('customAmount', { required: true, min: 0.01 })}
                  placeholder="10.00"
                  className="w-full bg-brand-bg border border-brand-border text-center rounded-xl px-3 py-2 text-sm text-white font-bold"
                />
                <span className="text-sm font-bold text-brand-cyan">XLM</span>
              </div>
            ) : (
              <span className="text-3xl font-black text-brand-cyan">{form.amount} XLM</span>
            )}
          </div>

          {/* Dynamic custom fields inputs */}
          {form.customFields.length > 0 && (
            <div className="space-y-4">
              <span className="text-xs text-brand-textMuted font-semibold uppercase tracking-wider block">Required Information</span>
              {form.customFields.map((field) => (
                <div key={field.label} className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-medium">
                    {field.label} {field.required && <span className="text-brand-danger">*</span>}
                  </label>
                  {field.type === 'message' ? (
                    <textarea
                      rows={3}
                      {...register(field.label, { required: field.required })}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white resize-none"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={field.type === 'email' ? 'email' : 'text'}
                      {...register(field.label, { required: field.required })}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit controls */}
          <div className="pt-2">
            {isConnected ? (
              <button
                type="submit"
                disabled={isPaying}
                className="w-full flex items-center justify-center bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold py-3 px-5 rounded-xl transition-all btn-glow-purple disabled:opacity-50"
              >
                {isPaying ? 'Processing...' : `Pay ${form.isVariableAmount ? '' : form.amount} XLM`}
              </button>
            ) : (
              <button
                type="button"
                onClick={openWalletModal}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold py-3 px-5 rounded-xl transition-all btn-glow-cyan"
              >
                <Wallet size={16} />
                Connect Wallet to Pay
              </button>
            )}
          </div>
        </form>
      </div>

      <footer className="text-center text-[10px] text-brand-textMuted">
        StellarForms does not take custody of funds. XLM is settled peer-to-peer.
      </footer>
    </div>
  );
};
