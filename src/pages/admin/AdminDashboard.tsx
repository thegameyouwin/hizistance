import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  Settings, 
  LogOut,
  TrendingUp,
  UserPlus,
  CreditCard,
  Key,
  ShieldCheck
} from "lucide-react";
import maragaLogo from "@/assets/maraga-logo.png";
import AdminDonations from "@/components/admin/AdminDonations";
import AdminVolunteers from "@/components/admin/AdminVolunteers";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminSiteContent from "@/components/admin/AdminSiteContent";
import AdminDonationVerification from "@/components/admin/AdminDonationVerification";

interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  totalVolunteers: number;
  pendingDonations: number;
}

const AdminDashboard = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    totalAmount: 0,
    totalVolunteers: 0,
    pendingDonations: 0,
  });

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch donations stats
      const { data: donations } = await supabase
        .from("donations")
        .select("amount, status");
      
      if (donations) {
        setStats(prev => ({
          ...prev,
          totalDonations: donations.length,
          totalAmount: donations
            .filter(d => d.status === "completed")
            .reduce((sum, d) => sum + Number(d.amount), 0),
          pendingDonations: donations.filter(d => d.status === "pending").length,
        }));
      }

      // Fetch volunteers count
      const { count } = await supabase
        .from("volunteers")
        .select("*", { count: "exact", head: true });
      
      setStats(prev => ({
        ...prev,
        totalVolunteers: count ?? 0,
      }));
    };

    if (user && isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={maragaLogo} alt="Maraga '27" className="h-8" />
            <span className="font-heading font-bold text-lg">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                  <p className="text-2xl font-bold text-primary">
                    Ksh {stats.totalAmount.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                  <p className="text-2xl font-bold">{stats.totalDonations}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Volunteers</p>
                  <p className="text-2xl font-bold">{stats.totalVolunteers}</p>
                </div>
                <UserPlus className="w-8 h-8 text-muted-foreground/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-campaign-gold">{stats.pendingDonations}</p>
                </div>
                <CreditCard className="w-8 h-8 text-muted-foreground/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="donations" className="space-y-4">
          <TabsList className="grid w-full max-w-3xl grid-cols-6">
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Donations</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Volunteers</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="donations">
            <AdminDonations />
          </TabsContent>

          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Payment Verification</CardTitle>
                <CardDescription>
                  Review and verify manual M-Pesa payments (transaction codes &amp; screenshots)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminDonationVerification />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volunteers">
            <AdminVolunteers />
          </TabsContent>

          <TabsContent value="content">
            <AdminSiteContent />
          </TabsContent>

          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <CardTitle>Payment API Keys</CardTitle>
                <CardDescription>
                  Configure your payment provider credentials. These are stored securely.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSettings settingsFilter="payment" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage campaign settings and configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSettings settingsFilter="general" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
