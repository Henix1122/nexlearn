import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Trophy, Award, Clock, PlayCircle, CheckCircle, Flag, Star } from 'lucide-react';
import { courses, ctfChallenges, learningPaths } from '@/lib/data';
import { downloadCertificate } from '@/lib/certificate';
import { getStoredUser, loadQueue, processQueue } from '@/lib/auth';

export default function Dashboard() {
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Required</CardTitle>
            <CardDescription>Please sign in to view your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enrolledCourses = courses.filter(course => user.enrolledCourses.includes(course.id));
  const completedCourses = courses.filter(course => user.completedCourses.includes(course.id));
  const solvedChallenges = ctfChallenges.filter(c => c.solved).length;
  const totalCTFPoints = ctfChallenges.filter(c => c.solved).reduce((sum, c) => sum + c.points, 0);
  const [pendingOps, setPendingOps] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPendingOps(loadQueue().length);
    }, 4000);
    setPendingOps(loadQueue().length);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
              <p className="mt-2 text-gray-600">Continue your cybersecurity learning journey</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {user.membershipType} Member
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
  <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                  <p className="text-sm text-gray-600">Enrolled Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Learning Paths</CardTitle>
              <CardDescription>Aggregated progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!user.learningPaths || user.learningPaths.length === 0) && <p className="text-xs text-gray-500">No enrolled paths yet.</p>}
              {user.learningPaths?.map(pid => {
                const path = learningPaths.find(p => p.id === pid);
                if (!path) return null;
                // compute progress (modules) across path
                let totalModules = 0; let completed = 0;
                path.courses.forEach(cRef => {
                  const c = courses.find(cc => cc.id === cRef.id);
                  if (c?.modules?.length) {
                    totalModules += c.modules.length;
                    // naive local module progress evaluation
                  }
                });
                // reuse percent from per-course modules by counting completed modules from local storage
                // lightweight import avoided: dynamic require of getModuleProgress not accessible here; approximate using completedCourses fallback
                if (totalModules === 0) return (
                  <div key={pid} className="text-xs">{path.title}: <span className="text-gray-500">No module data</span></div>
                );
                // Basic completion percent using completedCourses membership for simplicity
                const completedCoursesInPath = path.courses.filter(c => user.completedCourses.includes(c.id)).length;
                const coursePct = Math.round((completedCoursesInPath / path.courses.length) * 100);
                return (
                  <div key={pid} className="space-y-1">
                    <div className="flex justify-between text-xs"><span>{path.title}</span><span>{coursePct}%</span></div>
                    <div className="h-2 rounded bg-muted overflow-hidden"><div className="h-full bg-indigo-600" style={{width: coursePct + '%'}} /></div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{completedCourses.length}</p>
                  <p className="text-sm text-gray-600">Completed Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{totalCTFPoints}</p>
                  <p className="text-sm text-gray-600">CTF Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{user.certificates.length}</p>
                  <p className="text-sm text-gray-600">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{pendingOps}</p>
                    <p className="text-sm text-gray-600">Pending Sync</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled={!pendingOps} onClick={async () => { await processQueue(); setPendingOps(loadQueue().length); }}>
                  Retry
                </Button>
              </div>
              {pendingOps > 0 && (
                <div className="mt-3 h-2 w-full bg-orange-100 rounded overflow-hidden">
                  <div className="h-full bg-orange-500 animate-pulse" style={{ width: Math.min(100, pendingOps * 20) + '%' }} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

    <Tabs defaultValue="courses" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="ctf">CTF Progress</TabsTrigger>
      <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="recommendations">Recommended</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => {
                  const isCompleted = user.completedCourses.includes(course.id);
                  const progress = isCompleted ? 100 : Math.floor(Math.random() * 80) + 10;
                  
                  return (
                    <Card key={course.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant={course.level === 'Beginner' ? 'default' : course.level === 'Intermediate' ? 'secondary' : 'destructive'}>
                            {course.level}
                          </Badge>
                          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="w-full" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {course.duration}
                            </div>
                            <Button size="sm" asChild>
                              <Link to={`/courses/${course.id}`}>
                                {isCompleted ? 'Review' : 'Continue'}
                                <PlayCircle className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses yet</h3>
                  <p className="text-gray-500 mb-4">Start your cybersecurity journey by enrolling in a course</p>
                  <Button asChild>
                    <Link to="/courses">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ctf" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>CTF Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Challenges Solved</span>
                    <span className="font-bold">{solvedChallenges} / {ctfChallenges.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Points</span>
                    <span className="font-bold">{totalCTFPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Global Rank</span>
                    <span className="font-bold">#{Math.floor(Math.random() * 100) + 1}</span>
                  </div>
                  <Button className="w-full" asChild>
                    <Link to="/ctf">
                      <Flag className="h-4 w-4 mr-2" />
                      Enter CTF Arena
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent CTF Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ctfChallenges.filter(c => c.solved).slice(0, 3).map((challenge) => (
                      <div key={challenge.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{challenge.title}</p>
                          <p className="text-xs text-gray-500">{challenge.category}</p>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          +{challenge.points} pts
                        </Badge>
                      </div>
                    ))}
                    {ctfChallenges.filter(c => c.solved).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No challenges solved yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2"><Award className="h-5 w-5 text-yellow-600" /> Course Certificates</h2>
              {user.certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.certificates.map((certId) => {
                  const course = courses.find(c => c.id === certId);
                  if (!course) return null;
                  
                  return (
                    <Card key={certId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Award className="h-8 w-8 text-yellow-600" />
                          <Badge variant="outline">Verified</Badge>
                        </div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>Certificate of Completion</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Issued to: {user.name}</p>
                          <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                          <div className="flex gap-2 mt-4">
                            <Button className="flex-1" variant="outline" onClick={async () => { await downloadCertificate({ recipient: user.name, title: course.title, type: 'course', issued: new Date(), id: course.id }); }}>
                              Export PDF
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                  <p className="text-gray-500 mb-4">Complete courses to earn certificates</p>
                  <Button asChild>
                    <Link to="/courses">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
              )}
            </div>
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2"><Award className="h-5 w-5 text-purple-600" /> Learning Path Certificates</h2>
              {user.pathCertificates && user.pathCertificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.pathCertificates.map(pid => {
                    const path = learningPaths.find(p => p.id === pid);
                    if (!path) return null;
                    return (
                      <Card key={pid}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Award className="h-8 w-8 text-purple-600" />
                            <Badge variant="outline">Verified</Badge>
                          </div>
                          <CardTitle className="text-lg">{path.title}</CardTitle>
                          <CardDescription>Learning Path Certificate</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Issued to: {user.name}</p>
                            <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                            <div className="flex gap-2 mt-4">
                              <Button className="flex-1" variant="outline" onClick={async () => { await downloadCertificate({ recipient: user.name, title: path.title, type: 'learning-path', issued: new Date(), id: path.id }); }}>Export PDF</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No path certificates</h3>
                    <p className="text-gray-500 mb-4">Complete all courses within a learning path to earn a certificate</p>
                    <Button asChild>
                      <Link to="/courses">Explore Paths</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(course => !user.enrolledCourses.includes(course.id)).slice(0, 6).map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={course.level === 'Beginner' ? 'default' : course.level === 'Intermediate' ? 'secondary' : 'destructive'}>
                        {course.level}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">{course.price}</span>
                      <Button size="sm" asChild>
                        <Link to={`/courses/${course.id}`}>View Course</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}