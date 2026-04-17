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
import CustomButton from "@/components/customButton";

interface PaymentFormProps {
  plan: string;
  price: number;
  existingDomainUrl?: string | null;
}

export default function PaymentForm({ plan, price, existingDomainUrl }: PaymentFormProps) {
  const router = useRouter();
  const [domainUrl, setDomainUrl] = useState(existingDomainUrl || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  // const [cvc, setCvc] = useState('');

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

    const isFormValid = (existingDomainUrl || domainUrl.trim() !== '') && cardNumber.trim() !== '' 
    // && cvc.trim() !== ''
    ;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDomainUrl = existingDomainUrl || domainUrl;
    
    if (!finalDomainUrl.trim()) {
      toast.error('Please enter your domain URL first.');
      return;
    }
    if (!cardNumber.trim() 
      // || !cvc.trim()
    ) {
      toast.error('Please fill all the payment fields.');
      return;
    }
    paymentMutation.mutate({ domainUrl: finalDomainUrl });
  };

  return (
    <form onSubmit={handlePay} className="space-y-5" noValidate>
      {!existingDomainUrl && (
        <div className="space-y-2">
          <Label htmlFor="domainUrl" className="text-sm font-medium">
            Target Domain URL
          </Label>
          <div className="relative">
            <Input 
              id="domainUrl"
              placeholder="https://your-wordpress-site.com"
              className="pl-12 h-12 bg-background/50  rounded-xl text-md mt-1"
              value={domainUrl}
              onChange={(e) => setDomainUrl(e.target.value)}
              required
              type="url"
            />
            <Globe className="absolute left-4 top-3 w-6 h-6 text-muted-foreground opacity-50" />
          </div>
          <p className="text-xs text-muted-foreground font-medium  ml-1">
            Your license will be locked to this specific domain.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-sm font-medium">Card Number</Label>
        <div className="relative">
          <Input 
            id="cardNumber"
            placeholder="0000 0000 0000 0000"
            className="pl-12 h-12 bg-background/50 rounded-xl text-md mt-1 tracking-wider"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
            maxLength={19}
          />
          <CreditCard className="absolute left-4 top-3 w-6 h-6 text-muted-foreground opacity-50" />
        </div>
      </div>

      {/* <div className="grid grid-cols-1 gap-4">
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
      </div> */}

      <div className="flex justify-center pt-4 mb-4">
        <CustomButton
          type="submit"
          text={paymentMutation.isPending ? "Verifying..." : `Secure Pay $${price}`}
          iconColor="text-white"
          iconBgColor="gradient-primary group-hover:bg-gray-800"
          buttonBgColor="bg-ui-badge-bg"
          textColor="text-black"
          borderColor="border border-ui-border-shade"
          disabled={paymentMutation.isPending || !isFormValid}
          loading={paymentMutation.isPending}
        />
      </div>

      {/* <div className="flex flex-col items-center gap-3 pt-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground py-2 px-4 rounded-full bg-muted/50 border border-primary/10">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Bank-Level SSL Security Active
        </div>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Powered by Solution22 Payment Engine</p>
      </div> */}
      <p className="text-[10px] uppercase font-bold text-muted-foreground  leading-relaxed opacity-90">
            By completing this payment, you agree to our Terms of Service and Privacy Policy. Your subscription will renew automatically.
          </p>
    </form>
  );
}
