import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DonationForm from "@/components/donate/DonationForm";
import DonationStats from "@/components/donate/DonationStats";
import PaymentMethodSelection from "@/components/donate/PaymentMethodSelection";
import ThankYouDonation from "@/components/ThankYouDonation";
import { Shield } from "lucide-react";

type DonateStep = "form" | "payment-selection" | "thank-you";

const Donate = () => {
  const [step, setStep] = useState<DonateStep>("form");
  const [donationAmount, setDonationAmount] = useState<string>("1,000");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "stripe">("mpesa");

  const handleFormSubmit = (amount: string, method: "mpesa" | "stripe") => {
    setDonationAmount(amount);
    setPaymentMethod(method);
    
    if (method === "stripe") {
      setStep("payment-selection");
    } else {
      // M-Pesa flow - show thank you directly
      setStep("thank-you");
    }
  };

  const handlePaymentSelect = (provider: "stripe" | "paypal") => {
    // In a real implementation, this would redirect to Stripe/PayPal
    console.log(`Processing ${provider} payment for ${donationAmount}`);
    setStep("thank-you");
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

              {step === "payment-selection" && (
                <PaymentMethodSelection
                  amount={donationAmount}
                  email="tester@gmail.com"
                  onSelectStripe={() => handlePaymentSelect("stripe")}
                  onSelectPayPal={() => handlePaymentSelect("paypal")}
                  onBack={() => setStep("form")}
                />
              )}

              {/* Footer Info */}
              <div className="text-center text-sm text-muted-foreground mt-6">
                <p className="flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4 text-primary" />
                  You're donating to the Maraga Campaign. Transactions processed by MookPay.
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
