import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flag, Trophy, Target, CheckCircle, Lock, Star } from 'lucide-react';
import { ctfChallenges } from '@/lib/data';
import { getStoredUser } from '@/lib/auth';

export default function CTF() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [flagInput, setFlagInput] = useState('');
  const user = getStoredUser();

  const categories = ['all', 'Web', 'Cryptography', 'Forensics', 'Binary Exploitation', 'Reverse Engineering'];
  
  const filteredChallenges = ctfChallenges.filter(challenge => 
    selectedCategory === 'all' || challenge.category === selectedCategory
  );

  const solvedChallenges = ctfChallenges.filter(c => c.solved).length;
  const totalPoints = ctfChallenges.filter(c => c.solved).reduce((sum, c) => sum + c.points, 0);

  const handleSubmitFlag = (challengeId: string) => {
    if (flagInput.toLowerCase().includes('flag') || flagInput.toLowerCase().includes('ctf')) {
      alert('Correct! Challenge solved!');
    } else {
      alert('Incorrect flag. Try again!');
    }
    setFlagInput('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Flag className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <CardTitle>CTF Arena Access Required</CardTitle>
            <CardDescription>
              Please sign in to access the Capture The Flag challenges
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Flag className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-extrabold mb-4">CTF Arena</h1>
            <p className="text-xl text-gray-200 mb-8">
              Test your cybersecurity skills with hands-on challenges
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6 mr-2" />
                  <span className="text-2xl font-bold">{totalPoints}</span>
                </div>
                <p className="text-sm text-gray-200">Total Points</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 mr-2" />
                  <span className="text-2xl font-bold">{solvedChallenges}</span>
                </div>
                <p className="text-sm text-gray-200">Challenges Solved</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 mr-2" />
                  <span className="text-2xl font-bold">#{Math.floor(Math.random() * 100) + 1}</span>
                </div>
                <p className="text-sm text-gray-200">Global Rank</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="challenges" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All Categories' : category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <Card key={challenge.id} className={`${challenge.solved ? 'border-green-500 bg-green-50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        challenge.difficulty === 'Easy' ? 'default' :
                        challenge.difficulty === 'Medium' ? 'secondary' : 'destructive'
                      }>
                        {challenge.difficulty}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{challenge.points} pts</span>
                        {challenge.solved && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                    </div>
                    <CardTitle className="flex items-center">
                      {challenge.solved ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      {challenge.title}
                    </CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Badge variant="outline">{challenge.category}</Badge>
                      
                      {!challenge.solved ? (
                        <div className="space-y-2">
                          <Label htmlFor={`flag-${challenge.id}`}>Submit Flag:</Label>
                          <div className="flex space-x-2">
                            <Input
                              id={`flag-${challenge.id}`}
                              placeholder="flag{...}"
                              value={flagInput}
                              onChange={(e) => setFlagInput(e.target.value)}
                            />
                            <Button onClick={() => handleSubmitFlag(challenge.id)} size="sm">
                              Submit
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-green-600 font-medium">Challenge Completed!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Leaderboard</CardTitle>
                <CardDescription>Top performers in the CTF arena</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: 'CyberNinja', points: 2850, solved: 15 },
                    { rank: 2, name: 'HackMaster', points: 2640, solved: 14 },
                    { rank: 3, name: 'SecurityPro', points: 2420, solved: 12 },
                    { rank: 4, name: user.name, points: totalPoints, solved: solvedChallenges },
                    { rank: 5, name: 'CodeBreaker', points: 1980, solved: 10 },
                  ].map((player) => (
                    <div key={player.rank} className={`flex items-center justify-between p-4 rounded-lg ${
                      player.name === user.name ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          player.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {player.rank}
                        </div>
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <p className="text-sm text-gray-500">{player.solved} challenges solved</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{player.points}</p>
                        <p className="text-sm text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}