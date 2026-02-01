import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MaragaLogo from "@/components/MaragaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, CreditCard, Heart, Shield, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Donate = () => {
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "stripe">("mpesa");
  const [amount, setAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [showInfo, setShowInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const amounts = ["50", "100", "500", "1,000", "2,000", "5,000", "10,000"];

  const donationStats = {
    total: "Ksh 555,946",
    donations: 1841,
    donors: 1579,
  };

  const paymentMethods = [
    { id: "mpesa", label: "M-Pesa", amount: "Ksh 555,946", donations: 1841, donors: 1579 },
    { id: "stripe", label: "Stripe", amount: "Ksh 0", donations: 0, donors: 24 },
    { id: "paypal", label: "PayPal", amount: "Ksh 0", donations: 0, donors: 13 },
    { id: "paybill", label: "Direct Paybill", amount: "Ksh 0", donations: 0, donors: 0 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thank you for your donation!",
      description: `Processing your ${paymentMethod === "mpesa" ? "M-Pesa" : "card"} payment of Ksh ${amount || customAmount}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[400px_1fr] gap-8 max-w-6xl mx-auto">
            
            {/* Left Column - Stats */}
            <div className="space-y-6">
              {/* Live Donation Progress */}
              <div className="bg-card rounded-2xl shadow-card border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-heading font-bold text-foreground">
                    Live Donation Progress
                  </h2>
                  <button className="text-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {donationStats.total} <span className="text-base font-normal text-muted-foreground">raised</span>
                  </div>
                  <p className="text-sm text-primary">From {donationStats.donations} donations</p>
                  <p className="text-sm text-primary">Real-time updates</p>
                </div>

                {/* Payment Methods Stats */}
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{method.label}</span>
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                      </div>
                      <div className="text-lg font-bold text-primary">{method.amount}</div>
                      <div className="text-sm text-primary">
                        {method.donations} donations • {method.donors} donors
                      </div>
                      <p className="text-xs text-primary mt-1">Real-time updates</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Cards */}
              <button className="w-full bg-card rounded-xl shadow-card border border-border p-4 flex items-center justify-between hover:shadow-elevated transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground">Why Your Support Matters</h4>
                    <p className="text-sm text-primary">See how your contribution makes a difference</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>

              <button className="w-full bg-card rounded-xl shadow-card border border-border p-4 flex items-center justify-between hover:shadow-elevated transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground">Privacy & Data Protection</h4>
                    <p className="text-sm text-primary">Our commitment to your privacy</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>

            {/* Right Column - Donation Form */}
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              {/* Payment Method Tabs */}
              <div className="flex border-b border-border">
                <button
                  onClick={() => setPaymentMethod("mpesa")}
                  className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === "mpesa" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-card text-foreground hover:bg-muted"
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
                      : "bg-card text-foreground hover:bg-muted"
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
                          className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
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
                        className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
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
                    className="w-full btn-movement rounded-lg py-6 text-lg"
                  >
                    Donate Now
                  </Button>

                  {/* Footer Info */}
                  <div className="text-center text-sm text-muted-foreground">
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
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Donate;
