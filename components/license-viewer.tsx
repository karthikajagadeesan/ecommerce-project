'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import CustomButton from "@/components/customButton";

interface LicenseViewerProps {
  licenseKey: string;
  plan: string;
  licenseId: number;
}

export default function LicenseViewer({ licenseKey, plan, licenseId }: LicenseViewerProps) {
  const [copied, setCopied] = useState(false);
  const [marked, setMarked] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCopy = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    toast.success('License key copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = async () => {
    if (marked) return;
    setMarked(true);

    try {
      if (licenseId !== -1) {
        // Mark as displayed
        const { error } = await (supabase.from('licenses') as any)
          .update({ displayed_once: true })
          .eq('id', licenseId);

        if (error) console.warn('Could not mark license as viewed (RLS restriction likely). Proceeding anyway.');
      } else {
        // Clear mock cookie to simulate 'displayed_once' logic
        document.cookie = "s22_mock_license=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      
      toast.success('Proceeding to Dashboard...', { duration: 1500 });
      router.push('/dashboard');
    } catch (error) {
      toast.error('Something went wrong. Redirecting anyway...');
      router.push('/dashboard');
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-background/50 shadow-2xl relative overflow-hidden">
      {/* <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <ShieldCheck className="w-24 h-24" />
      </div> */}
      <CardContent className="pt-8 space-y-6">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold uppercase tracking-widest ">Your Active License</p>
          <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full capitalize">
            {plan} Membership
          </div>
        </div>

        <div className="relative group/key">
          <div className="bg-muted border-1 border-border/50 rounded-2xl p-6 font-medium font-black text-2xl tracking-[0.2em] break-all text-center text-primary group-hover/key:border-primary/30 transition-colors cursor-pointer select-none ring-offset-background group-active/key:scale-95 duration-200" onClick={handleCopy}>
            {licenseKey}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-1 ">Click to copy key</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10">
          <div className="flex-1 flex justify-center">
            <Button 
              className="rounded-full h-12 text-sm font-bold group shadow-lg px-14" 
              onClick={handleCopy}
              variant="secondary"
            >
              {copied ? (
                <><Check className="mr-2 w-5 h-5 text-green-500" /> Key Copied!</>
              ) : (
                <><Copy className="mr-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /> Copy Key</>
              )}
            </Button>
          </div>
          <div className="flex-1 flex justify-center">
            <CustomButton
              text="Go to Dashboard"
              iconColor="text-white"
              iconBgColor="gradient-primary group-hover:bg-gray-800"
              buttonBgColor="bg-ui-badge-bg"
              textColor="text-black"
              borderColor="border border-ui-border-shade"
              onClick={handleFinish}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
