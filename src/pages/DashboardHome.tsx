import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "../context/WalletContext";
import { mockStorage, type PaymentForm } from "../utils/mockStorage";
import {
  Plus,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Receipt,
} from "lucide-react";
import toast from "react-hot-toast";

export const DashboardHome: React.FC = () => {
  const { address, balance } = useWallet();
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Fetch creator forms
  const { data: forms = [], isLoading: isLoadingForms } = useQuery({
    queryKey: ["forms", address],
    queryFn: () => mockStorage.getForms(address || undefined),
    enabled: !!address,
  });

  // Fetch creator payments
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ["payments", address],
    queryFn: () => mockStorage.getPayments(address || undefined),
    enabled: !!address,
  });

  // Toggle active state mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      return mockStorage.toggleFormStatus(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms", address] });
      toast.success("Form status updated!");
    },
  });

  const handleCopyLink = (formId: string) => {
    const payLink = `${window.location.origin}/pay/${formId}`;
    navigator.clipboard.writeText(payLink);
    setCopiedId(formId);
    toast.success("Share link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate metrics
  const totalPaymentsCount = payments.length;
  const totalVolume = payments
    .reduce((acc, p) => acc + parseFloat(p.amount), 0)
    .toFixed(2);
  const activeFormsCount = forms.filter((f) => f.status === "active").length;

  return (
    <div className="space-y-10">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome Back!
          </h1>
          <p className="text-brand-textMuted text-sm">
            Monitor payment forms and direct incoming transfers into your
            wallet.
          </p>
        </div>
        <Link
          to="/dashboard/create"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold py-3 px-5 rounded-xl transition-all btn-glow-cyan"
        >
          <Plus size={18} />
          Create Payment Form
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-xs text-brand-textMuted font-semibold uppercase tracking-wider mb-2">
            Wallet Balance
          </p>
          <p className="text-2xl font-extrabold text-brand-cyan">
            {balance ? `${balance} XLM` : "Loading..."}
          </p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-xs text-brand-textMuted font-semibold uppercase tracking-wider mb-2">
            Total Received
          </p>
          <p className="text-2xl font-extrabold text-brand-purple">
            {totalVolume} XLM
          </p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-xs text-brand-textMuted font-semibold uppercase tracking-wider mb-2">
            Total Payments
          </p>
          <p className="text-2xl font-extrabold text-white">
            {totalPaymentsCount}
          </p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-xs text-brand-textMuted font-semibold uppercase tracking-wider mb-2">
            Active Forms
          </p>
          <p className="text-2xl font-extrabold text-brand-neon">
            {activeFormsCount}
          </p>
        </div>
      </div>

      {/* Main Grid: Active Forms & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forms Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white">
              Your Payment Forms
            </h2>
            <span className="text-xs text-brand-textMuted font-semibold">
              {forms.length} total
            </span>
          </div>

          {isLoadingForms ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-brand-card/40 rounded-2xl border border-white/5"
                />
              ))}
            </div>
          ) : forms.length === 0 ? (
            <div className="glass-panel py-12 px-6 rounded-2xl border border-dashed border-brand-border text-center">
              <Sparkles
                className="mx-auto text-brand-textMuted/40 mb-4"
                size={40}
              />
              <p className="text-white font-bold mb-2">
                No payment forms created yet
              </p>
              <p className="text-brand-textMuted text-xs mb-6 max-w-sm mx-auto">
                Create a customizable form to share with your clients, audience,
                or sponsors to receive payments directly.
              </p>
              <Link
                to="/dashboard/create"
                className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold py-2.5 px-4 rounded-xl border border-white/10"
              >
                Create First Form
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {forms.map((form: PaymentForm) => (
                <div
                  key={form.id}
                  className="glass-panel p-6 rounded-2xl glass-panel-hover flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {form.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                          form.status === "active"
                            ? "bg-brand-neon/10 border-brand-neon/20 text-brand-neon"
                            : "bg-white/5 border-white/10 text-brand-textMuted"
                        }`}
                      >
                        {form.status === "active" ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-brand-textMuted line-clamp-2 max-w-lg leading-relaxed">
                      {form.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-brand-cyan">
                      <span>
                        {form.isVariableAmount
                          ? "Variable XLM"
                          : `${form.amount} XLM`}
                      </span>
                      <span className="text-brand-border">•</span>
                      <span className="text-brand-textMuted">
                        {form.customFields.length} custom fields
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                    <button
                      onClick={() => handleCopyLink(form.id)}
                      className="flex items-center gap-1.5 bg-brand-bg hover:bg-white/5 text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-white/5 transition-all"
                      title="Copy Share Link"
                    >
                      {copiedId === form.id ? (
                        <Check
                          size={14}
                          className="text-brand-neon"
                        />
                      ) : (
                        <Copy size={14} />
                      )}
                      Copy Link
                    </button>

                    <Link
                      to={`/pay/${form.id}`}
                      className="flex items-center gap-1.5 bg-brand-bg hover:bg-white/5 text-white text-xs font-medium px-3.5 py-2.5 rounded-xl border border-white/5 transition-all"
                      title="View Form Page"
                    >
                      <ExternalLink size={14} />
                      Preview
                    </Link>

                    <button
                      onClick={() => toggleStatusMutation.mutate(form.id)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        form.status === "active"
                          ? "border-brand-neon/20 text-brand-neon bg-brand-neon/5 hover:bg-brand-neon/10"
                          : "border-white/5 text-brand-textMuted bg-brand-bg hover:bg-white/5"
                      }`}
                      title={
                        form.status === "active"
                          ? "Disable Form"
                          : "Enable Form"
                      }
                    >
                      {form.status === "active" ? (
                        <ToggleRight size={20} />
                      ) : (
                        <ToggleLeft size={20} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white">
              Recent Payments
            </h2>
          </div>

          {isLoadingPayments ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-brand-card/40 rounded-2xl border border-white/5"
                />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="glass-panel py-12 px-6 rounded-2xl text-center text-brand-textMuted border border-white/5 text-xs">
              <ShieldCheck
                className="mx-auto mb-3 text-brand-textMuted/40"
                size={32}
              />
              No payment transactions recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((pay) => (
                <div
                  key={pay.id}
                  className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">
                        {pay.amount} XLM
                      </span>
                      <span className="text-brand-textMuted font-medium">
                        from
                      </span>
                      <span className="font-mono text-brand-cyan">
                        {pay.payer.slice(0, 4)}...{pay.payer.slice(-3)}
                      </span>
                    </div>
                    <p className="text-[10px] text-brand-textMuted truncate max-w-[160px]">
                      {pay.formTitle}
                    </p>
                    <span className="text-[10px] text-brand-textMuted">
                      {new Date(pay.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/receipt/${pay.hash}`}
                      className="p-2 rounded-lg bg-brand-bg hover:bg-white/5 border border-white/5 text-brand-textMuted hover:text-white"
                      title="View Receipt"
                    >
                      <Receipt size={14} />
                    </Link>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${pay.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-brand-bg hover:bg-white/5 border border-white/5 text-brand-textMuted hover:text-brand-cyan"
                      title="View on Stellar Expert"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
