import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PaymentForm from '@/components/payment-form';

export default async function PaymentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single() as any;

  // Fetch the latest pending payment for this user
  const { data: latestPayment } = profile ? await supabase
    .from('payments')
    .select('plan_name, price, validity_days')
    .eq('user_id', profile.id)
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as any : { data: null };

  const { data: userMembership } = profile ? await supabase
    .from('user_membership')
    .select('plan_name, price, validity_days, status')
    .eq('user_id', profile.id)
    .eq('status', 'active')
    .maybeSingle() as any : { data: null };

  // Gracefully fallback to secure Next.js cookies if RLS blocks DB retrieval
  const cookieStore = await cookies();
  const fallbackMembership = cookieStore.get('s22_membership')?.value === 'true';
  const fallbackPlan = cookieStore.get('s22_plan')?.value;

  const hasMembership = (userMembership?.status === 'active') || user.user_metadata?.membership_selected || fallbackMembership || !!latestPayment;
  const selectedPlan = latestPayment?.plan_name ?? userMembership?.plan_name ?? user.user_metadata?.plan ?? fallbackPlan ?? 'Basic';
  const priceParsed = latestPayment?.price ?? userMembership?.price ?? 0;
  const price = typeof priceParsed === 'string' ? parseFloat(priceParsed) : priceParsed;
  
  const validityDays = latestPayment?.validity_days ?? userMembership?.validity_days ?? 365;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + validityDays);
  const formattedExpiry = expiryDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  // Check if user already has a domain URL (from previous licenses)
  const { data: existingLicense } = profile ? await supabase
    .from('licenses')
    .select('domain_url')
    .eq('user_id', profile.id)
    .not('domain_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as any : { data: null };

  const existingDomainUrl = existingLicense?.domain_url;

  if (!hasMembership || !selectedPlan) {
    redirect('/upgrade-membership');
  }

  return (
    <div className=" bg-background mt-15 px-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-7">
           <div className="inline-flex items-center justify-center p-2 rounded-full gradient-primary text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              Step 2 of 3
           </div>
           <h2 className="text-[38px] md:text-[40px]  text-ui-text-main mb-3 tracking-tight leading-[1.1]">
              Secure Payment <br className="sm:hidden" />
              {/* <span className="text-transparent bg-clip-text gradient-primary"></span> */}
            </h2>
            <p className="text-base sm:text-[17px] text-ui-text-muted leading-relaxed max-w-2xl mx-auto px-2 font-medium">
             Complete your payment to activate your layout license.
            </p>
        </div>

        <div className="bg-card border-2 border-primary/10 rounded-2xl p-6 shadow-xl mb-8]">
          <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-border/50">
            <div>
              <p className="font-semibold text-2xl uppercase tracking-tighter text-primary">{selectedPlan} Plan</p>
              <p className="text-sm font-medium ">Valid Until {formattedExpiry}</p>
            </div>
            <div className="text-4xl font-semibold text-primary tracking-tighter">${price}</div>
          </div>
          
          <PaymentForm plan={selectedPlan} price={price} existingDomainUrl={existingDomainUrl} />
        </div>

        {/* <div className="text-center space-y-4"> */}
          {/* <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            <span>Verified Secure</span>
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span>256-bit SSL</span>
          </div> */}
          
        {/* </div> */}
      </div>
    </div>
  );
}
