import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard, DollarSign, Users, Settings, LogOut,
  TrendingUp, UserPlus, CreditCard, Key, ShieldCheck,
  MessageSquare, Smartphone, Activity,
} from "lucide-react";
import maragaLogo from "@/assets/maraga-logo.png";
import AdminDonations from "@/components/admin/AdminDonations";
import AdminVolunteers from "@/components/admin/AdminVolunteers";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminSiteContent from "@/components/admin/AdminSiteContent";
import AdminDonationVerification from "@/components/admin/AdminDonationVerification";
import AdminPesaFluxConfig from "@/components/admin/AdminPesaFluxConfig";
import AdminSMS from "@/components/admin/AdminSMS";
import AdminTransactions from "@/components/admin/AdminTransactions";

interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  totalVolunteers: number;
  pendingDonations: number;
  stkTransactions: number;
  smsSent: number;
}

const AdminDashboard = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0, totalAmount: 0, totalVolunteers: 0,
    pendingDonations: 0, stkTransactions: 0, smsSent: 0,
  });

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) navigate("/admin/login");
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      const [donationsRes, volRes, stkRes, smsRes] = await Promise.all([
        supabase.from("donations").select("amount, status"),
        supabase.from("volunteers").select("*", { count: "exact", head: true }),
        supabase.from("pesaflux_transactions").select("*", { count: "exact", head: true }),
        supabase.from("sms_logs").select("*", { count: "exact", head: true }),
      ]);

      const donations = donationsRes.data;
      setStats({
        totalDonations: donations?.length || 0,
        totalAmount: donations?.filter(d => d.status === "completed").reduce((sum, d) => sum + Number(d.amount), 0) || 0,
        pendingDonations: donations?.filter(d => d.status === "pending").length || 0,
        totalVolunteers: volRes.count ?? 0,
        stkTransactions: stkRes.count ?? 0,
        smsSent: smsRes.count ?? 0,
      });
    };
    if (user && isAdmin) fetchStats();
  }, [user, isAdmin]);

  const handleSignOut = async () => { await signOut(); navigate("/admin/login"); };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={maragaLogo} alt="Maraga '27" className="h-8" />
            <span className="font-heading font-bold text-lg">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">Total Raised</p>
                <p className="text-xl font-bold text-primary">Ksh {stats.totalAmount.toLocaleString()}</p></div>
              <DollarSign className="w-6 h-6 text-primary/20" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">Donations</p>
                <p className="text-xl font-bold">{stats.totalDonations}</p></div>
              <TrendingUp className="w-6 h-6 text-muted-foreground/20" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">Volunteers</p>
                <p className="text-xl font-bold">{stats.totalVolunteers}</p></div>
              <UserPlus className="w-6 h-6 text-muted-foreground/20" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-campaign-gold">{stats.pendingDonations}</p></div>
              <CreditCard className="w-6 h-6 text-muted-foreground/20" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">STK Txns</p>
                <p className="text-xl font-bold">{stats.stkTransactions}</p></div>
              <Smartphone className="w-6 h-6 text-muted-foreground/20" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">SMS Sent</p>
                <p className="text-xl font-bold">{stats.smsSent}</p></div>
              <MessageSquare className="w-6 h-6 text-muted-foreground/20" />
            </div>
          </CardContent></Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="donations" className="space-y-4">
          <TabsList className="grid w-full max-w-4xl grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="donations" className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" /><span className="hidden sm:inline">Donations</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /><span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-1">
              <Activity className="w-4 h-4" /><span className="hidden sm:inline">STK Txns</span>
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="flex items-center gap-1">
              <Users className="w-4 h-4" /><span className="hidden sm:inline">Volunteers</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" /><span className="hidden sm:inline">SMS</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" /><span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="api-config" className="flex items-center gap-1">
              <Key className="w-4 h-4" /><span className="hidden sm:inline">API Config</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="w-4 h-4" /><span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="donations"><AdminDonations /></TabsContent>
          <TabsContent value="verification">
            <Card><CardHeader>
              <CardTitle>Payment Verification</CardTitle>
              <CardDescription>Review and verify manual M-Pesa payments</CardDescription>
            </CardHeader><CardContent><AdminDonationVerification /></CardContent></Card>
          </TabsContent>
          <TabsContent value="transactions"><AdminTransactions /></TabsContent>
          <TabsContent value="volunteers"><AdminVolunteers /></TabsContent>
          <TabsContent value="sms"><AdminSMS /></TabsContent>
          <TabsContent value="content"><AdminSiteContent /></TabsContent>
          <TabsContent value="api-config"><AdminPesaFluxConfig /></TabsContent>
          <TabsContent value="settings">
            <Card><CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage campaign settings and configurations</CardDescription>
            </CardHeader><CardContent><AdminSettings settingsFilter="general" /></CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
