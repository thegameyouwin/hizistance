import { Heart, Shield, ChevronRight } from "lucide-react";

const DonationStats = () => {
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

  return (
    <div className="space-y-6">
      {/* Live Donation Progress */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold text-foreground">
            Live Donation Progress
          </h2>
          <button className="text-primary hover:text-primary/80 transition-colors">
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
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              </div>
              <div className="text-lg font-bold text-primary">{method.amount}</div>
              <div className="text-sm text-muted-foreground">
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
            <p className="text-sm text-muted-foreground">See how your contribution makes a difference</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>

      <button className="w-full bg-card rounded-xl shadow-card border border-border p-4 flex items-center justify-between hover:shadow-elevated transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-foreground">Privacy & Data Protection</h4>
            <p className="text-sm text-muted-foreground">Our commitment to your privacy</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
};

export default DonationStats;
