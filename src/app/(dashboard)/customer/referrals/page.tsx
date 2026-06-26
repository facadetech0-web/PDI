"use client";

import * as React from "react";
import { Copy, Share2, Award, Users, DollarSign, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ReferralService } from "@/lib/services/referral.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default function CustomerReferralsPage() {
  const supabase = createClient();
  const { user } = useAuthStore();
  const [referral, setReferral] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const referralService = React.useMemo(
    () => new ReferralService(supabase),
    [supabase]
  );

  const loadReferralData = React.useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const refData = await referralService.getReferralByUserId(user.id);
      setReferral(refData);
      
      if (refData) {
        const uses = await referralService.getReferralUses(refData.id);
        setHistory(uses);
      }
    } catch (err: any) {
      console.error("Error loading referral data:", err);
      toast.error("Failed to load referral details.");
    } finally {
      setIsLoading(false);
    }
  }, [user, referralService]);

  React.useEffect(() => {
    loadReferralData();
  }, [loadReferralData]);

  const shareUrl = referral
    ? `${window.location.origin}/register?ref=${referral.referral_code}`
    : "";

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Get ₹200 off on PreCar Inspect",
          text: "Get your next pre-owned car inspected by experts! Sign up with my link and get discount benefits:",
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center p-6">
        <Award className="h-16 w-16 text-muted-foreground/60 mb-4" />
        <h2 className="text-xl font-bold text-foreground">No Referral Code Generated</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Please contact support to activate the referral rewards system for your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-gradient">
          Refer & Earn Rewards
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Invite friends to PreCar Inspect. You earn ₹200 for every completed inspection they book, and they get ₹200 off!
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-4 border-white/5 bg-card/45 backdrop-blur-xl">
          <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">
              Total Referrals
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              {referral.total_referrals || 0}
            </span>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4 border-white/5 bg-card/45 backdrop-blur-xl">
          <div className="p-3.5 rounded-xl bg-accent/10 text-accent">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">
              Total Earned
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              {formatCurrency(referral.total_earned || 0)}
            </span>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4 border-white/5 bg-card/45 backdrop-blur-xl">
          <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">
              Reward Rate
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              {formatCurrency(referral.reward_amount)} / referral
            </span>
          </div>
        </Card>
      </div>

      {/* Code Share Card */}
      <Card className="p-8 border-white/5 bg-card/35 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-dashed border-2">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Your Personal Referral Code</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Share this code or your unique link with friends to apply the referral discount at booking.
          </p>
          <div className="text-3xl font-extrabold text-primary tracking-widest mt-4">
            {referral.referral_code}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-white/10 hover:bg-white/5 cursor-pointer h-11 px-5"
            onClick={handleCopyLink}
          >
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Link"}
          </Button>

          <Button
            className="flex items-center gap-2 h-11 px-6 cursor-pointer"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share With Friends
          </Button>
        </div>
      </Card>

      {/* Referral History List */}
      <Card className="border-white/5 bg-card/45 backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-white/5">
          <h3 className="text-base font-semibold text-foreground">Referrals History</h3>
        </div>
        <div className="p-0">
          {history.length === 0 ? (
            <div className="text-center py-10 px-6">
              <p className="text-sm text-muted-foreground">No referrals recorded yet. Share your code to start earning!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-muted-foreground font-medium">
                    <th className="px-6 py-4">Friend</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Reward Earned</th>
                    <th className="px-6 py-4">Date Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((use) => (
                    <tr key={use.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-foreground">
                            {use.referred_profile?.full_name || "New Friend"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {use.referred_profile?.email || ""}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/20">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {formatCurrency(use.reward_earned)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(use.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
