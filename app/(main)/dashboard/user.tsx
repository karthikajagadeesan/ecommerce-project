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
  Check,
  LayoutDashboardIcon
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
    .eq('user_id', profile.id)
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
  
  const finalPlan = membership?.plan_name || user.user_metadata?.plan || (mockPlan as string) || 'basic';
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
      {/* <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em]">
        {finalPlan} PLAN
      </Badge> */}
      <Button asChild variant="outline" size="sm" className="rounded-full px-5 h-9 font-bold border-2 shadow-sm">
        <Link href="/upgrade-membership"><ArrowUpRight className="mr-2 h-4 w-4" /> Upgrade Plan</Link>
      </Button>
      {/* <Button size="sm" className="rounded-full px-5 h-9 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
        <Settings className="mr-2 h-4 w-4" /> Manage Account
      </Button> */}
    </div>
  );

  return (
    <div className="flex flex-col gap-3  mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header
        icon={<LayoutDashboardIcon className="h-5 w-5 text-current" />}
        heading={`Welcome, ${(user.user_metadata?.full_name?.split(' ')[0] as string) || (profile?.name?.split(' ')[0] as string) || 'User'}!`}
        description="Manage your membership, licenses, and API access."
        breadcrumbs={breadcrumbs}
        specialButtons={headerButtons}
        className=""
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-1 hover:border-primary/30 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
               {stat.icon}
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium ">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold  mb-1">{stat.value}</div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 opacity-70">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:mt-6 mt-3 ">
        {/* Membership Details */}
        <Card className="lg:col-span-1 border-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Your Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Subscription</p>
              <p className="text-xl font-bold uppercase text-primary leading-none tracking-tighter">{finalPlan} Plan</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Validity</p>
              <p className="text-2xl font-black leading-none tracking-tighter">{daysLeft} <span className="text-sm font-bold text-muted-foreground tracking-normal uppercase">Days</span></p>
              <p className="text-sm uppercase font-bold text-muted-foreground/80 leading-none">Expires: {expiryDate.toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Active Domain</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate" title={license?.domain_url || 'Not Registered'}>
                  {license?.domain_url || (hasMockLicense ? 'Localhost (Mock)' : 'Not Registered')}
                </p>
                {license?.domain_url && (
                  <Link 
                    href={license.domain_url.startsWith('http') ? license.domain_url : `https://${license.domain_url}`} 
                    target="_blank"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
            <div className="pt-6 border-t-2">
               <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight mb-4 tracking-widest">Your license key is active and ready to deliver layouts.</p>
               <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary/80 animate-pulse" style={{ width: '85%' }}></div>
               </div>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}
