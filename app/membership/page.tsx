'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Zap, ShieldCheck, Trophy, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { selectPlan } from '@/app/actions/membership-actions';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/types/database-type';

export default function MembershipPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const { data: plans, isLoading, isError } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      
      if (error) throw error;
      return data as Tables<'membership'>[];
    }
  });

  const planMutation = useMutation({
    mutationFn: (planId: number) => selectPlan(planId),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Plan selected successfully!');
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Selection failed');
    }
  });

  const handleProceed = async () => {
    const selectedPlan = plans?.find(p => p.id === selectedPlanId);
    if (!selectedPlan) {
      toast.error('Please select a plan first');
      return;
    }
    planMutation.mutate(selectedPlan.id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <p className="mt-4 text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Plans...</p>
      </div>
    );
  }

  if (isError || !plans || plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">No Membership Available</h2>
        <p className="text-muted-foreground max-w-md font-medium">We couldn't find any active membership plans at the moment. Please check back later or contact support.</p>
        <Button variant="outline" className="mt-8 rounded-full px-8 font-black uppercase tracking-widest" onClick={() => router.refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className=" bg-background mt-15 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Membership Selection
           </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">Select a plan to unlock premium WordPress layouts and high-performance transitions compatible with our global delivery engine.</p>
        </div>

        <div className={cn(
          "grid gap-8 mb-16 max-w-5xl mx-auto",
          plans.length === 1 ? "md:grid-cols-1 max-w-md" : 
          plans.length === 2 ? "md:grid-cols-2 max-w-4xl" : 
          "md:grid-cols-3"
        )}>
          {plans.map((plan, i) => (
            <Card 
              key={plan.id}
              className={cn(
                'relative border-4 transition-all duration-500 cursor-pointer overflow-hidden transform group',
                selectedPlanId === plan.id 
                  ? 'border-primary shadow-2xl bg-primary/5 -translate-y-2' 
                  : 'border-border/50 hover:border-primary/30 hover:-translate-y-1'
              )}
              onClick={() => setSelectedPlanId(plan.id)}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {selectedPlanId === plan.id && (
                <div className="absolute top-6 right-6 text-primary animate-in zoom-in-50 duration-300">
                  <CheckCircle2 className="w-8 h-8 fill-primary/10" />
                </div>
              )}
              <CardHeader className="pt-10 pb-6 text-center">
                <div className="mb-6 flex justify-center transform group-hover:scale-110 transition-transform duration-500">
                  {plan.plan_name.toLowerCase().includes('premium') ? <Trophy className="w-8 h-8 text-primary" /> : <Zap className="w-8 h-8 text-primary" />}
                </div>
                <CardTitle className="text-3xl font-black tracking-tighter uppercase mb-1">{plan.plan_name}</CardTitle>
                <CardDescription className="font-medium text-muted-foreground">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 text-center pb-12">
                <div className="text-6xl font-black tracking-tighter text-primary">
                  ${plan.price}
                  <span className="text-sm font-bold text-muted-foreground tracking-normal">
                    /{plan.validity_days === 365 ? 'yr' : 'mo'}
                  </span>
                </div>
                <div className="h-px w-12 bg-border mx-auto"></div>
                <ul className="space-y-4 inline-block text-left mx-auto">
                  {Array.isArray(plan.features) && (plan.features as string[]).map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold uppercase tracking-tight text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 pt-4 mb-10 border-t-2">
          <Button 
            size="lg" 
            className={cn(
                "rounded-full px-16 h-16 text-lg font-black uppercase tracking-widest transition-all shadow-2xl",
                selectedPlanId ? "opacity-100 translate-y-0" : "opacity-30 translate-y-4 pointer-events-none"
            )}
            onClick={handleProceed}
            disabled={planMutation.isPending}
          >
            {planMutation.isPending ? (
                 <>Processing... <Loader2 className="ml-2 h-5 w-5 animate-spin" /></>
            ) : "Proceed to Payment"}
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Secure Checkout Powered by Stripe
          </div>
        </div>
      </div>
    </div>
  );
}
