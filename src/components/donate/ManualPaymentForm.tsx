import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Upload, CheckCircle, Loader2, ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import maragaLogo from "@/assets/maraga-logo.png";

interface ManualPaymentFormProps {
  donationId: string;
  amount: string;
  currency: string;
  onComplete: () => void;
  onBack: () => void;
}

interface PaybillInfo {
  paybill: string;
  accountNumber: string;
  bankName: string;
  instructions: string;
}

const ManualPaymentForm = ({ donationId, amount, currency, onComplete, onBack }: ManualPaymentFormProps) => {
  const [verificationType, setVerificationType] = useState<"transaction_code" | "screenshot">("transaction_code");
  const [transactionCode, setTransactionCode] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paybillInfo, setPaybillInfo] = useState<PaybillInfo>({
    paybill: "",
    accountNumber: "",
    bankName: "NCBA Bank",
    instructions: "",
  });

  useEffect(() => {
    const fetchPaybillInfo = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["ncba_paybill", "ncba_account_number", "ncba_bank_name", "payment_instructions", "mpesa_paybill"]);

      if (data) {
        const settings: Record<string, string> = {};
        data.forEach((s) => { settings[s.key] = s.value || ""; });
        setPaybillInfo({
          paybill: settings.ncba_paybill || settings.mpesa_paybill || "",
          accountNumber: settings.ncba_account_number || "",
          bankName: settings.ncba_bank_name || "NCBA Bank",
          instructions: settings.payment_instructions || "",
        });
      }
    };
    fetchPaybillInfo();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleSubmit = async () => {
    if (verificationType === "transaction_code" && !transactionCode.trim()) {
      toast.error("Please enter your M-Pesa transaction code");
      return;
    }
    if (verificationType === "screenshot" && !screenshotFile) {
      toast.error("Please upload a payment screenshot");
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshotUrl = null;

      if (verificationType === "screenshot" && screenshotFile) {
        const fileExt = screenshotFile.name.split(".").pop();
        const filePath = `${donationId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("payment-screenshots")
          .upload(filePath, screenshotFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("payment-screenshots")
          .getPublicUrl(filePath);

        screenshotUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("donations")
        .update({
          verification_type: verificationType,
          transaction_code: verificationType === "transaction_code" ? transactionCode.trim().toUpperCase() : null,
          screenshot_url: screenshotUrl,
          status: "pending_verification",
        })
        .eq("id", donationId);

      if (error) throw error;

      toast.success("Payment details submitted! We'll verify your donation shortly.");
      onComplete();
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 text-center">
        <img src={maragaLogo} alt="Maraga '27" className="h-10 mx-auto mb-3" />
        <h2 className="text-xl font-heading font-bold">Complete Your Donation</h2>
        <p className="text-primary-foreground/80 text-sm mt-1">
          {currency} {amount} via M-Pesa Paybill
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Paybill Instructions */}
        <div className="bg-secondary rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-foreground">Payment Instructions</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Go to <strong>M-Pesa</strong> → Lipa na M-Pesa → Pay Bill</li>
            {paybillInfo.paybill && (
              <li className="flex items-center gap-2 flex-wrap">
                Business Number: <strong className="text-foreground">{paybillInfo.paybill}</strong>
                <button onClick={() => copyToClipboard(paybillInfo.paybill, "Paybill")} className="text-primary hover:text-primary/80">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </li>
            )}
            {paybillInfo.accountNumber && (
              <li className="flex items-center gap-2 flex-wrap">
                Account Number: <strong className="text-foreground">{paybillInfo.accountNumber}</strong>
                <button onClick={() => copyToClipboard(paybillInfo.accountNumber, "Account")} className="text-primary hover:text-primary/80">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </li>
            )}
            <li>Enter Amount: <strong className="text-foreground">{currency} {amount}</strong></li>
            <li>Enter your M-Pesa PIN and confirm</li>
          </ol>
          {paybillInfo.instructions && (
            <p className="text-xs text-muted-foreground mt-2 italic">{paybillInfo.instructions}</p>
          )}
        </div>

        {/* Verification Method Toggle */}
        <div>
          <Label className="mb-3 block font-medium">How would you like to verify?</Label>
          <div className="flex rounded-lg overflow-hidden border border-border">
            <button
              type="button"
              onClick={() => setVerificationType("transaction_code")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                verificationType === "transaction_code"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              Transaction Code
            </button>
            <button
              type="button"
              onClick={() => setVerificationType("screenshot")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                verificationType === "screenshot"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              Upload Screenshot
            </button>
          </div>
        </div>

        {/* Transaction Code Input */}
        {verificationType === "transaction_code" && (
          <div className="space-y-2">
            <Label htmlFor="txCode">M-Pesa Transaction Code</Label>
            <Input
              id="txCode"
              value={transactionCode}
              onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
              placeholder="e.g. SLK4H7R2T9"
              className="uppercase tracking-wider font-mono text-lg"
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              You'll receive this code via SMS after completing the M-Pesa payment
            </p>
          </div>
        )}

        {/* Screenshot Upload */}
        {verificationType === "screenshot" && (
          <div className="space-y-2">
            <Label>Payment Screenshot</Label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors">
              {screenshotFile ? (
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{screenshotFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size > 5 * 1024 * 1024) {
                    toast.error("File must be under 5MB");
                    return;
                  }
                  setScreenshotFile(file || null);
                }}
              />
            </label>
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="w-full btn-donate-gradient rounded-lg py-6 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Payment Verification"
          )}
        </Button>

        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
};

export default ManualPaymentForm;
