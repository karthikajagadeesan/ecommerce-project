'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Zap, ShieldCheck, Trophy, Loader2, AlertCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { selectPlan, getMembershipPlans, getCurrentUserMembership } from '@/app/actions/membership-actions';
import { toast } from 'sonner';
import { LoadingState } from '@/components/loading-state';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { Tables } from '@/types/database-type';
import { BadgeCheck } from 'lucide-react';
import CustomButton from '@/components/customButton';

export default function UpgradeMembershipPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const router = useRouter();

  const { data: plansData, isLoading: isLoadingPlans, isError: isErrorPlans } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: async () => {
      const result = await getMembershipPlans();
      if (result.error) throw new Error(result.error);
      return result.data;
    }
  });

  const { data: currentMembershipData, isLoading: isLoadingCurrent, isError: isErrorCurrent } = useQuery({
    queryKey: ['user-membership'],
    queryFn: async () => {
      const result = await getCurrentUserMembership();
      if (result.error && result.error !== 'Profile not found' && result.error !== 'Not authenticated') {
        throw new Error(result.error);
      }
      return result.data;
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
    if (!selectedPlanId) {
      toast.error('Please select a plan first');
      return;
    }
    
    // Don't allow selecting the current plan again
    if (selectedPlanId === currentMembershipData?.membership_id) {
       toast.info("You're already on this plan.");
       return;
    }

    planMutation.mutate(selectedPlanId);
  };

  const isLoading = isLoadingPlans || isLoadingCurrent;
  const plans = plansData || [];
  const currentMembership = currentMembershipData;

  if (isLoading) {
    return <LoadingState message="Loading Membership Details..." />;
  }

  if (isErrorPlans || plans.length === 0) {
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

  const breadcrumbs = [{ label: 'Membership' }];

  return (
    <div className="flex flex-col gap-3 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header
        icon={<BadgeCheck className="h-5 w-5 text-current" />}
        heading="Membership Plans"
        description="Choose the best plan for your needs. Upgrade to unlock advanced features and premium layouts."
        breadcrumbs={breadcrumbs}
      />
      
      <div className="bg-background px-2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">

           <div className="inline-flex items-center justify-center p-2 rounded-full gradient-primary text-white text-[6px] sm:text-[8px] font-black uppercase tracking-[0.2em] mb-2">
              Subscription Plans
           </div>
          <h1 className="text-[30px] md:text-[35px]  text-ui-text-main mb-3 tracking-tight leading-[1.1]">
            Evolution of Membership 
            {/* <span className="gradient-primary"></span> */}
          </h1>
          <p className="text-[12px] sm:text-[15px] text-ui-text-muted leading-relaxed max-w-2xl mx-auto px-2 font-medium">
            Architect your digital presence with premium layouts and high-performance transitions. Join the elite.
          </p>
        </div>

        <div className={cn(
          "grid gap-8 ",
          plans.length === 1 ? "max-w-md mx-auto" : 
          plans.length === 2 ? "max-w-4xl mx-auto md:grid-cols-2" : 
          "grid-cols-1 md:grid-cols-3"
        )}>
          {plans.map((plan, i) => {
            const isCurrentPlan = currentMembership?.membership_id === plan.id;
            const isSelected = selectedPlanId === plan.id || (!selectedPlanId && isCurrentPlan);
            
            return (
              <Card 
                key={plan.id}
                className={cn(
                  'relative border-2 transition-all duration-500 cursor-pointer overflow-hidden transform group flex flex-col',
                  isSelected 
                    ? 'border-primary shadow-2xl bg-primary/5 -translate-y-2' 
                    : 'border-border/40 hover:border-primary/30 hover:-translate-y-1'
                )}
                onClick={() => setSelectedPlanId(plan.id)}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest py-1.5 text-center">
                    Current Plan
                  </div>
                )}
                
                {isSelected && !isCurrentPlan && (
                  <div className="absolute top-6 right-6 text-primary animate-in zoom-in-50 duration-300">
                    <CheckCircle2 className="w-8 h-8 fill-primary/10" />
                  </div>
                )}

                <CardHeader className={cn("pt-6 pb-2 text-center", isCurrentPlan && "pt-12")}>
                  <div className="mb-4 flex justify-center ">
                    {plan.plan_name.toLowerCase().includes('premium') || plan.plan_name.toLowerCase().includes('gold') ? 
                      <Trophy className="w-8 h-8 text-primary" /> : 
                      <Zap className="w-8 h-8 text-primary" />
                    }
                  </div>
<CardTitle className="text-3xl font-semibold tracking-tighter uppercase mb-1">{plan.plan_name}</CardTitle>
                <CardDescription className="font-medium text-muted-foreground">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 text-center flex-1">
                 <div className="text-5xl font-semibold tracking-tighter text-primary">
                  ${plan.price}
                  <span className="text-sm font-bold text-muted-foreground tracking-normal">
                    /{plan.validity_days} Days
                  </span>
                </div>
                  
                  {/* <div className="h-px w-35 mb-6 bg-border mx-auto"></div> */}
                  <div className=" mb-6 "></div>
                  <ul className="space-y-4 inline-block text-left px-4">
                    <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Up to {plan.site_access} {plan.site_access === 1 ? 'Site' : 'Sites'} Allowed</span>
                    </li>
                    {Array.isArray(plan.features) && (plan.features as string[]).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pb-6 px-25">
                    <Button 
                      variant={isCurrentPlan ? "outline" : "default"}
                      className={cn(
                        "w-full rounded-full py-5 font-medium transition-all",
                        isCurrentPlan ? "border-primary/50 text-primary hover:bg-primary/10" : "shadow-lg"
                      )}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? "Active Plan" : "Upgrade Now"}
                    </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6  border-border/50">
          <div className="flex flex-wrap justify-center gap-8 items-center text-muted-foreground opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Trust Badges could go here */}
          </div>
          
          <div className={cn(
            "mb-5 transition-all duration-300 flex justify-center",
            (selectedPlanId && selectedPlanId !== currentMembership?.membership_id) 
              ? "opacity-100" 
              : "opacity-40"
          )}>
            <CustomButton 
              text={planMutation.isPending ? "Processing..." : "Confirm Selection"}
              iconColor="text-white"
              iconBgColor="gradient-primary group-hover:bg-gray-800"
              buttonBgColor="bg-ui-badge-bg"
              textColor="text-black"
              borderColor="border border-ui-border-shade"
              onClick={handleProceed}
              disabled={planMutation.isPending || !selectedPlanId || selectedPlanId === currentMembership?.membership_id}
              loading={planMutation.isPending}
            />
          </div>
          
          {/* <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Secure Checkout Powered by Stripe
            </div>
            <p className="text-[10px] text-muted-foreground/60 text-center max-w-sm">
              By clicking "Confirm Selection", you agree to our terms of service and recognize that your billing will be updated accordingly.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  </div>
);
}
