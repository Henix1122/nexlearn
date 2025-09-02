import { useState, useEffect } from 'react';
import { getStoredUser, storeUser, logout } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Settings(){
  const [name,setName] = useState('');
  const [loading,setLoading] = useState(false);
  const [saved,setSaved] = useState(false);
  const [error,setError] = useState('');
  const navigate = useNavigate();
  useEffect(()=>{
    const u = getStoredUser();
    if(!u){ navigate('/login'); return; }
    setName(u.name);
  },[]);

  const save = async (e:React.FormEvent)=>{
    e.preventDefault();
    setSaved(false); setError(''); setLoading(true);
    try {
      const u = getStoredUser();
      if(!u) { setError('Not authenticated'); return; }
      u.name = name.trim() || u.name;
      u.initials = u.name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
      storeUser(u);
      setSaved(true);
    } catch (e:any){ setError(e?.message||'Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Update your basic profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-6">
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>{loading? 'Saving...' : 'Save Changes'}</Button>
                <Button type="button" variant="outline" onClick={()=>{ logout(); navigate('/'); }}>Logout</Button>
              </div>
              {saved && <p className="text-sm text-green-600">Profile updated.</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
