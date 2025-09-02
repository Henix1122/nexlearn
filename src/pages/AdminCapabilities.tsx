import { useEffect } from 'react';
import { Shield, UserPlus, KeySquare, Settings2, ServerCog, ActivitySquare, Database, ClipboardList, Bug, UploadCloud, RefreshCw, MonitorSmartphone, Users as UsersIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Capability {
  title: string;
  icon: any;
  summary: string;
  scenario: string;
  impact: string;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  tip: string;
}

const capabilities: Capability[] = [
  {
    title: 'Create & Manage Users',
    icon: UserPlus,
    summary: 'Provision, deactivate, and maintain user accounts.',
    scenario: 'Onboard a new analyst in minutes and revoke access for a departing contractor.',
    impact: 'Faster onboarding & reduced orphaned accounts.',
    risk: 'High',
    tip: 'Always time-box temporary elevated access.'
  },
  {
    title: 'Assign & Change Roles',
    icon: KeySquare,
    summary: 'Elevate or limit role-based permissions.',
    scenario: 'Grant temporary DB write rights for a controlled migration window.',
    impact: 'Controlled escalation and traceability.',
    risk: 'High',
    tip: 'Log every privilege escalation with a ticket reference.'
  },
  {
    title: 'Configure Systems',
    icon: Settings2,
    summary: 'Adjust app/server configuration & security baselines.',
    scenario: 'Enable HTTPS and enforce HSTS across the platform.',
    impact: 'Improved platform security posture.',
    risk: 'Medium',
    tip: 'Stage changes in a test environment first.'
  },
  {
    title: 'Control the Network',
    icon: ServerCog,
    summary: 'Firewall, VPN, and DNS change authority.',
    scenario: 'Open a port briefly to allow a secure vendor diagnostic.',
    impact: 'Agile yet governed network adjustments.',
    risk: 'Critical',
    tip: 'Implement auto-expiry on temporary firewall rules.'
  },
  {
    title: 'Access All Data',
    icon: Database,
    summary: 'Override read access for investigations & compliance.',
    scenario: 'Pull sensitive audit dataset for an external compliance review.',
    impact: 'Faster audits & incident investigations.',
    risk: 'Critical',
    tip: 'Use just-in-time access tokens with approval.'
  },
  {
    title: 'Review & Clear Logs',
    icon: ActivitySquare,
    summary: 'Inspect and archive operational/security logs.',
    scenario: 'Trace a suspicious login pattern and archive logs post-case.',
    impact: 'Accelerated root-cause analysis.',
    risk: 'High',
    tip: 'Never purge before an integrity hash + offsite backup.'
  },
  {
    title: 'Manage Security Tools',
    icon: Bug,
    summary: 'Tune IDS/IPS, AV and block emerging threats.',
    scenario: 'Deploy emergency block rule against active phishing domain.',
    impact: 'Reduces dwell time and exposure.',
    risk: 'High',
    tip: 'Pair rule changes with rollback notes.'
  },
  {
    title: 'Deploy Software',
    icon: UploadCloud,
    summary: 'Push updates & agents to fleet infrastructure.',
    scenario: 'Roll out monitoring sidecar to all production containers.',
    impact: 'Standardized observability & security layers.',
    risk: 'Medium',
    tip: 'Use canary rings for progressive rollout.'
  },
  {
    title: 'Backup & Restore',
    icon: RefreshCw,
    summary: 'Trigger or validate backups, perform restores.',
    scenario: 'Restore a prior snapshot after accidental schema drop.',
    impact: 'Rapid recovery & continuity.',
    risk: 'Critical',
    tip: 'Test restores quarterly—backups untested are assumptions.'
  },
  {
    title: 'Remote Access',
    icon: MonitorSmartphone,
    summary: 'Secure remote session initiation to managed hosts.',
    scenario: 'Hotfix a production node from an offsite location.',
    impact: 'Reduced MTTR on infrastructure incidents.',
    risk: 'High',
    tip: 'Force MFA + device posture checks for remote admin entry.'
  },
  {
    title: 'Grant Admin Rights',
    icon: Shield,
    summary: 'Delegate or revoke administrative authority.',
    scenario: 'Transfer platform ownership during team rotation.',
    impact: 'Ensures continuity & avoids single points of failure.',
    risk: 'Critical',
    tip: 'Enforce peer review for permanent elevation.'
  }
];

const riskColors: Record<Capability['risk'], string> = {
  Low: 'bg-emerald-600',
  Medium: 'bg-amber-500',
  High: 'bg-orange-600',
  Critical: 'bg-red-600'
};

export default function AdminCapabilities() {
  useEffect(() => {
    document.title = 'Admin Capabilities • NexLearn';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100 py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">Administrative Capability Matrix</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">Scenario-driven breakdown of what a platform administrator can perform, why it matters, and operational guardrails to teach secure behavior.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(cap => {
            const Icon = cap.icon;
            return (
              <Card key={cap.title} className="bg-slate-900/60 border-slate-700 hover:border-indigo-500/60 transition-colors flex flex-col">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-md bg-indigo-600/20 text-indigo-300"><Icon className="h-5 w-5" /></span>
                      <CardTitle className="text-base font-semibold tracking-tight">{cap.title}</CardTitle>
                    </div>
                    <Badge className={`${riskColors[cap.risk]} text-xs`}>{cap.risk}</Badge>
                  </div>
                  <CardDescription className="text-indigo-200/80 text-xs leading-relaxed">{cap.summary}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Scenario</p>
                      <p className="text-slate-300 leading-snug">{cap.scenario}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">Impact</p>
                      <p className="text-slate-300 leading-snug">{cap.impact}</p>
                    </div>
                  </div>
                  <Separator className="my-3 bg-slate-700/50" />
                  <div className="text-xs text-slate-400 italic">Tip: {cap.tip}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <section className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-semibold">Teaching Guidance</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/60">
              <h3 className="font-medium mb-2 text-indigo-300">Risk Coding</h3>
              <p className="text-slate-400 leading-snug">Color-coded badges visually reinforce sensitivity & help learners prioritize defensive controls.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/60">
              <h3 className="font-medium mb-2 text-indigo-300">Scenario Emphasis</h3>
              <p className="text-slate-400 leading-snug">Concrete narratives reduce abstraction and increase retention for operational procedures.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/60">
              <h3 className="font-medium mb-2 text-indigo-300">Principle of Least Privilege</h3>
              <p className="text-slate-400 leading-snug">Pair each capability with revocation workflows to reinforce reversible, minimal access.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
