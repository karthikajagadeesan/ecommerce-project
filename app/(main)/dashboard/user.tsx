import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { 
  BarChart3, 
  Clock, 
  ExternalLink, 
  Layers, 
  Layout, 
  Settings, 
  TrendingUp, 
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Package,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tables } from '@/types/database-type';
import Header from '@/components/header';
import { Home } from 'lucide-react';

export default async function UserDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch profile using auth_user_id (UUID)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('auth_user_id', user.id)
    .single() as any;

  // Check user_membership table
  const { data: membership } = profile ? await supabase
    .from('user_membership')
    .select('*')
    .eq('profile_id', profile.id)
    .single() as any : { data: null };

  const { data: license } = profile ? await supabase
    .from('licenses')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() as any : { data: null };

  const { count: apiCalls } = profile ? await supabase
    .from('api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('endpoint', '/api/validate-license') as any : { count: 0 as number | null };

  const { count: dataFetches } = profile ? await supabase
    .from('api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('endpoint', '/api/layout-data') as any : { count: 0 as number | null };

  // Load cookies as fallback if DB isn't writing due to RLS
  const cookieStore = await cookies();
  const mockPlan = cookieStore.get('s22_mock_plan')?.value || cookieStore.get('s22_plan')?.value;
  
  const finalPlan = membership?.premium_template ? 'pro' : (membership?.basic_template ? 'basic' : (user.user_metadata?.plan || (mockPlan as string) || 'basic'));
  const hasMockLicense = cookieStore.get('s22_mock_license');

  const stats = [
    {
      title: 'Total API Calls',
      value: apiCalls || 0,
      icon: <Zap className="h-5 w-5 text-primary" />,
      description: 'Validation requests'
    },
    {
      title: 'Data Fetches',
      value: dataFetches || 0,
      icon: <Layers className="h-5 w-5 text-primary" />,
      description: 'Layout deliveries'
    },
    {
      title: 'Active Domains',
      value: (license?.domain_url || hasMockLicense) ? 1 : 0,
      icon: <ExternalLink className="h-5 w-5 text-primary" />,
      description: 'Registered sites'
    }
  ];

  // Calculate days remaining
  const now = new Date();
  const createdAt = license?.created_at ? new Date(license.created_at) : now;
  const expiryDate = new Date(createdAt);
  expiryDate.setDate(expiryDate.getDate() + (license?.validity_period || 365));
  const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));

  const breadcrumbs = [
    { label: 'Dashboard' }
  ];

  const headerButtons = (
    <div className="flex items-center gap-3">
      <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em]">
        {finalPlan} PLAN
      </Badge>
      <Button asChild variant="outline" size="sm" className="rounded-full px-5 h-9 font-bold border-2 shadow-sm">
        <Link href="/membership"><ArrowUpRight className="mr-2 h-4 w-4" /> Upgrade Plan</Link>
      </Button>
      <Button size="sm" className="rounded-full px-5 h-9 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
        <Settings className="mr-2 h-4 w-4" /> Manage Account
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-8 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header
        heading={`Welcome, ${(user.user_metadata?.full_name?.split(' ')[0] as string) || (profile?.name?.split(' ')[0] as string) || 'User'}!`}
        description="Manage your membership, licenses, and API access."
        breadcrumbs={breadcrumbs}
        specialButtons={headerButtons}
        className="mb-2"
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-2 hover:border-primary/30 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
               {stat.icon}
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tight mb-1">{stat.value}</div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 opacity-70">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Membership Details */}
        <Card className="lg:col-span-1 border-2 bg-muted/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Your Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-10">
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Subscription</p>
              <p className="text-3xl font-black uppercase text-primary leading-none tracking-tighter">{finalPlan}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Validity</p>
              <p className="text-3xl font-black leading-none tracking-tighter">{daysLeft} <span className="text-sm font-bold text-muted-foreground tracking-normal uppercase">Days</span></p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground/80 leading-none">Expires: {expiryDate.toLocaleDateString()}</p>
            </div>
            <div className="pt-6 border-t-2">
               <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight mb-4 tracking-widest">Your license key is active and ready to deliver layouts.</p>
               <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary/80 animate-pulse" style={{ width: '85%' }}></div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout Management */}
        <Card className="lg:col-span-3 border-2 overflow-hidden flex flex-col shadow-xl">
          <CardHeader className="bg-muted/10 border-b-2 flex flex-row items-center justify-between p-6">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                Layout Access Matrix
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider opacity-70">Privileges determined by your {finalPlan} membership.</p>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x-2 divide-y-2 md:divide-y-0 h-full">
            {[1, 2, 3, 4].map((num) => {
              const isAvailable = (finalPlan === 'basic' && num === 1) || 
                               (finalPlan === 'pro' && num <= 3) || 
                               (finalPlan === 'enterprise');
              
              return (
                <div key={num} className={cn(
                  "p-8 flex flex-col items-center justify-center text-center gap-6 group transition-all duration-500 h-[300px]",
                  isAvailable ? "hover:bg-primary/5 cursor-pointer" : "opacity-40 grayscale pointer-events-none bg-muted/30"
                )}>
                  <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 relative border-2 border-transparent",
                    isAvailable ? "bg-card text-foreground group-hover:scale-110 shadow-xl border-primary/20" : "bg-muted text-muted-foreground"
                  )}>
                    <Package className={cn("w-10 h-10", isAvailable ? "text-primary" : "")} />
                    {isAvailable && (
                      <div className="absolute -top-3 -right-3 bg-green-500 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black tracking-tighter mb-1 uppercase">Layout {num}</h4>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest opacity-80">
                      {isAvailable ? "Active Payload" : "Locked Tier"}
                    </p>
                  </div>
                  
                  {isAvailable ? (
                    <Button variant="ghost" size="sm" className="rounded-full text-[10px] font-black uppercase tracking-widest h-10 px-6 border-2 group-hover:bg-primary group-hover:text-primary-foreground">
                      Deploy Data
                    </Button>
                  ) : (
                    <Link href="/membership" className="text-[10px] font-black uppercase text-primary border-b border-primary hover:border-b-2 tracking-widest">
                       Upgrade
                    </Link>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 border-2 border-primary/10 rounded-3xl bg-primary/5 shadow-inner">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 shrink-0">
             <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h5 className="font-black text-xl uppercase tracking-tighter">Dedicated Layout Guidance</h5>
            <p className="text-sm text-foreground/70 font-medium">Our integration specialists are standing by exclusively for {finalPlan} users.</p>
          </div>
        </div>
        <Button className="rounded-full px-10 h-14 font-black uppercase tracking-widest shadow-xl shrink-0 transition-transform active:scale-95">Connect Now</Button>
      </div>
    </div>
  );
}
