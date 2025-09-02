import { useEffect, useState, useMemo } from 'react';
import { getPendingOpsForCourse, getPendingOpDetailsForCourse } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FlaskConical, HelpCircle, PlayCircle, ListChecks } from 'lucide-react';
import { toggleModuleCompletion, getModuleProgress, syncAutoCompletion } from '@/lib/auth';
import { Progress } from '@/components/ui/progress';

interface ModuleItem {
  title: string;
  type: 'lesson' | 'lab' | 'quiz';
  duration?: string;
}

interface Props {
  courseId: string;
  modules: ModuleItem[];
  onProgressChange?: (percent: number) => void;
}

export default function CourseModules({ courseId, modules, onProgressChange }: Props) {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      const data = getModuleProgress();
      // Flatten to current user scope handled inside auth util modifications; attempt extraction heuristically
      // We try all users and pick one with courseId if direct structure not found (legacy fallback)
      let found: string[] = [];
      Object.values<any>(data).forEach((userScope: any) => {
        if (userScope && userScope[courseId]) found = userScope[courseId].completed;
      });
      setCompleted(found || []);
      syncAutoCompletion(courseId, modules.length);
    };
    sync();
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ courseId: string; userId?: string }>;
      if (custom.detail?.courseId === courseId) sync();
    };
    window.addEventListener('modules:changed', handler);
    return () => window.removeEventListener('modules:changed', handler);
  }, [courseId]);

  const percent = useMemo(() => {
    if (!modules.length) return 0;
    return Math.round((completed.length / modules.length) * 100);
  }, [completed.length, modules.length]);

  useEffect(() => {
    onProgressChange?.(percent);
  }, [percent, onProgressChange]);

  const iconFor = (type: ModuleItem['type']) => {
    switch (type) {
      case 'lab': return <FlaskConical className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      default: return <PlayCircle className="h-4 w-4" />;
    }
  };

  const badgeVariant = (type: ModuleItem['type']): any => {
    switch (type) {
      case 'lab': return 'destructive';
      case 'quiz': return 'secondary';
      default: return 'default';
    }
  };

  const [pending, setPending] = useState(0);
  const [pendingDetails, setPendingDetails] = useState<any[]>([]);
  useEffect(() => {
    const tick = () => {
      const count = getPendingOpsForCourse(courseId);
      setPending(count);
      if (count) setPendingDetails(getPendingOpDetailsForCourse(courseId)); else setPendingDetails([]);
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => clearInterval(id);
  }, [courseId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <CardTitle className="flex items-center gap-2">Modules <ListChecks className="h-5 w-5 text-indigo-600" /></CardTitle>
            <div className="flex items-center gap-3">
              <CardDescription>{modules.length} modules • {percent}% complete</CardDescription>
              {pending > 0 && (
                <div className="relative group">
                  <span className="text-[10px] px-2 py-1 rounded bg-orange-500 text-white font-semibold cursor-help">{pending} pending</span>
                  <div className="absolute z-20 hidden group-hover:block top-full mt-1 right-0 w-72 p-2 bg-white border rounded shadow text-[10px] space-y-1">
                    {pendingDetails.map(d => (
                      <div key={d.id} className="border-b last:border-none pb-1 last:pb-0">
                        <div className="font-semibold">{d.type}</div>
                        <div>Attempts: {d.attempts} • Retry in {(Math.max(0,d.nextRetry-Date.now())/1000).toFixed(0)}s</div>
                        {d.lastError && <div className="text-red-500 truncate">{d.lastError}</div>}
                        <div className="text-gray-500">Age: {(d.ageMs/1000).toFixed(0)}s</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-40"><Progress value={percent} /></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {modules.map(m => {
          const done = completed.includes(m.title);
          return (
            <div key={m.title} className={`flex items-center gap-3 p-3 rounded-md border transition bg-white ${done ? 'border-green-400/60 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex items-center gap-1">{iconFor(m.type)}{m.title}</span>
                  <Badge variant={badgeVariant(m.type)} className="text-[10px] uppercase tracking-wide">{m.type}</Badge>
                  {m.duration && <span className="text-xs text-gray-500">{m.duration}</span>}
                </div>
              </div>
              <Button size="sm" variant={done ? 'secondary' : 'outline'} onClick={() => toggleModuleCompletion(courseId, m.title)}>
                {done ? <CheckCircle2 className="h-4 w-4 mr-1" /> : null}
                {done ? 'Done' : 'Mark'}
              </Button>
            </div>
          );
        })}
        {!modules.length && <p className="text-sm text-gray-500">No modules defined.</p>}
      </CardContent>
    </Card>
  );
}
