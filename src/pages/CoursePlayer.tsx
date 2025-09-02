import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { courses } from '@/lib/data';
// @ts-ignore: react-markdown commonjs interop
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getStoredUser, enrollInCourse, toggleModuleCompletion, getCompletedModules } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CoursePlayer() {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === id);
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(getStoredUser());
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const idx = moduleIndex ? parseInt(moduleIndex, 10) : 0;

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  if (!course) return <div className="p-8">Course not found</div>;
  if (!course.modules) return <div className="p-8">This course has no structured modules yet.</div>;

  const enrolled = !!user?.enrolledCourses.includes(course.id);
  if (!enrolled) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Enroll Required</h1>
      <Button onClick={() => { if (!user) navigate('/login'); else { enrollInCourse(course.id); setUser(getStoredUser()); } }}>Enroll Now</Button>
      <Button variant="outline" asChild><Link to={`/courses/${course.id}`}>Back to Course</Link></Button>
    </div>
  );

  const completedModules = getCompletedModules(course.id);
  const module = course.modules[idx];
  if (!module) return <div className="p-8">Module not found</div>;

  const normalizedSearch = search.trim().toLowerCase();
  const searchActive = normalizedSearch.length > 1;

  const markDone = () => {
    toggleModuleCompletion(course.id, module.title);
  };

  const goNext = () => {
    if (idx + 1 < course.modules!.length) {
      navigate(`/course-player/${course.id}/${idx + 1}`);
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/courses/${course.id}`}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
            </Button>
            <h1 className="text-lg font-semibold">{course.title}</h1>
            <Badge>{module.type}</Badge>
          </div>
          <div className="text-sm text-gray-500">Module {idx + 1} / {course.modules.length}</div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
              {module.duration && <CardDescription>Estimated time: {module.duration}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {module.content ? (
                  <ReactMarkdown
                    // @ts-ignore plugin props
                    remarkPlugins={[remarkGfm]}
                    // @ts-ignore plugin props
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code({node, inline, className, children, ...props}) {
                        return !inline ? (
                          <pre className={(className || '') + ' rounded-md bg-gray-900 text-gray-100 p-4 overflow-x-auto'}>
                            <code {...props}>{children}</code>
                          </pre>
                        ) : (
                          <code className="px-1 py-0.5 rounded bg-gray-200 text-gray-800" {...props}>{children}</code>
                        );
                      },
                      p({children, ...p}) {
                        const text = String(children);
                        if (searchActive && text.toLowerCase().includes(normalizedSearch)) {
                          const parts = text.split(new RegExp(`(${normalizedSearch})`, 'ig'));
                          return <p {...p}>{parts.map((part,i)=> part.toLowerCase()===normalizedSearch ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part)}</p>;
                        }
                        return <p {...p}>{children}</p>;
                      }
                    }}
                  >{module.content}</ReactMarkdown>
                ) : <p>No content provided yet for this module.</p>}
              </div>
            </CardContent>
          </Card>
          <div className="rounded border bg-white p-3 flex items-center gap-2">
            <input
              value={search}
              onChange={e=>{ const v = e.target.value; setSearch(v); const sp = new URLSearchParams(searchParams); if (v) sp.set('q', v); else sp.delete('q'); setSearchParams(sp, { replace: true }); }}
              placeholder="Search in this module..."
              className="flex-1 text-sm outline-none bg-transparent" />
            {search && <Button variant="ghost" size="sm" onClick={()=>{ setSearch(''); const sp = new URLSearchParams(searchParams); sp.delete('q'); setSearchParams(sp, { replace: true }); }}>Clear</Button>}
          </div>
          <div className="flex gap-3">
            <Button onClick={markDone} variant="outline">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Complete
            </Button>
            <Button onClick={goNext}>
              {idx + 1 < course.modules.length ? 'Next Module' : 'Finish Course'}
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {course.modules.map((m, i) => {
            const done = completedModules.includes(m.title);
            const matches = searchActive && (m.title.toLowerCase().includes(normalizedSearch) || m.content?.toLowerCase().includes(normalizedSearch));
            return (
              <Button key={m.title} variant={i === idx ? 'default' : done ? 'secondary' : 'outline'} className={`w-full justify-start ${done ? 'opacity-90' : ''} ${matches ? 'ring-2 ring-yellow-400' : ''}`} onClick={() => navigate(`/course-player/${course.id}/${i}`)}>
                <span className="text-xs w-6 text-left">{i + 1}.</span>
                <span className={`flex-1 truncate text-left ${done ? 'line-through text-gray-300' : ''}`}>{m.title}</span>
                <Badge variant={done ? 'default' : 'secondary'} className="ml-2 capitalize">{done ? 'done' : m.type}</Badge>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
