import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MaragaLogo from "@/components/MaragaLogo";
import { Smartphone, CreditCard } from "lucide-react";

interface DonationFormProps {
  onSubmit: (amount: string, paymentMethod: "mpesa" | "stripe") => void;
}

const DonationForm = ({ onSubmit }: DonationFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "stripe">("mpesa");
  const [amount, setAmount] = useState<string>("1,000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [showInfo, setShowInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const amounts = ["50", "100", "500", "1,000", "2,000", "5,000", "10,000"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = amount || customAmount;
    onSubmit(finalAmount, paymentMethod);
  };

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      {/* Payment Method Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setPaymentMethod("mpesa")}
          className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 transition-colors ${
            paymentMethod === "mpesa" 
              ? "bg-card text-foreground border-b-2 border-primary" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Smartphone className="w-5 h-5" />
          M-Pesa
        </button>
        <button
          onClick={() => setPaymentMethod("stripe")}
          className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 transition-colors ${
            paymentMethod === "stripe" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <CreditCard className="w-5 h-5" />
          Stripe/PayPal
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6 md:p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <MaragaLogo />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-heading font-bold text-primary mb-2">
            Make your contribution with {paymentMethod === "mpesa" ? "M-Pesa" : "Card"}
          </h2>
          <p className="text-muted-foreground">
            Safe, fast and secure {paymentMethod === "mpesa" ? "mobile" : "online"} payments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Choose Amount (KES)
            </label>
            <div className="grid grid-cols-4 gap-3">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setAmount(amt); setCustomAmount(""); }}
                  className={`py-3 px-2 md:px-4 rounded-lg border text-sm font-medium transition-colors ${
                    amount === amt
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary"
                  }`}
                >
                  {amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount("")}
                className={`py-3 px-2 md:px-4 rounded-lg border text-sm font-medium transition-colors ${
                  amount === "" && customAmount
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                Other
              </button>
            </div>
            
            {amount === "" && (
              <Input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter custom amount"
                className="mt-3"
              />
            )}
          </div>

          {/* Show My Information Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">Show My Information</p>
                <p className="text-sm text-muted-foreground">Your name and email will be visible</p>
              </div>
            </div>
            <Switch checked={showInfo} onCheckedChange={setShowInfo} />
          </div>

          {/* Personal Info */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <div className="flex gap-2">
              <Select defaultValue="+254">
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+254">🇰🇪 +254</SelectItem>
                  <SelectItem value="+255">🇹🇿 +255</SelectItem>
                  <SelectItem value="+256">🇺🇬 +256</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="712345678"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your mobile money number (without country code)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Optional Message
            </label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Leave a message of support..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full btn-donate-gradient rounded-lg py-6 text-lg"
          >
            {paymentMethod === "stripe" ? "Continue to Payment" : "Donate Now"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;
