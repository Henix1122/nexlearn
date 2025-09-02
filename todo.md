# NexLearn - Cybersecurity Learning Platform

## MVP Implementation Plan

### Core Features to Implement:
1. **Homepage** - Hero section, popular courses, CTF arena, membership plans, testimonials
2. **Courses Page** - Course catalog with filtering and search
3. **Course Detail Page** - Individual course information and enrollment
4. **CTF Arena** - Capture the flag challenges interface
5. **Dashboard** - User progress and enrolled courses
6. **Authentication** - Login/signup pages with mock authentication
7. **Membership** - Pricing plans and subscription interface
8. **Certificate System** - Certificate generation and verification

### Files to Create/Modify:
1. `src/pages/Index.tsx` - Homepage with hero, courses, CTF, membership sections
2. `src/pages/Courses.tsx` - Course catalog page
3. `src/pages/CourseDetail.tsx` - Individual course page
4. `src/pages/CTF.tsx` - CTF challenges page
5. `src/pages/Dashboard.tsx` - User dashboard
6. `src/pages/Login.tsx` - Login page
7. `src/pages/Signup.tsx` - Signup page
8. `src/pages/Membership.tsx` - Membership plans page
9. `src/components/Navbar.tsx` - Navigation component
10. `src/components/Footer.tsx` - Footer component
11. `src/lib/auth.ts` - Authentication utilities
12. `src/lib/data.ts` - Mock data for courses, users, etc.
13. `public/assets/` - Copy images and assets from original
14. `index.html` - Update title and meta tags

### Key Features:
- Responsive design with Tailwind CSS
- Mock authentication system
- Course enrollment functionality
- Progress tracking
- Certificate generation
- CTF challenge interface
- Modern UI with shadcn/ui components
- Dark/light theme support

### Implementation Priority:
1. Setup routing and navigation
2. Create homepage with all sections
3. Implement course catalog and details
4. Add authentication system
5. Create dashboard functionality
6. Implement CTF arena
7. Add certificate system
8. Final testing and polish