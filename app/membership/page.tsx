'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Zap, ShieldCheck, Trophy, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { selectPlan } from '@/app/actions/membership-actions';
import { toast } from 'sonner';
import { LoadingState } from '@/components/loading-state';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/types/database-type';
import CustomButton from "@/components/customButton";

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
    return <LoadingState message="Loading Plans..." />;
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
           <div className="inline-flex items-center justify-center p-2 rounded-full gradient-primary text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              Step 1 of 3
           </div>
           <h2 className="text-[38px] md:text-[40px]  text-ui-text-main mb-3 tracking-tight leading-[1.1]">
              Choose Your Plan <br className="sm:hidden" />
              {/* <span className="text-transparent bg-clip-text gradient-primary"></span> */}
            </h2>
            <p className="text-base sm:text-[17px] text-ui-text-muted leading-relaxed max-w-2xl mx-auto px-2 font-medium">
              Select a plan to unlock premium WordPress layouts and high-performance transitions compatible with our global delivery engine.
            </p>
        </div>

        <div className={cn(
          "grid gap-8  max-w-5xl mx-auto",
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
              <CardHeader className="pt-6 pb-10 text-center">
                <div className="mb-6 flex justify-center transform group-hover:scale-110 transition-transform duration-500">
                  {plan.plan_name.toLowerCase().includes('premium') ? <Trophy className="w-8 h-8 text-primary" /> : <Zap className="w-8 h-8 text-primary" />}
                </div>
                <CardTitle className="text-3xl font-semibold tracking-tighter uppercase mb-1">{plan.plan_name}</CardTitle>
                <CardDescription className="font-medium text-muted-foreground">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-center">
                <div className="text-5xl font-semibold tracking-tighter text-primary">
                  ${plan.price}
                  <span className="text-sm font-bold text-muted-foreground tracking-normal">
                    /{plan.validity_days} Days
                  </span>
                </div>
                <div className="h-px w-24 bg-border mx-auto"></div>
                <ul className="space-y-4 inline-block text-left mx-auto">
                  {Array.isArray(plan.features) && (plan.features as string[]).map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 md:pt-8 pt-4 mb-4">
          <div className="transition-all duration-300">
            <CustomButton
              text={planMutation.isPending ? "Processing..." : "Proceed to Payment"}
              iconColor="text-white"
              iconBgColor="gradient-primary group-hover:bg-gray-800"
              buttonBgColor="bg-ui-badge-bg"
              textColor="text-black"
              borderColor="border border-ui-border-shade"
              onClick={handleProceed}
              disabled={planMutation.isPending || selectedPlanId === null}
              loading={planMutation.isPending}
            />
          </div>
          {/* <div className="flex items-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Secure Checkout Powered by Stripe
          </div> */}
        </div>
      </div>
    </div>
  );
}
