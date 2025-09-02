import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Users, Target, Rocket, BookOpen, Flag } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">About NexLearn</h1>
          <p className="mt-6 text-lg md:text-xl text-indigo-100 max-w-3xl">
            NexLearn is a modern cybersecurity learning platform that blends structured courses, hands-on labs, and CTF challenges to help you build real-world skills fast.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Badge className="bg-indigo-600">Cybersecurity</Badge>
            <Badge variant="secondary" className="bg-white text-indigo-700 hover:bg-white">Hands-on Labs</Badge>
            <Badge variant="outline" className="border-indigo-300 text-indigo-100">CTF</Badge>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 grid gap-10 md:grid-cols-3">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <Shield className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>Mission</CardTitle>
              <CardDescription>
                Democratize access to high-quality cybersecurity education through practical, engaging content.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <Target className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>Focus</CardTitle>
              <CardDescription>
                We emphasize skill application over theory: exploit development, forensics, web security & more.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <Rocket className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>Approach</CardTitle>
              <CardDescription>
                Learn -&gt; Practice -&gt; Challenge -&gt; Certify: a loop that reinforces confidence and mastery.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What Makes Us Different</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: BookOpen, title: 'Structured Paths', text: 'Progressive course roadmaps from fundamentals to advanced exploitation.' },
              { icon: Flag, title: 'Integrated CTF', text: 'Challenges mapped directly to the concepts you just learned.' },
              { icon: Users, title: 'Community', text: 'Peer discussion, mentoring sessions, and collaborative learning.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <Card key={i} className="border-indigo-100 hover:border-indigo-300 transition-colors">
                  <CardHeader className="space-y-2">
                    <Icon className="h-8 w-8 text-indigo-600" />
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                    <CardDescription>{f.text}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Join Us</h2>
          <p className="text-gray-600 mb-8">
            Whether you're starting out or sharpening advanced skills, NexLearn gives you a guided, challenge-driven path to grow in cybersecurity.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
