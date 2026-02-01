import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DonationForm from "@/components/donate/DonationForm";
import DonationStats from "@/components/donate/DonationStats";
import PaymentMethodSelection from "@/components/donate/PaymentMethodSelection";
import ThankYouDonation from "@/components/ThankYouDonation";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type DonateStep = "form" | "payment-selection" | "thank-you";

interface DonationFormData {
  name: string;
  phone: string;
  email: string;
  message: string;
  showInfo: boolean;
  currency: string;
  frequency: string;
}

const Donate = () => {
  const [step, setStep] = useState<DonateStep>("form");
  const [donationAmount, setDonationAmount] = useState<string>("1,000");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "stripe">("mpesa");
  const [formData, setFormData] = useState<DonationFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveDonation = async (status: string = "pending") => {
    if (!formData) return null;
    
    const numericAmount = parseFloat(donationAmount.replace(/,/g, ""));
    
    const { data, error } = await supabase
      .from("donations")
      .insert({
        name: formData.name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        amount: numericAmount,
        currency: formData.currency,
        payment_method: paymentMethod,
        frequency: formData.frequency,
        message: formData.message || null,
        show_info: formData.showInfo,
        status: status,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving donation:", error);
      toast.error("Failed to save donation. Please try again.");
      return null;
    }

    return data;
  };

  const handleFormSubmit = async (
    amount: string, 
    method: "mpesa" | "stripe",
    data: DonationFormData
  ) => {
    setDonationAmount(amount);
    setPaymentMethod(method);
    setFormData(data);
    
    if (method === "stripe") {
      setStep("payment-selection");
    } else {
      // M-Pesa flow - save and show thank you
      setIsSubmitting(true);
      const donation = await saveDonation("pending");
      setIsSubmitting(false);
      
      if (donation) {
        toast.success("Donation recorded! You will receive an M-Pesa prompt shortly.");
        setStep("thank-you");
      }
    }
  };

  const handlePaymentSelect = async (provider: "stripe" | "paypal") => {
    setIsSubmitting(true);
    const donation = await saveDonation("pending");
    setIsSubmitting(false);
    
    if (donation) {
      console.log(`Processing ${provider} payment for ${donationAmount}`);
      toast.success(`Redirecting to ${provider}...`);
      setStep("thank-you");
    }
  };

  if (step === "thank-you") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <ThankYouDonation />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[400px_1fr] gap-8 max-w-6xl mx-auto">
            
            {/* Left Column - Stats */}
            <div className="hidden lg:block">
              <DonationStats />
            </div>

            {/* Right Column - Donation Form or Payment Selection */}
            <div>
              {step === "form" && (
                <DonationForm onSubmit={handleFormSubmit} />
              )}

              {step === "payment-selection" && formData && (
                <PaymentMethodSelection
                  amount={donationAmount}
                  currency={formData.currency}
                  email={formData.email}
                  onSelectStripe={() => handlePaymentSelect("stripe")}
                  onSelectPayPal={() => handlePaymentSelect("paypal")}
                  onBack={() => setStep("form")}
                  isLoading={isSubmitting}
                />
              )}

              {/* Footer Info */}
              <div className="text-center text-sm text-muted-foreground mt-6">
                <p className="flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4 text-primary" />
                  You're donating to the Maraga Campaign. Transactions processed securely.
                </p>
                <p className="mt-2">
                  Questions? <a href="mailto:donations@davidmaraga.com" className="text-primary underline">donations@davidmaraga.com</a>
                  {" • "}
                  <a href="#" className="text-primary underline">Privacy</a>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="lg:hidden mt-8">
            <DonationStats />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Donate;
