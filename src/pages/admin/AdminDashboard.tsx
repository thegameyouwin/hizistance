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
  MessageSquare, Smartphone, Activity, BarChart3, Clock,
  CheckCircle, XCircle, ArrowUpRight, ArrowDownRight,
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
import AdminMaintenanceToggle from "@/components/admin/AdminMaintenanceToggle";

interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  totalVolunteers: number;
  pendingDonations: number;
  completedDonations: number;
  failedDonations: number;
  stkTransactions: number;
  smsSent: number;
  recentDonations: any[];
  recentVolunteers: any[];
}

const AdminDashboard = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0, totalAmount: 0, totalVolunteers: 0,
    pendingDonations: 0, completedDonations: 0, failedDonations: 0,
    stkTransactions: 0, smsSent: 0, recentDonations: [], recentVolunteers: [],
  });

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) navigate("/admin/login");
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      const [donationsRes, volRes, stkRes, smsRes, recentDonRes, recentVolRes] = await Promise.all([
        supabase.from("donations").select("amount, status"),
        supabase.from("volunteers").select("*", { count: "exact", head: true }),
        supabase.from("pesaflux_transactions").select("*", { count: "exact", head: true }),
        supabase.from("sms_logs").select("*", { count: "exact", head: true }),
        supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("volunteers").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      const donations = donationsRes.data;
      setStats({
        totalDonations: donations?.length || 0,
        totalAmount: donations?.filter(d => d.status === "completed").reduce((sum, d) => sum + Number(d.amount), 0) || 0,
        pendingDonations: donations?.filter(d => d.status === "pending").length || 0,
        completedDonations: donations?.filter(d => d.status === "completed").length || 0,
        failedDonations: donations?.filter(d => d.status === "failed").length || 0,
        totalVolunteers: volRes.count ?? 0,
        stkTransactions: stkRes.count ?? 0,
        smsSent: smsRes.count ?? 0,
        recentDonations: recentDonRes.data || [],
        recentVolunteers: recentVolRes.data || [],
      });
    };
    if (user && isAdmin) fetchStats();
  }, [user, isAdmin]);

  const handleSignOut = async () => { await signOut(); navigate("/admin/login"); };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(215,50%,12%)]">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "donations", label: "Donations", icon: DollarSign },
    { id: "verification", label: "Verify Payments", icon: ShieldCheck },
    { id: "transactions", label: "M-Pesa Txns", icon: Activity },
    { id: "volunteers", label: "Volunteers", icon: Users },
    { id: "sms", label: "SMS Manager", icon: MessageSquare },
    { id: "content", label: "Site Content", icon: LayoutDashboard },
    { id: "api-config", label: "API Config", icon: Key },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[hsl(215,30%,96%)] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[hsl(215,50%,12%)] text-white min-h-screen">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={maragaLogo} alt="Maraga '27" className="h-8" />
            <div>
              <p className="font-heading font-bold text-sm">Admin Panel</p>
              <p className="text-xs text-white/50">Maraga 2027</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-primary text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/40 mb-2 truncate">{user.email}</div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white">
            <LogOut className="w-4 h-4 mr-2" />Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar for mobile */}
        <header className="lg:hidden bg-[hsl(215,50%,12%)] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={maragaLogo} alt="Maraga '27" className="h-7" />
            <span className="font-heading font-bold text-sm">Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white hover:bg-white/10">
            <LogOut className="w-4 h-4" />
          </Button>
        </header>

        {/* Mobile tab bar */}
        <div className="lg:hidden overflow-x-auto bg-card border-b border-border">
          <div className="flex p-2 gap-1 min-w-max">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground text-sm">Campaign performance at a glance</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Raised</p>
                        <p className="text-2xl font-bold text-primary mt-1">KES {stats.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-campaign-gold">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Donations</p>
                        <p className="text-2xl font-bold mt-1">{stats.totalDonations}</p>
                        <p className="text-xs text-campaign-gold font-medium">{stats.pendingDonations} pending</p>
                      </div>
                      <div className="w-10 h-10 bg-campaign-gold/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-campaign-gold" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[hsl(210,100%,50%)]">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Volunteers</p>
                        <p className="text-2xl font-bold mt-1">{stats.totalVolunteers}</p>
                      </div>
                      <div className="w-10 h-10 bg-[hsl(210,100%,50%)]/10 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-[hsl(210,100%,50%)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-accent">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">SMS Sent</p>
                        <p className="text-2xl font-bold mt-1">{stats.smsSent}</p>
                      </div>
                      <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-accent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-5 pb-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-lg font-bold text-primary">{stats.completedDonations}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 pb-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-campaign-gold/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-campaign-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-lg font-bold text-campaign-gold">{stats.pendingDonations}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 pb-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-destructive/10 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Failed</p>
                      <p className="text-lg font-bold text-destructive">{stats.failedDonations}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recent Donations</CardTitle>
                    <CardDescription>Latest 5 donations received</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.recentDonations.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No donations yet</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentDonations.map((d: any) => (
                          <div key={d.id} className="flex items-center justify-between p-3 bg-muted/50 border border-border">
                            <div>
                              <p className="font-medium text-sm">{d.name || "Anonymous"}</p>
                              <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-primary">{d.currency} {Number(d.amount).toLocaleString()}</p>
                              <span className={`text-xs font-medium ${
                                d.status === "completed" ? "text-primary" : d.status === "failed" ? "text-destructive" : "text-campaign-gold"
                              }`}>{d.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="w-full mt-3" onClick={() => setActiveTab("donations")}>
                      View all donations <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recent Volunteers</CardTitle>
                    <CardDescription>Latest 5 volunteer sign-ups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.recentVolunteers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No volunteers yet</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentVolunteers.map((v: any) => (
                          <div key={v.id} className="flex items-center justify-between p-3 bg-muted/50 border border-border">
                            <div>
                              <p className="font-medium text-sm">{v.name}</p>
                              <p className="text-xs text-muted-foreground">{v.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">{v.county || "—"}</p>
                              <p className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="w-full mt-3" onClick={() => setActiveTab("volunteers")}>
                      View all volunteers <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Maintenance */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => setActiveTab("verification")}>
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span className="text-xs">Verify Payments</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => setActiveTab("sms")}>
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <span className="text-xs">Send SMS</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => setActiveTab("content")}>
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                        <span className="text-xs">Manage Goals</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => setActiveTab("api-config")}>
                        <Key className="w-5 h-5 text-primary" />
                        <span className="text-xs">API Config</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <AdminMaintenanceToggle />
              </div>
            </div>
          )}

          {activeTab === "donations" && <AdminDonations />}
          {activeTab === "verification" && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Verification</CardTitle>
                <CardDescription>Review and verify manual M-Pesa payments</CardDescription>
              </CardHeader>
              <CardContent><AdminDonationVerification /></CardContent>
            </Card>
          )}
          {activeTab === "transactions" && <AdminTransactions />}
          {activeTab === "volunteers" && <AdminVolunteers />}
          {activeTab === "sms" && <AdminSMS />}
          {activeTab === "content" && <AdminSiteContent />}
          {activeTab === "api-config" && <AdminPesaFluxConfig />}
          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage campaign settings and configurations</CardDescription>
              </CardHeader>
              <CardContent><AdminSettings settingsFilter="general" /></CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
