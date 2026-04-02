import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, CheckCircle, XCircle, Smartphone, Clock } from "lucide-react";
import maragaLogo from "@/assets/maraga-logo.png";
import { getPendingStkPayment, savePendingStkPayment } from "@/lib/pendingStkPayment";

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

interface StatusCheckResponse {
  status?: string;
  message?: string | null;
  transaction_id?: string | null;
  transaction_request_id?: string | null;
}

const REQUEST_TIMEOUT_SECONDS = 120;

const StkPaymentForm = ({
  donationId, amount, phone, currency, onComplete, onBack, onFallbackManual,
}: StkPaymentFormProps) => {
  const [status, setStatus] = useState<StkStatus>("idle");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionRequestId, setTransactionRequestId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REQUEST_TIMEOUT_SECONDS);
  const [errorMessage, setErrorMessage] = useState("");
  const hasInitializedRef = useRef(false);
  const hasHandledCompletionRef = useRef(false);
  const isCheckingStatusRef = useRef(false);
  const completionTimeoutRef = useRef<number | null>(null);

  const persistPendingPayment = useCallback((nextTransactionId: string | null, nextTransactionRequestId: string | null) => {
    const existingPending = getPendingStkPayment();

    savePendingStkPayment({
      donationId,
      amount,
      phone,
      currency,
      createdAt: existingPending?.createdAt ?? Date.now(),
      transactionId: nextTransactionId,
      transactionRequestId: nextTransactionRequestId,
    });
  }, [amount, currency, donationId, phone]);

  const handleTerminalStatus = useCallback((nextStatus: Extract<StkStatus, "completed" | "failed">, message?: string) => {
    setStatus(nextStatus);

    if (message) {
      setErrorMessage(message);
    }

    if (nextStatus === "completed" && !hasHandledCompletionRef.current) {
      hasHandledCompletionRef.current = true;

      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
      }

      completionTimeoutRef.current = window.setTimeout(onComplete, 1200);
    }
  }, [onComplete]);

  const checkStatus = useCallback(async (options: {
    forceRefresh?: boolean;
    fallbackTransactionId?: string | null;
    fallbackTransactionRequestId?: string | null;
  } = {}) => {
    const currentTransactionId = options.fallbackTransactionId ?? transactionId;
    const currentTransactionRequestId = options.fallbackTransactionRequestId ?? transactionRequestId;

    if (!currentTransactionId && !currentTransactionRequestId) return false;
    if (isCheckingStatusRef.current) return false;

    isCheckingStatusRef.current = true;

    try {
      const { data, error } = await supabase.functions.invoke<StatusCheckResponse>("pesaflux-status", {
        body: {
          transaction_id: currentTransactionId,
          transaction_request_id: currentTransactionRequestId,
          force_refresh: options.forceRefresh ?? false,
        },
      });

      if (error) throw new Error(error.message);

      const nextTransactionId = typeof data?.transaction_id === "string"
        ? data.transaction_id
        : currentTransactionId ?? null;
      const nextTransactionRequestId = typeof data?.transaction_request_id === "string"
        ? data.transaction_request_id
        : currentTransactionRequestId ?? null;

      if (nextTransactionId && nextTransactionId !== transactionId) {
        setTransactionId(nextTransactionId);
      }

      if (nextTransactionRequestId && nextTransactionRequestId !== transactionRequestId) {
        setTransactionRequestId(nextTransactionRequestId);
      }

      if (nextTransactionId || nextTransactionRequestId) {
        persistPendingPayment(nextTransactionId, nextTransactionRequestId);
      }

      if (data?.status === "completed") {
        handleTerminalStatus("completed");
        return true;
      }

      if (data?.status === "failed") {
        handleTerminalStatus("failed", data.message || "Payment was declined or cancelled");
        return true;
      }

      return false;
    } catch (err) {
      console.error("Unable to refresh STK payment status:", err);
      return false;
    } finally {
      isCheckingStatusRef.current = false;
    }
  }, [handleTerminalStatus, persistPendingPayment, transactionId, transactionRequestId]);

  const initiateStk = useCallback(async () => {
    setStatus("sending");
    setErrorMessage("");
    setCountdown(REQUEST_TIMEOUT_SECONDS);
    hasHandledCompletionRef.current = false;

    if (completionTimeoutRef.current !== null) {
      window.clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

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

      const nextTransactionId = typeof data.transaction_id === "string" ? data.transaction_id : null;
      const nextTransactionRequestId = typeof data.transaction_request_id === "string"
        ? data.transaction_request_id
        : null;

      if (!nextTransactionId && !nextTransactionRequestId) {
        throw new Error("Payment request started, but no tracking reference was returned");
      }

      setTransactionId(nextTransactionId);
      setTransactionRequestId(nextTransactionRequestId);
      persistPendingPayment(nextTransactionId, nextTransactionRequestId);
      setStatus("waiting");
      setCountdown(REQUEST_TIMEOUT_SECONDS);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send STK push");
      setStatus("failed");
    }
  }, [amount, donationId, persistPendingPayment, phone]);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const pendingPayment = getPendingStkPayment();

    if (pendingPayment?.donationId === donationId && (pendingPayment.transactionId || pendingPayment.transactionRequestId)) {
      setTransactionId(pendingPayment.transactionId ?? null);
      setTransactionRequestId(pendingPayment.transactionRequestId ?? null);
      setStatus("waiting");
      setCountdown(REQUEST_TIMEOUT_SECONDS);

      void checkStatus({
        forceRefresh: true,
        fallbackTransactionId: pendingPayment.transactionId ?? null,
        fallbackTransactionRequestId: pendingPayment.transactionRequestId ?? null,
      });
      return;
    }

    void initiateStk();
  }, [checkStatus, donationId, initiateStk]);

  useEffect(() => {
    if (status !== "waiting") return;

    if (countdown <= 0) {
      void checkStatus({ forceRefresh: true }).then((isFinal) => {
        if (!isFinal) {
          setStatus((currentStatus) => (currentStatus === "waiting" ? "timeout" : currentStatus));
        }
      });
      return;
    }

    const timer = window.setTimeout(() => setCountdown((currentCountdown) => currentCountdown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [checkStatus, countdown, status]);

  useEffect(() => {
    if (status !== "waiting" || (!transactionId && !transactionRequestId)) return;
    void checkStatus();
  }, [checkStatus, status, transactionId, transactionRequestId]);

  useEffect(() => {
    if (status !== "waiting" || !transactionId) return;

    let retriedAfterChannelError = false;

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
          const newStatus = typeof payload.new?.status === "string" ? payload.new.status : null;
          if (newStatus === "completed") {
            handleTerminalStatus("completed");
          } else if (newStatus === "failed") {
            handleTerminalStatus("failed", "Payment was declined or cancelled");
          }
        }
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === "CHANNEL_ERROR" && !retriedAfterChannelError) {
          retriedAfterChannelError = true;
          void checkStatus({ forceRefresh: true });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [checkStatus, handleTerminalStatus, status, transactionId]);

  useEffect(() => {
    if (status !== "waiting") return;

    const interval = window.setInterval(() => {
      void checkStatus();
    }, 4000);

    return () => {
      window.clearInterval(interval);
    };
  }, [checkStatus, status]);

  useEffect(() => {
    if (status !== "waiting") return;

    const handleResumeCheck = () => {
      void checkStatus({ forceRefresh: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleResumeCheck();
      }
    };

    window.addEventListener("focus", handleResumeCheck);
    window.addEventListener("pageshow", handleResumeCheck);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleResumeCheck);
      window.removeEventListener("pageshow", handleResumeCheck);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkStatus, status]);

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

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
