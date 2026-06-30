import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useWallet } from '../context/WalletContext';
import { mockStorage } from '../utils/mockStorage';
import { ArrowLeft, Plus, Trash2, Eye, ShieldAlert, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const formSchema = zod.object({
  title: zod.string().min(3, 'Title must be at least 3 characters.').max(50, 'Title too long.'),
  description: zod.string().min(10, 'Description must be at least 10 characters.').max(300, 'Description too long.'),
  amount: zod.string().refine((val) => {
    const parsed = parseFloat(val);
    return !isNaN(parsed) && parsed >= 0;
  }, { message: 'Amount must be 0 or a positive number.' }),
  isVariableAmount: zod.boolean(),
  customFields: zod.array(
    zod.object({
      type: zod.enum(['text', 'email', 'message']),
      label: zod.string().min(1, 'Field name is required.').max(30, 'Field name too long.'),
      required: zod.boolean()
    })
  )
});

type FormValues = zod.infer<typeof formSchema>;

export const CreateForm: React.FC = () => {
  const { address } = useWallet();
  const navigate = useNavigate();

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: 'Support My Project',
      description: 'Help me keep building tools for the community!',
      amount: '10.00',
      isVariableAmount: false,
      customFields: [
        { type: 'text', label: 'Name', required: true }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customFields'
  });

  const watchAllFields = watch();

  const onSubmit = async (data: FormValues) => {
    if (!address) {
      toast.error('Connect your wallet first.');
      return;
    }

    try {
      mockStorage.saveForm({
        creator: address,
        title: data.title,
        description: data.description,
        amount: data.isVariableAmount ? '0' : data.amount,
        isVariableAmount: data.isVariableAmount,
        customFields: data.customFields
      });
      toast.success('Payment form created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create payment form.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-brand-textMuted hover:text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Editor */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-brand-purple" size={20} />
            <h2 className="text-xl font-extrabold text-white">Form Builder</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs text-brand-textMuted font-semibold uppercase tracking-wider">Form Title</label>
              <input
                {...register('title')}
                type="text"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-white"
                placeholder="Support My Open Source Work"
              />
              {errors.title && <p className="text-brand-danger text-xs">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs text-brand-textMuted font-semibold uppercase tracking-wider">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-white resize-none"
                placeholder="Give your visitors context about what they are paying for..."
              />
              {errors.description && <p className="text-brand-danger text-xs">{errors.description.message}</p>}
            </div>

            {/* Pricing Model */}
            <div className="p-4 rounded-xl bg-brand-bg/60 border border-brand-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Let payer choose amount</p>
                  <p className="text-[10px] text-brand-textMuted">Enable variable amount donations/payments</p>
                </div>
                <input
                  {...register('isVariableAmount')}
                  type="checkbox"
                  className="w-4 h-4 rounded text-brand-cyan focus:ring-brand-cyan"
                />
              </div>

              {!watchAllFields.isVariableAmount && (
                <div className="space-y-1.5 pt-2 border-t border-brand-border">
                  <label className="text-xs text-brand-textMuted font-semibold">Payment Amount (XLM)</label>
                  <input
                    {...register('amount')}
                    type="number"
                    step="0.01"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white"
                    placeholder="10.00"
                  />
                  {errors.amount && <p className="text-brand-danger text-xs">{errors.amount.message}</p>}
                </div>
              )}
            </div>

            {/* Custom Fields Builder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs text-brand-textMuted font-semibold uppercase tracking-wider">Payer Custom Fields</label>
                <button
                  type="button"
                  onClick={() => append({ type: 'text', label: '', required: false })}
                  className="flex items-center gap-1 text-[10px] font-bold text-brand-cyan hover:text-white transition-colors"
                >
                  <Plus size={14} /> Add Field
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 bg-brand-bg/40 p-3 rounded-xl border border-white/5">
                    <select
                      {...register(`customFields.${index}.type` as const)}
                      className="glass-input rounded-lg px-2.5 py-1.5 text-xs text-white bg-brand-bg w-24"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="message">Long Text</option>
                    </select>

                    <input
                      {...register(`customFields.${index}.label` as const)}
                      type="text"
                      placeholder="Field Label (e.g. GitHub Username)"
                      className="flex-1 glass-input rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />

                    <div className="flex items-center gap-1.5">
                      <input
                        {...register(`customFields.${index}.required` as const)}
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded text-brand-purple"
                        title="Required?"
                      />
                      <span className="text-[10px] text-brand-textMuted font-medium">Req</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1.5 rounded-md hover:bg-brand-danger/10 text-brand-textMuted hover:text-brand-danger transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {errors.customFields && <p className="text-brand-danger text-xs">{errors.customFields.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold py-3 px-4 rounded-xl transition-all btn-glow-purple disabled:opacity-50"
            >
              Create Form
            </button>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border-brand-cyan/20 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-brand-cyan border-b border-white/5 pb-4">
              <Eye size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Live Customer Preview</span>
            </div>

            {/* Simulated Payment Page Container */}
            <div className="bg-brand-bg border border-brand-border rounded-2xl p-6 space-y-6 shadow-2xl relative">
              <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-bold text-brand-textMuted">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse-slow" /> Testnet Mode
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{watchAllFields.title || 'Untitled Form'}</h3>
                <p className="text-xs text-brand-textMuted mt-1 leading-relaxed">{watchAllFields.description || 'No description provided.'}</p>
              </div>

              {/* Price Display */}
              <div className="bg-brand-card/60 border border-white/5 p-4 rounded-xl text-center">
                <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block mb-1">Payment Amount</span>
                {watchAllFields.isVariableAmount ? (
                  <div className="flex items-center justify-center gap-2 max-w-[140px] mx-auto">
                    <input
                      type="number"
                      placeholder="10.00"
                      disabled
                      className="w-full bg-brand-bg border border-brand-border text-center rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                    <span className="text-xs font-bold text-brand-cyan">XLM</span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-brand-cyan">{watchAllFields.amount || '0.00'} XLM</span>
                )}
              </div>

              {/* Simulated Fields */}
              <div className="space-y-4">
                {watchAllFields.customFields?.map((f, i) => (
                  <div key={i} className="space-y-1">
                    <label className="text-[10px] text-brand-textMuted font-semibold">
                      {f.label || `Field ${i + 1}`} {f.required && <span className="text-brand-danger">*</span>}
                    </label>
                    {f.type === 'message' ? (
                      <textarea disabled rows={2} className="w-full bg-brand-card border border-brand-border text-xs px-3 py-2 rounded-lg text-white" />
                    ) : (
                      <input disabled type="text" className="w-full bg-brand-card border border-brand-border text-xs px-3 py-2 rounded-lg text-white" />
                    )}
                  </div>
                ))}
              </div>

              {/* Fake connect / pay button */}
              <button disabled className="w-full bg-gradient-to-r from-brand-purple/40 to-brand-cyan/40 text-white/50 text-xs font-bold py-3 px-4 rounded-xl border border-white/5">
                Pay with Wallet
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-2.5 p-4 bg-brand-purple/5 border border-brand-purple/20 rounded-xl text-xs text-brand-textMuted leading-relaxed">
            <ShieldAlert size={18} className="text-brand-purple shrink-0 mt-0.5" />
            <p>
              Once created, this payment configuration schema is stored as contract metadata. Anyone with the shareable URL can pay directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
