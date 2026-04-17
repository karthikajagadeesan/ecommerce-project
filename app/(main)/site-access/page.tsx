'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Globe, 
  ShieldCheck, 
  Trash2, 
  ExternalLink, 
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  History,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
  Check,
  Layout
} from 'lucide-react';
import Header from '@/components/header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getWebsiteAccess, addWebsiteAccess, getPlanLayoutCounts } from '@/app/actions/site-access-actions';
import { getMembershipPlans, getCurrentUserMembership, getUserMembershipHistory } from '@/app/actions/membership-actions';
import { getUserLicenses } from '@/app/actions/license-actions';
import { LoadingState } from '@/components/loading-state';
import { cn } from '@/lib/utils';
import CustomButton from '@/components/customButton';
import Link from 'next/link';
import { Sheet } from '@/components/ui/sheet';

export default function SiteAccessPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [domainUrl, setDomainUrl] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [isSiteDetailOpen, setIsSiteDetailOpen] = useState(false);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: sitesData, isLoading: isLoadingSites } = useQuery({
    queryKey: ['website-access'],
    queryFn: async () => {
      const res = await getWebsiteAccess();
      if (res.error) throw new Error(res.error);
      return res.data;
    }
  });

  const { data: currentMembership, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['user-membership'],
    queryFn: async () => {
      const res = await getCurrentUserMembership();
      if (res.error && res.error !== 'Profile not found' && res.error !== 'Not authenticated') {
        throw new Error(res.error);
      }
      return res.data;
    }
  });

  const { data: membershipHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['membership-history'],
    queryFn: async () => {
      const res = await getUserMembershipHistory();
      if (res.error && res.error !== 'Profile not found' && res.error !== 'Not authenticated') {
        throw new Error(res.error);
      }
      return res;
    }
  });

  const { data: licensesData, isLoading: isLoadingLicenses } = useQuery({
    queryKey: ['user-licenses'],
    queryFn: async () => {
      const res = await getUserLicenses();
      if (res.error) throw new Error(res.error);
      return res.data;
    }
  });

  const { data: plansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: async () => {
      const res = await getMembershipPlans();
      if (res.error) throw new Error(res.error);
      return res.data;
    }
  });

  const { data: layoutCounts } = useQuery({
    queryKey: ['plan-layout-counts'],
    queryFn: async () => {
      const res = await getPlanLayoutCounts();
      if (res.error) throw new Error(res.error);
      return res.data;
    }
  });

  const toggleKeyVisibility = (id: number) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const handleCopy = (id: number, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    toast.success('License key copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addMutation = useMutation({
    mutationFn: (data: { planName: string, domainUrl: string, siteName: string }) => 
      addWebsiteAccess(data.planName, data.domainUrl, data.siteName),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Site access added successfully!');
      setIsFormOpen(false);
      setDomainUrl('');
      setSiteName('');
      queryClient.invalidateQueries({ queryKey: ['website-access'] });
      queryClient.invalidateQueries({ queryKey: ['user-licenses'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add site access');
    }
  });

  const handleAddSite = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentMembership?.plan_name) {
      toast.error('You need an active membership to add sites');
      return;
    }
    if (!siteName || !domainUrl) {
      toast.error('Please fill all fields');
      return;
    }
    addMutation.mutate({ planName: currentMembership.plan_name, domainUrl, siteName });
  };

  const isLoading = isLoadingSites || isLoadingPlans || isLoadingCurrent || isLoadingHistory || isLoadingLicenses;
  const sites = sitesData || [];
  const plans = plansData || [];
  const licenses = licensesData || [];

  // Group sites by plan
  const groupedSites = sites.reduce((acc, site) => {
    if (!acc[site.plan_name]) acc[site.plan_name] = [];
    acc[site.plan_name].push(site);
    return acc;
  }, {} as Record<string, typeof sites>);

  const activePlanLimit = plans.find(p => p.plan_name === currentMembership?.plan_name)?.site_access || 1;
  const currentPlanSites = sites.filter(s => s.plan_name === currentMembership?.plan_name);
  const isLimitReached = currentPlanSites.length >= activePlanLimit;

  if (isLoading) return <LoadingState message="Loading Site Access Details..." />;

  const breadcrumbs = [{ label: 'Site Access' }];

  const headerButtons = (
    <Button 
      onClick={() => setIsFormOpen(true)} 
      disabled={isLimitReached}
      className={cn("rounded-xl px-5 flex items-center gap-2 font-medium text-[15px] transition-transform h-11", isLimitReached && "opacity-50 cursor-not-allowed")}
    >
      <Plus className="h-5 w-5" /> Add Sites
    </Button>
  );

  return (
    <div className="flex flex-col gap-6 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      <Header
        icon={<ShieldCheck className="h-5 w-5 text-current" />}
        heading="Site Access"
        description="Manage domains and site access according to your membership plan."
        breadcrumbs={breadcrumbs}
        specialButtons={headerButtons}
      />

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        <Card className="bg-card border-border shadow-sm rounded-2xl p-5 flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[20px] font-bold text-foreground leading-none mb-1">{sites.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Sites</p>
          </div>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-xl p-5 flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[18px] font-bold text-foreground leading-none mb-1">{currentMembership?.plan_name || 'No Plan'}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Plan</p>
          </div>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-xl p-5 flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform">
            <Loader2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[20px] font-bold text-foreground leading-none mb-1">{activePlanLimit - currentPlanSites.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Slots Available</p>
          </div>
        </Card>

        {/* <button 
          onClick={() => setIsHistorySheetOpen(true)}
          className="w-full text-left outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl"
        > */}
          <Card className="bg-card  shadow-sm rounded-xl p-5 flex items-center gap-4 group hover:shadow-md transition-all relative ">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center justify-between gap-1 mb-1">
                <p className="text-[14px] font-bold text-foreground leading-none truncate px-0.5">
                  {(() => {
                    const historyArr = membershipHistory?.data || [];
                    const transitions: string[] = [];
                    historyArr.forEach((entry: any) => {
                      if (entry.plan_name && transitions[transitions.length - 1] !== entry.plan_name) {
                        transitions.push(entry.plan_name);
                      }
                    });
                    return transitions.length > 0 ? `${transitions.length} Upgrades` : 'No Upgrades';
                  })()}
                </p>
                {/* <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" /> */}
              </div>
              
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan History</p>
            </div>
          </Card>
        {/* </button> */}
      </div>

      {/* Centered Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border border-border relative bg-card shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 h-8 w-8 rounded-md text-muted-foreground hover:bg-accent"
              onClick={() => setIsFormOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <CardHeader className="pt-5 px-6 pb-4 border-b border-border/50">
              <CardTitle className="text-[20px] font-medium text-foreground">Add Site Access</CardTitle>
              <CardDescription className="text-[13px] text-muted-foreground -mt-1">
                Enter your site details to register it with your {currentMembership?.plan_name || 'current'} plan.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 py-6 space-y-5">
              <form onSubmit={handleAddSite} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold text-foreground">Site Name</Label>
                  <Input 
                    placeholder="My Portfolio Site" 
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="h-10 border-input bg-background font-medium text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold text-foreground">Website URL</Label>
                  <Input 
                    placeholder="https://example.com" 
                    value={domainUrl}
                    onChange={(e) => setDomainUrl(e.target.value)}
                    className="h-10 border-input bg-background font-medium text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
{/* 
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Plan Progress</span>
                    <span className="text-xs font-bold text-foreground">
                      {currentPlanSites.length} / {activePlanLimit} Sites Used
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                         "h-full bg-primary transition-all duration-500",
                         isLimitReached && "bg-destructive"
                      )} 
                      style={{ width: `${(currentPlanSites.length / activePlanLimit) * 100}%` }}
                    ></div>
                  </div>
                </div> */}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-xl px-4 h-10 font-medium text-sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={addMutation.isPending || isLimitReached || !siteName || !domainUrl}
                    className="rounded-xl px-4 h-10 font-medium text-sm shadow-sm transition-all"
                  >
                    {addMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Register Site
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grouped Cards Section */}
      <div className="px-2 space-y-12">
        {Object.keys(groupedSites).length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center border-2 border-dashed border-border rounded-3xl bg-card p-10">
            <Globe className="w-10 h-10 mb-4 text-primary/20" />
            <h3 className="text-2xl font-medium text-foreground">No sites registered</h3>
            <CardDescription className="text-sm font-medium mt-2">
              Add your first website to start delivering layouts and managing access.
            </CardDescription>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => {
              const planData = plans.find(p => p.plan_name === site.plan_name);
              const limit = planData?.site_access || 1;
              const planSites = groupedSites[site.plan_name] || [];
              const usageText = `${planSites.length} / ${limit} Sites`;
              const siteUrl = site.domain_url.startsWith('http') ? site.domain_url : `https://${site.domain_url}`;

              return (
                <button 
                  key={site.id} 
                  onClick={() => {
                    setSelectedSite(site);
                    setIsSiteDetailOpen(true);
                  }}
                  className="group relative flex cursor-pointer flex-col p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all text-left outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {/* Status Badge Top Right */}
                  <div className="absolute top-5 right-5">
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border",
                      site.status === 'active' 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                        : "bg-muted text-muted-foreground border-border"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        site.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
                      )} />
                      <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
                        {site.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Icon and Title */}
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-[18px] font-bold text-foreground tracking-tight leading-tight truncate">
                      {site.site_name || 'Untitled Site'}
                    </h3>
                     <div 
                      className="h-6 w-6 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Domain URL with Navigation Icon */}
                  <div className="flex items-center justify-between mb-6 p-2 rounded-lg bg-muted/30 border border-border group/link">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-[13px] font-medium text-muted-foreground truncate lowercase">
                        {site.domain_url}
                      </span>
                    </div>
                  </div>

                  {/* Metric Boxes - Side by Side (Slightly smaller) */}
                  {/* <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                      <p className="text-[9px] font-black text-muted-foreground mb-1 leading-none">PLAN</p>
                      <p className="text-[12px] font-bold text-foreground leading-none truncate">{site.plan_name}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 leading-none">USAGE</p>
                      <p className="text-[12px] font-bold text-foreground leading-none">{usageText}</p>
                    </div>
                  </div> */}

                  {/* Date Bar */}
                  {/* <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 flex justify-between items-center">
                    <span className="text-[12px] font-bold text-primary/70">Registered</span>
                    <span className="text-[12px] font-bold text-primary/70 tracking-tight">
                      {new Date(site.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div> */}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sheet B: Site Detail (License + History) */}
      <Sheet 
        isOpen={isSiteDetailOpen} 
        onClose={() => setIsSiteDetailOpen(false)}
        title={selectedSite?.site_name || 'Site Details'}
        description="Manage license activation and view plan history for this specific domain."
         contentClassName="flex flex-col h-full overflow-hidden pt-5"
      >
        {selectedSite && (() => {
          const lic = licenses.find(l => l.domain_url === selectedSite.domain_url);
          const siteUrl = selectedSite.domain_url.startsWith('http') ? selectedSite.domain_url : `https://${selectedSite.domain_url}`;
          const isVisible = lic ? visibleKeys.has(lic.id) : false;

          // Calculate usage for this plan
          const planData = plans.find(p => p.plan_name === selectedSite.plan_name);
          const limit = planData?.site_access || 1;
          const planSites = groupedSites[selectedSite.plan_name] || [];
          const usageText = `${planSites.length} / ${limit} Sites`;
          const availableLayouts = layoutCounts?.[selectedSite.plan_name] || 0;

          return (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-none space-y-5 mb-6">
                {/* Site Info Card */}
                 <div key={lic?.id || selectedSite.id} className="p-4 rounded-xl bg-muted/30 border border-border flex flex-col gap-3 group/lic hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-primary shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-foreground truncate">{selectedSite.domain_url}</span>
                      </div>
                      <Link 
                        href={siteUrl}
                        target="_blank"
                        className="h-8 px-3 rounded-lg bg-background border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm gap-1.5"
                      >
                        <ExternalLink className="w-3 h-3" /> Preview
                      </Link>
                    </div>

                    {/* New Site Metrics Section */}
                    <div className="grid grid-cols-2 gap-2 py-2 border-y border-border/50">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Plan</p>
                        <p className="text-[12px] font-bold text-foreground truncate">{selectedSite.plan_name}</p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Layouts Available</p>
                        <div className="flex items-center gap-1.5">
                          <Layout className="w-3 h-3 text-primary" />
                          <p className="text-[12px] font-bold text-foreground">{availableLayouts} Layouts</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Usage</p>
                        <p className="text-[12px] font-bold text-foreground">{usageText}</p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Registered</p>
                        <p className="text-[12px] font-bold text-foreground">
                          {new Date(selectedSite.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">License Key</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-10 rounded-xl bg-background border border-border flex items-center px-4 overflow-hidden relative group/key">
                          <code className={cn(
                            "text-[13px] font-medium tracking-tight",
                            !isVisible && " select-none"
                          )}>
                            {isVisible ? lic?.license_key : '•••• •••• •••• ••••'}
                          </code>
                        </div>
                        <button 
                          onClick={() => lic && toggleKeyVisibility(lic.id)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
                          title={isVisible ? "Hide Key" : "Show Key"}
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => lic && handleCopy(lic.id, lic.license_key)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
                          title="Copy Key"
                        >
                          {lic && copiedId === lic.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
              </div>

              {/* Plan History Section - Scrollable part */}
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30">
                <div className="space-y-4 ">
                  <div className="flex items-center gap-2 sticky top-0 bg-card z-20 py-1">
                    <History className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Plan History</h3>
                  </div>
                  
                  <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {(() => {
                        const historyArr = membershipHistory?.data || [];
                        const transitions: any[] = [];
                        historyArr.forEach((entry: any) => {
                          if (entry.plan_name && (transitions.length === 0 || transitions[transitions.length - 1].plan_name !== entry.plan_name)) {
                            transitions.push(entry);
                          }
                        });

                        if (transitions.length === 0) {
                          return <p className="text-xs text-muted-foreground italic">No history available for this site.</p>;
                        }

                        return transitions.map((t, idx) => {
                          const isCurrent = idx === transitions.length - 1;
                          return (
                            <div key={idx} className="relative">
                              <div className={cn(
                                "absolute -left-[21px] top-1.5 w-4 h-4 rounded-full border-4 border-background z-10",
                                isCurrent ? "bg-primary" : "bg-muted-foreground/30"
                              )} />
                              <div className="flex flex-col gap-1">
                                <p className={cn(
                                  "text-[13px] font-bold tracking-tight",
                                  isCurrent ? "text-primary" : "text-foreground/70"
                                )}>
                                  {t.plan_name} Plan
                                </p>
                                <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                                  <span>{new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <span>•</span>
                                  <span className="capitalize">{t.status || 'Active'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mt-4">
                <p className="text-[11px] leading-relaxed text-blue-500/70 font-medium">
                  <strong>Activation Note:</strong> Copy the license key above and paste it into the S22 Plugin settings section on your WordPress dashboard to authorize this domain.
                </p>
              </div>
            </div>
          );
        })()}
      </Sheet>
    </div>
  );
}
