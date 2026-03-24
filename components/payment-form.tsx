'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, CreditCard, Lock, Loader2, Globe } from 'lucide-react';
import { processPaymentSuccess } from '@/app/actions/license-actions';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface PaymentFormProps {
  plan: 'basic' | 'pro' | 'enterprise';
  price: number;
}

export default function PaymentForm({ plan, price }: PaymentFormProps) {
  const router = useRouter();
  const [domainUrl, setDomainUrl] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const paymentMutation = useMutation({
    mutationFn: (data: { domainUrl: string }) => processPaymentSuccess(data.domainUrl),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Payment successful! Generating your license key...');
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Payment processing failed');
    }
  });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainUrl) {
      toast.error('Please enter your domain URL first.');
      return;
    }
    paymentMutation.mutate({ domainUrl });
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="domainUrl" className="text-xs font-bold uppercase tracking-widest opacity-70">
          Target Domain URL (e.g., example.com)
        </Label>
        <div className="relative">
          <Input 
            id="domainUrl"
            placeholder="https://your-wordpress-site.com"
            className="pl-12 h-14 bg-background/50 border-2 rounded-xl text-lg"
            value={domainUrl}
            onChange={(e) => setDomainUrl(e.target.value)}
            required
            type="url"
          />
          <Globe className="absolute left-4 top-4 w-6 h-6 text-muted-foreground opacity-50" />
        </div>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter ml-1">
          Your license will be locked to this specific domain.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-xs font-bold uppercase tracking-widest opacity-70">Card Number</Label>
        <div className="relative">
          <Input 
            id="cardNumber"
            placeholder="0000 0000 0000 0000"
            className="pl-12 h-14 bg-background/50 border-2 rounded-xl text-lg tracking-wider"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
            maxLength={19}
          />
          <CreditCard className="absolute left-4 top-4 w-6 h-6 text-muted-foreground opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry" className="text-xs font-bold uppercase tracking-widest opacity-70">Expiry (MM/YY)</Label>
          <Input 
            id="expiry"
            placeholder="MM / YY"
            className="h-14 bg-background/50 border-2 rounded-xl text-lg text-center"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvc" className="text-xs font-bold uppercase tracking-widest opacity-70">CVC</Label>
          <div className="relative">
            <Input 
              id="cvc"
              placeholder="000"
              className="pl-12 h-14 bg-background/50 border-2 rounded-xl text-lg text-center"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              required
              maxLength={4}
            />
            <Lock className="absolute left-4 top-4 w-6 h-6 text-muted-foreground opacity-50" />
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full rounded-xl h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
        disabled={paymentMutation.isPending}
      >
        {paymentMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Verifying Transaction...
          </>
        ) : (
          <>Secure Pay ${price}</>
        )}
      </Button>

      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground py-2 px-4 rounded-full bg-muted/50 border border-primary/10">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Bank-Level SSL Security Active
        </div>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Powered by Solution22 Payment Engine</p>
      </div>
    </form>
  );
}
