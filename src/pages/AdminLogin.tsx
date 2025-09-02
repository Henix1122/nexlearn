import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield } from 'lucide-react';
import { adminLogin, getStoredUser } from '@/lib/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const allowed = sessionStorage.getItem('admin_seq_pass') === '1';
    const u = getStoredUser();
    if (u?.role === 'admin') {
      navigate('/dashboard');
      return;
    }
    if (!allowed) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await adminLogin(email, password);
    if (res.success) {
      if (res.user?.role === 'admin') {
        navigate('/dashboard');
      } else {
        setError('Not an admin account');
      }
    } else {
      setError(res.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 px-4 py-16">
      <Card className="w-full max-w-md border-indigo-700/40 bg-slate-900/70 backdrop-blur text-slate-100">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto bg-indigo-600/20 rounded-full p-4 w-16 h-16 flex items-center justify-center">
            <Shield className="h-8 w-8 text-indigo-400" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription className="text-indigo-200">Restricted area. Authorized personnel only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@nexlearn.com" className="bg-slate-800 border-slate-700 text-slate-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="bg-slate-800 border-slate-700 text-slate-100" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
            <p className="text-xs text-slate-400 text-center">
              Back to <Link to="/" className="text-indigo-300 hover:underline">Home</Link>
            </p>
          </form>
          <div className="mt-6 text-xs text-slate-500 space-y-1">
            <p>Demo Admin: admin@nexlearn.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
