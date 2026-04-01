import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, CheckCircle, XCircle, Smartphone, Clock } from "lucide-react";
import { toast } from "sonner";
import maragaLogo from "@/assets/maraga-logo.png";

interface StkPaymentFormProps {
  donationId: string;
  amount: string;
  phone: string;
  currency: string;
  onComplete: () => void;
  onBack: () => void;
  onFallbackManual: () => void;
}

type StkStatus = "idle" | "sending" | "waiting" | "completed" | "failed" | "timeout";

const StkPaymentForm = ({
  donationId, amount, phone, currency, onComplete, onBack, onFallbackManual,
}: StkPaymentFormProps) => {
  const [status, setStatus] = useState<StkStatus>("idle");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionRequestId, setTransactionRequestId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [errorMessage, setErrorMessage] = useState("");

  const initiateStk = useCallback(async () => {
    setStatus("sending");
    setErrorMessage("");

    try {
      const numericAmount = parseFloat(amount.replace(/,/g, ""));
      const { data, error } = await supabase.functions.invoke("pesaflux-stk", {
        body: {
          amount: numericAmount,
          msisdn: phone,
          reference: `DON-${donationId.slice(0, 8)}`,
          donationId,
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Failed to initiate payment");

      setTransactionId(data.transaction_id);
      setTransactionRequestId(data.transaction_request_id);
      setStatus("waiting");
      setCountdown(60);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send STK push");
      setStatus("failed");
    }
  }, [amount, phone, donationId]);

  // Auto-initiate on mount
  useEffect(() => {
    initiateStk();
  }, [initiateStk]);

  // Countdown timer
  useEffect(() => {
    if (status !== "waiting") return;
    if (countdown <= 0) {
      setStatus("timeout");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown]);

  // Realtime subscription for instant updates
  useEffect(() => {
    if (status !== "waiting" || !transactionId) return;

    const channel = supabase
      .channel(`txn-${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pesaflux_transactions",
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          const newStatus = payload.new?.status;
          if (newStatus === "completed") {
            setStatus("completed");
            setTimeout(onComplete, 2000);
          } else if (newStatus === "failed") {
            setStatus("failed");
            setErrorMessage("Payment was declined or cancelled");
          }
        }
      )
      .subscribe();

    // Fallback polling every 5s in case realtime misses
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("pesaflux_transactions")
        .select("status")
        .eq("id", transactionId)
        .single();

      if (data?.status === "completed") {
        setStatus("completed");
        clearInterval(interval);
        setTimeout(onComplete, 2000);
      } else if (data?.status === "failed") {
        setStatus("failed");
        setErrorMessage("Payment was declined or cancelled");
        clearInterval(interval);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [status, transactionId, onComplete]);

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <div className="bg-primary text-primary-foreground p-6 text-center">
        <img src={maragaLogo} alt="Maraga '27" className="h-10 mx-auto mb-3" />
        <h2 className="text-xl font-heading font-bold">M-Pesa Payment</h2>
        <p className="text-primary-foreground/80 text-sm mt-1">
          {currency} {amount}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Sending STK */}
        {status === "sending" && (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium text-foreground">Sending payment request...</p>
            <p className="text-sm text-muted-foreground">
              An M-Pesa prompt will appear on <strong>{phone}</strong>
            </p>
          </div>
        )}

        {/* Waiting for confirmation */}
        {status === "waiting" && (
          <div className="text-center py-8 space-y-4">
            <div className="relative inline-flex">
              <Smartphone className="w-16 h-16 text-primary mx-auto" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                <Clock className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            </div>
            <p className="text-lg font-medium text-foreground">Check your phone</p>
            <p className="text-sm text-muted-foreground">
              Enter your M-Pesa PIN on <strong>{phone}</strong> to complete the payment
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono font-medium text-foreground">{countdown}s</span>
            </div>
          </div>
        )}

        {/* Completed */}
        {status === "completed" && (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <p className="text-lg font-bold text-foreground">Payment Successful!</p>
            <p className="text-sm text-muted-foreground">
              Your donation of {currency} {amount} has been received. Thank you!
            </p>
          </div>
        )}

        {/* Failed */}
        {(status === "failed" || status === "timeout") && (
          <div className="text-center py-8 space-y-4">
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <p className="text-lg font-bold text-foreground">
              {status === "timeout" ? "Request Timed Out" : "Payment Failed"}
            </p>
            <p className="text-sm text-muted-foreground">
              {status === "timeout"
                ? "The payment request expired. You can try again or pay manually."
                : errorMessage || "Something went wrong. Please try again."}
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={initiateStk} className="w-full">
                <Smartphone className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={onFallbackManual} className="w-full">
                Pay Manually via Paybill
              </Button>
            </div>
          </div>
        )}

        {/* Idle state (shouldn't normally show) */}
        {status === "idle" && (
          <div className="text-center py-8">
            <Button onClick={initiateStk} size="lg" className="w-full">
              <Smartphone className="w-5 h-5 mr-2" />
              Send M-Pesa Request
            </Button>
          </div>
        )}

        {/* Back button (only when not processing) */}
        {(status === "idle" || status === "failed" || status === "timeout") && (
          <button
            onClick={onBack}
            className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>
    </div>
  );
};

export default StkPaymentForm;
