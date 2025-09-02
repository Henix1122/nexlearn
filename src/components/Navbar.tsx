import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, Home, BookOpen, Flag, Award, Info, LayoutDashboard, Settings, LogOut, Shield } from 'lucide-react';
import { getStoredUser, logout } from '@/lib/auth';
import { User } from '@/lib/data';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'CTF Arena', href: '/ctf', icon: Flag },
  { name: 'Membership', href: '/membership', icon: Award },
  { name: 'About', href: '/about', icon: Info },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ user: User | null }>; 
      setUser(custom.detail?.user ?? getStoredUser());
    };
    window.addEventListener('auth:changed', handler);
    return () => window.removeEventListener('auth:changed', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              NexLearn
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'text-gray-900 border-b-2 border-indigo-500'
                        : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                    } inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors`}
                  >
                    <Icon className="mr-1 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              {user && (
                <Link
                  to="/dashboard"
                  className={`${
                    location.pathname === '/dashboard'
                      ? 'text-gray-900 border-b-2 border-indigo-500'
                      : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors`}
                >
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-indigo-600 text-white text-sm">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/capabilities" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Capabilities
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  {user ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/capabilities"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
                        >
                          <Shield className="h-5 w-5" />
                          <span>Admin Capabilities</span>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleLogout();
                          setMobileOpen(false);
                        }}
                        className="justify-start text-red-600 hover:text-red-700"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Button variant="ghost" asChild>
                        <Link to="/login" onClick={() => setMobileOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link to="/signup" onClick={() => setMobileOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}