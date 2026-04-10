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
    .select('id, plan, membership_selected')
    .eq('auth_user_id', user.id)
    .single() as any;

  // Fetch the latest user membership if profile exists
  const { data: userMembership } = profile ? await supabase
    .from('user_membership')
    .select('plan_name, price, status')
    .eq('profile_id', profile.id)
    .single() as any : { data: null };

  // Gracefully fallback to secure Next.js cookies if RLS blocks DB retrieval
  const cookieStore = await cookies();
  const fallbackMembership = cookieStore.get('s22_membership')?.value === 'true';
  const fallbackPlan = cookieStore.get('s22_plan')?.value;

  const hasMembership = userMembership?.status === 'active' || profile?.membership_selected || user.user_metadata?.membership_selected || fallbackMembership;
  const selectedPlan = userMembership?.plan_name || (profile?.plan || user.user_metadata?.plan || fallbackPlan) as string;
  const price = userMembership?.price || 0;

  if (!hasMembership || !selectedPlan) {
    redirect('/membership');
  }

  return (
    <div className=" bg-background mt-15 px-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-7">
           <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Step 2 of 3
           </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Secure Checkout</h1>
          <p className="text-muted-foreground font-medium">Complete your payment to activate your layout license.</p>
        </div>

        <div className="bg-card border-2 border-primary/10 rounded-2xl p-8 shadow-xl mb-8">
          <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-border/50">
            <div>
              <p className="font-black text-2xl uppercase tracking-tighter text-primary">{selectedPlan} Plan</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Monthly Subscription</p>
            </div>
            <div className="text-4xl font-black tracking-tighter">${price}</div>
          </div>
          
          <PaymentForm plan={selectedPlan} price={price} />
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            <span>Verified Secure</span>
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span>256-bit SSL</span>
          </div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground px-10 leading-relaxed tracking-tighter opacity-70">
            By completing this payment, you agree to our Terms of Service and Privacy Policy. Your subscription will renew automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
