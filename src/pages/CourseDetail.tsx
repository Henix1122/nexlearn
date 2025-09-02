import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { downloadCertificate } from '../lib/certificate';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Star, Users, Clock, CheckCircle, PlayCircle, BookOpen, Award } from 'lucide-react';
import { courses, learningPaths } from '@/lib/data';
import { enrollInCourse, getStoredUser, getCourseModuleCompletionPercent, getFirstIncompleteModuleIndex, enrollInLearningPath, completeLearningPath } from '@/lib/auth';
import CourseModules from '@/components/CourseModules';
import { useState, useEffect } from 'react';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const course = courses.find(c => c.id === id);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isEnrolled = !isAdmin && (user?.enrolledCourses.includes(course.id) || false);
  const isCompleted = !isAdmin && (user?.completedCourses.includes(course.id) || false);
  const modulePercent = course.modules ? getCourseModuleCompletionPercent(course.id, course.modules.length) : 0;
  const progress = isCompleted ? 100 : (modulePercent || (isEnrolled ? 10 : 0));

  const handleEnroll = () => {
  if (!user) { navigate('/login'); return; }
    enrollInCourse(course.id);
    setUser(getStoredUser());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {course.level}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{course.rating}</span>
                  <span className="text-sm text-gray-300">({course.students.toLocaleString()} students)</span>
                </div>
              </div>
              <h1 className="text-4xl font-extrabold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-200 mb-6">{course.description}</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.students.toLocaleString()} students
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {course.instructor}
                </div>
              </div>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-3xl">{course.price}</CardTitle>
                    {isEnrolled && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enrolled
                      </Badge>
                    )}
                  </div>
                  {isEnrolled && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isEnrolled && !isAdmin ? (
                    <Button onClick={handleEnroll} className="w-full" size="lg">
                      {user ? 'Enroll Now' : 'Sign in to Enroll'}
                    </Button>
                  ) : !isAdmin ? (
                    <div className="space-y-2">
                      <Button className="w-full" size="lg" onClick={() => {
                        if (course.modules && course.modules.length) {
                          const idx = getFirstIncompleteModuleIndex(course) ?? 0;
                          navigate(`/course-player/${course.id}/${idx}`);
                        } else {
                          navigate(`/course-player/${course.id}/0`);
                        }
                      }}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                      {isCompleted && user && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            downloadCertificate({
                              recipient: user.name,
                              title: course.title,
                              type: 'course',
                              issued: new Date(),
                              id: course.id
                            });
                          }}
                        >
                          <Award className="h-4 w-4 mr-2" />
                          View Certificate
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center">Admin monitoring mode</div>
                  )}
                  <div className="text-center text-sm text-gray-500">
                    30-day money-back guarantee
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            <Card>
              <CardHeader>
                <CardTitle>What you'll learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.topics.map((topic, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{topic}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Modules (if provided) */}
            {course.modules && (
              <CourseModules
                courseId={course.id}
                modules={course.modules}
                onProgressChange={() => {
                  // force re-render progress bar in enrollment card by updating user state trigger
                  setUser(getStoredUser());
                }}
              />
            )}

            {/* Learning Path (if this course belongs to one) */}
            {learningPaths.filter(lp => lp.courses.some(c => c.id === course.id)).map(lp => {
              // Compute aggregated progress across all modules in path
              const pathCourseObjs = lp.courses.map(c => courses.find(cs => cs.id === c.id)).filter(Boolean) as typeof courses;
              let totalModules = 0; let completedModules = 0;
              pathCourseObjs.forEach(pc => {
                if (pc.modules && pc.modules.length) {
                  totalModules += pc.modules.length;
                  const pct = getCourseModuleCompletionPercent(pc.id, pc.modules.length);
                  completedModules += Math.round((pct/100) * pc.modules.length);
                }
              });
              const pathPct = totalModules ? Math.round((completedModules/totalModules)*100) : 0;
              const userHasPath = user?.learningPaths?.includes(lp.id);
              const pathCompleted = user?.pathCertificates?.includes(lp.id);
              return (
                <Card key={lp.id}>
                  <CardHeader>
                    <CardTitle>Learning Path: {lp.title}</CardTitle>
                    <CardDescription>{lp.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span>Overall Progress</span><span>{pathPct}%</span></div>
                      <div className="h-2 bg-muted rounded overflow-hidden"><div className="h-full bg-primary transition-all" style={{width: `${pathPct}%`}} /></div>
                    </div>
                    <div className="flex gap-2">
                      {!userHasPath && <Button size="sm" onClick={() => { enrollInLearningPath(lp.id); setUser(getStoredUser()); }}>Enroll Path</Button>}
                      {userHasPath && !pathCompleted && pathPct === 100 && (
                        <Button size="sm" variant="secondary" onClick={() => { completeLearningPath(lp.id); setUser(getStoredUser()); }}>Claim Certificate</Button>
                      )}
                      {pathCompleted && <Badge className="bg-green-600">Certificate Earned</Badge>}
                    </div>
                    {lp.courses.map((cObj, i) => {
                      const cData = courses.find(c => c.id === cObj.id);
                      if (!cData) return null;
                      const enrolled = user?.enrolledCourses.includes(cData.id);
                      return (
                        <div key={cData.id} className="flex items-center justify-between border rounded-md p-3">
                          <div>
                            <Link to={`/courses/${cData.id}`} className="font-medium hover:underline">{i + 1}. {cData.title}</Link>
                            <div className="text-xs text-gray-500 flex gap-2 mt-1">
                              <span>{cData.level}</span>
                              {cObj.note && <span>• {cObj.note}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {enrolled ? <Badge className="bg-green-500">Enrolled</Badge> : (
                              <Button size="sm" variant="outline" onClick={() => { enrollInCourse(cData.id); setUser(getStoredUser()); }}>
                                Enroll
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}

            {/* About Instructor */}
            <Card>
              <CardHeader>
                <CardTitle>About the Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-600">
                      {course.instructor.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      '12.5 hours on-demand video',
                      '15 downloadable resources',
                      '8 hands-on lab exercises',
                      'Full lifetime access',
                      'Access on mobile and TV',
                      'Certificate of completion'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Related Courses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses
                  .filter(c => c.id !== course.id && c.level === course.level)
                  .slice(0, 3)
                  .map((relatedCourse) => (
                    <div key={relatedCourse.id} className="border rounded-lg p-3">
                      <Link to={`/courses/${relatedCourse.id}`} className="block hover:bg-gray-50 transition-colors">
                        <h5 className="font-medium text-sm mb-1">{relatedCourse.title}</h5>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">{relatedCourse.rating}</span>
                          </div>
                          <span className="text-sm font-medium">{relatedCourse.price}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}