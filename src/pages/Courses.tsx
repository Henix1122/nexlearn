import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Users, Clock, Search } from 'lucide-react';
import { courses, learningPaths } from '@/lib/data';
import { getCourseModuleCompletionPercent } from '@/lib/auth';

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [pathFilter, setPathFilter] = useState('all');

  const pathCourseIds = new Set(
    learningPaths
      .filter(lp => pathFilter === 'all' || lp.id === pathFilter)
      .flatMap(lp => lp.courses.map(c => c.id))
  );

  const filteredCourses = courses
    .filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(course => levelFilter === 'all' || course.level === levelFilter)
    .filter(course => pathFilter === 'all' || pathCourseIds.has(course.id))
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.students - a.students;
        case 'rating':
          return b.rating - a.rating;
        case 'price-low': {
          const aPrice = a.price === 'FREE' ? 0 : parseFloat(a.price.replace('$', ''));
          const bPrice = b.price === 'FREE' ? 0 : parseFloat(b.price.replace('$', ''));
          return aPrice - bPrice;
        }
        case 'price-high': {
          const aPriceHigh = a.price === 'FREE' ? 0 : parseFloat(a.price.replace('$', ''));
          const bPriceHigh = b.price === 'FREE' ? 0 : parseFloat(b.price.replace('$', ''));
          return bPriceHigh - aPriceHigh;
        }
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Cybersecurity Courses
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Master cybersecurity with our comprehensive course catalog
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
  <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pathFilter} onValueChange={setPathFilter}>
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder="Learning Path" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Paths</SelectItem>
              {learningPaths.map(lp => (
                <SelectItem key={lp.id} value={lp.id}>{lp.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const modulePercent = course.modules ? getCourseModuleCompletionPercent(course.id, course.modules.length) : 0;
            return (
            <Card key={course.id} className="hover:shadow-lg transition-shadow duration-300 relative">
              {modulePercent > 0 && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-indigo-600 text-white">{modulePercent}%</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={
                    course.level === 'Beginner' ? 'default' : 
                    course.level === 'Intermediate' ? 'secondary' : 
                    'destructive'
                  }>
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.students.toLocaleString()} students
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Instructor:</span> {course.instructor}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {course.topics.slice(0, 2).map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {course.topics.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.topics.length - 2} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-gray-900">{course.price}</span>
                    <Button asChild>
                      <Link to={`/courses/${course.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );})}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setLevelFilter('all');
                setSortBy('popular');
              }}
              className="mt-4"
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}