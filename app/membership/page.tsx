'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Zap, ShieldCheck, Trophy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { selectPlan } from '@/app/actions/membership-actions';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    id: 'basic' as const,
    name: 'Basic',
    price: 29,
    description: 'Perfect for small projects and personal use.',
    features: ['Layout 1 access', 'Standard transitions', 'Limited API calls', 'Email support'],
    icon: <Zap className="w-8 h-8 text-primary" />,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 79,
    description: 'Advanced features for scaling businesses.',
    features: ['Layout 1–3 access', 'Advanced transitions', 'Higher API limits', 'Priority support'],
    icon: <Trophy className="w-8 h-8 text-primary" />,
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: 199,
    description: 'Full power for high-traffic environments.',
    features: ['All Layouts (1–4)', 'All transitions', 'Unlimited API calls', '24/7 dedicated support'],
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
  },
];

export default function MembershipPage() {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise' | null>(null);
  const router = useRouter();

  const planMutation = useMutation({
    mutationFn: (plan: 'basic' | 'pro' | 'enterprise') => selectPlan(plan),
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
    if (!selectedPlan) {
      toast.error('Please select a plan first');
      return;
    }
    planMutation.mutate(selectedPlan);
  };

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

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan, i) => (
            <Card 
              key={plan.id}
              className={cn(
                'relative border-4 transition-all duration-500 cursor-pointer overflow-hidden transform group',
                selectedPlan === plan.id 
                  ? 'border-primary shadow-2xl bg-primary/5 -translate-y-2' 
                  : 'border-border/50 hover:border-primary/30 hover:-translate-y-1'
              )}
              onClick={() => setSelectedPlan(plan.id)}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {selectedPlan === plan.id && (
                <div className="absolute top-6 right-6 text-primary animate-in zoom-in-50 duration-300">
                  <CheckCircle2 className="w-8 h-8 fill-primary/10" />
                </div>
              )}
              <CardHeader className="pt-10 pb-6 text-center">
                <div className="mb-6 flex justify-center transform group-hover:scale-110 transition-transform duration-500">{plan.icon}</div>
                <CardTitle className="text-3xl font-black tracking-tighter uppercase mb-1">{plan.name}</CardTitle>
                <CardDescription className="font-medium text-muted-foreground">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 text-center pb-12">
                <div className="text-6xl font-black tracking-tighter text-primary">${plan.price}<span className="text-sm font-bold text-muted-foreground tracking-normal">/mo</span></div>
                <div className="h-px w-12 bg-border mx-auto"></div>
                <ul className="space-y-4 inline-block text-left mx-auto">
                  {plan.features.map((feature, i) => (
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

        <div className="flex flex-col items-center gap-6 pt-4 mb-5 border-t-2">
          <Button 
            size="lg" 
            className={cn(
                "rounded-full px-16 h-16 text-lg font-black uppercase tracking-widest transition-all shadow-2xl",
                selectedPlan ? "opacity-100 translate-y-0" : "opacity-30 translate-y-4 pointer-events-none"
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
