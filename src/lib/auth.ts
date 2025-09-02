import { User } from './data';
import { supabase } from './supabaseClient';

// Lightweight evented toast helper (avoids direct hook import here)
const emitToast = (opts: { title: string; description?: string; variant?: string }) => {
  try {
    window.dispatchEvent(new CustomEvent('app:toast', { detail: opts }));
  } catch {}
};

// Central toast variants
export const toastSuccess = (title: string, description?: string) => emitToast({ title, description });
export const toastError = (title: string, description?: string) => emitToast({ title, description, variant: 'destructive' });

// -------- Local credential storage fallback (when Supabase auth not available) --------
interface LocalStoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // sha-256
  createdAt: string;
}

const LOCAL_USERS_KEY = 'nex_local_users';
const loadLocalUsers = (): LocalStoredUser[] => {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]'); } catch { return []; }
};
const saveLocalUsers = (users: LocalStoredUser[]) => localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

const hashPassword = async (pw: string): Promise<string> => {
  try {
    const enc = new TextEncoder().encode(pw);
    const digest = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  } catch {
    // Fallback weak hash
    return btoa(pw).split('').reverse().join('');
  }
};

// Simple retry queue for failed Supabase mutations
interface PendingOp {
  id: string;
  type: 'enrollment' | 'module_progress' | 'completion';
  payload: any;
  attempts: number;
  nextRetry: number; // epoch ms
  createdAt: number;
  lastError?: string;
  courseId?: string; // for UI association
}

const RETRY_KEY = 'nex_pending_ops';
const MAX_ATTEMPTS = 5;

export const loadQueue = (): PendingOp[] => {
  try { return JSON.parse(localStorage.getItem(RETRY_KEY) || '[]'); } catch { return []; }
};
const saveQueue = (q: PendingOp[]) => localStorage.setItem(RETRY_KEY, JSON.stringify(q));

const scheduleOp = (op: Omit<PendingOp, 'id' | 'attempts' | 'nextRetry' | 'createdAt'>) => {
  const q = loadQueue();
  q.push({ id: crypto.randomUUID(), attempts: 0, nextRetry: Date.now(), createdAt: Date.now(), ...op });
  saveQueue(q);
};

export const processQueue = async () => {
  const q = loadQueue();
  if (!q.length) return;
  const now = Date.now();
  const remaining: PendingOp[] = [];
  for (const op of q) {
    if (op.nextRetry > now) { remaining.push(op); continue; }
    let success = false;
    try {
      if (op.type === 'enrollment') {
        const { error } = await supabase.from('enrollments').upsert(op.payload);
        if (!error) success = true; else throw error;
      } else if (op.type === 'module_progress') {
        if (op.payload.action === 'delete') {
          const { error } = await supabase.from('module_progress').delete()
            .eq('user_id', op.payload.user_id).eq('course_id', op.payload.course_id).eq('module_title', op.payload.module_title);
          if (!error) success = true; else throw error;
        } else {
          const { error } = await supabase.from('module_progress').upsert(op.payload.record);
          if (!error) success = true; else throw error;
        }
      } else if (op.type === 'completion') {
        const { error } = await supabase.from('enrollments').upsert(op.payload);
        if (!error) success = true; else throw error;
      }
    } catch (err: any) {
      op.lastError = err?.message || 'Unknown error';
    }
    if (!success) {
      op.attempts += 1;
      if (op.attempts < MAX_ATTEMPTS) {
        // exponential backoff 2^attempts * 5s
        const delay = Math.pow(2, op.attempts) * 5000;
        op.nextRetry = Date.now() + delay;
        remaining.push(op);
      } else {
        toastError('Sync failed permanently', op.type.replace('_', ' '));
      }
    }
  }
  if (remaining.length !== q.length) saveQueue(remaining);
};

// Kick off periodic queue processing
if (typeof window !== 'undefined') {
  setInterval(processQueue, 8000);
  window.addEventListener('online', () => processQueue());
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    initials: 'JD',
    membershipType: 'Pro',
    enrolledCourses: ['eh-fund', 'df-ess'],
    completedCourses: ['eh-fund'],
    certificates: ['eh-fund'],
    ctfPoints: 850,
    role: 'user'
  },
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@nexlearn.com',
    initials: 'AD',
    membershipType: 'Enterprise',
    enrolledCourses: [],
    completedCourses: [],
    certificates: [],
    ctfPoints: 0,
    role: 'admin'
  }
];

export const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('nex_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const storeUser = (user: User): void => {
  localStorage.setItem('nex_user', JSON.stringify(user));
  try {
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user } }));
  } catch {}
};

export const removeUser = (): void => {
  localStorage.removeItem('nex_user');
  try {
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: null } }));
  } catch {}
};

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Attempt real Supabase login first
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      // Hydrate or adapt to local User shape
      const profile: User = getStoredUser() || {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || email,
        initials: (data.user.user_metadata?.full_name || data.user.email || 'U').split(' ').map((p: string)=>p[0]).join('').slice(0,2).toUpperCase(),
        membershipType: 'Basic',
        enrolledCourses: [],
        completedCourses: [],
        certificates: [],
        ctfPoints: 0,
        role: 'user'
      };
      storeUser(profile);
  toastSuccess('Signed in', 'Welcome back!');
      return { success: true, user: profile };
    }
  } catch (e) {
    // fall back to mock below
  }
  // Mock fallback
  await new Promise(resolve => setTimeout(resolve, 300));
  if (email === 'demo@nexlearn.com' && password === 'demo123') {
    const user = mockUsers[0];
    storeUser(user);
  toastSuccess('Demo login', 'Signed in with demo account.');
    return { success: true, user };
  }
  // Local user fallback
  try {
    const users = loadLocalUsers();
    const pwHash = await hashPassword(password);
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === pwHash);
    if (found) {
      const profile: User = {
        id: found.id,
        name: found.name,
        email: found.email,
        initials: found.name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase(),
        membershipType: 'Basic',
        enrolledCourses: [],
        completedCourses: [],
        certificates: [],
        ctfPoints: 0,
        role: 'user'
      };
      storeUser(profile);
      toastSuccess('Signed in (local)', 'Authenticated locally.');
      return { success: true, user: profile };
    }
  } catch {}
  return { success: false, error: 'Invalid credentials' };
};

export const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      const profile: User = {
        id: data.user.id,
        name,
        email: data.user.email || email,
        initials: name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
        membershipType: 'Basic',
        enrolledCourses: [],
        completedCourses: [],
        certificates: [],
        ctfPoints: 0,
        role: 'user'
      };
      storeUser(profile);
      // Also persist local hashed credentials for offline login
      try {
        const users = loadLocalUsers();
        if (!users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          const pwHash = await hashPassword(password);
          users.push({ id: profile.id, email: profile.email, name: profile.name, passwordHash: pwHash, createdAt: new Date().toISOString() });
          saveLocalUsers(users);
        }
      } catch {}
  toastSuccess('Account created', 'Welcome to NexLearn!');
      return { success: true, user: profile };
    }
  } catch (e:any) {
    // fall through to local creation below
  }
  // Local fallback creation
  try {
    const users = loadLocalUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email already registered locally' };
    }
    const pwHash = await hashPassword(password);
    const local: LocalStoredUser = { id: crypto.randomUUID(), email, name, passwordHash: pwHash, createdAt: new Date().toISOString() };
    users.push(local); saveLocalUsers(users);
    const profile: User = {
      id: local.id,
      name,
      email,
      initials: name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
      membershipType: 'Basic',
      enrolledCourses: [],
      completedCourses: [],
      certificates: [],
      ctfPoints: 0,
      role: 'user'
    };
    storeUser(profile);
    toastSuccess('Account created (local)', 'Stored locally.');
    return { success: true, user: profile };
  } catch (e:any) {
    return { success: false, error: e?.message || 'Signup failed' };
  }
};

export const logout = (): void => {
  removeUser();
  // Use history navigation instead of hard reload if available
  if (typeof window !== 'undefined') {
    if (window.history && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    } else if (!window.history) {
      window.location.href = '/';
    }
  }
};

export const adminLogin = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  await new Promise(r => setTimeout(r, 800));
  if (email === 'admin@nexlearn.com' && password === 'admin123') {
    const admin = mockUsers.find(u => u.role === 'admin')!;
    storeUser(admin);
    return { success: true, user: admin };
  }
  return { success: false, error: 'Invalid admin credentials' };
};

// Simple subscription helper (optional usage)
export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<{ user: User | null }>;
    callback(custom.detail?.user ?? getStoredUser());
  };
  window.addEventListener('auth:changed', handler);
  return () => window.removeEventListener('auth:changed', handler);
};

export const enrollInCourse = (courseId: string): void => {
  const user = getStoredUser();
  if (user && !user.enrolledCourses.includes(courseId)) {
    user.enrolledCourses.push(courseId);
    storeUser(user);
    // optimistic toast
  toastSuccess('Enrolled', 'You have been enrolled in the course.');
    (async () => {
      try {
        const { error } = await supabase.from('enrollments').upsert({ user_id: user.id, course_id: courseId, enrolled_at: new Date().toISOString() });
        if (error) throw error;
      } catch (e) {
        toastError('Enrollment pending sync', 'Working offline or server unreachable.');
  scheduleOp({ type: 'enrollment', payload: { user_id: user.id, course_id: courseId, enrolled_at: new Date().toISOString() }, courseId });
      }
    })();
  }
};

export const completeCourse = (courseId: string): void => {
  const user = getStoredUser();
  if (user && !user.completedCourses.includes(courseId)) {
    user.completedCourses.push(courseId);
  // Award certificate if not already
  if (!user.certificates.includes(courseId)) user.certificates.push(courseId);
    storeUser(user);
  }
};

// Module progress persistence (localStorage only)
export interface ModuleProgressRecord {
  [userId: string]: {
    [courseId: string]: {
      completed: string[]; // module titles
    };
  };
}

const MODULE_PROGRESS_KEY = 'nex_module_progress';

export const getModuleProgress = (): ModuleProgressRecord => {
  try {
    const raw = localStorage.getItem(MODULE_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const toggleModuleCompletion = (courseId: string, moduleTitle: string): void => {
  const user = getStoredUser();
  if (!user) return; // require user login for progress
  const data = getModuleProgress();
  if (!data[user.id]) data[user.id] = {};
  if (!data[user.id][courseId]) data[user.id][courseId] = { completed: [] };
  const arr = data[user.id][courseId].completed;
  const idx = arr.indexOf(moduleTitle);
  if (idx >= 0) arr.splice(idx, 1); else arr.push(moduleTitle);
  localStorage.setItem(MODULE_PROGRESS_KEY, JSON.stringify(data));
  try { window.dispatchEvent(new CustomEvent('modules:changed', { detail: { courseId, userId: user.id } })); } catch {}
  // Supabase sync
  (async () => {
    try {
      if (idx >= 0) {
        const { error } = await supabase.from('module_progress').delete().eq('user_id', user.id).eq('course_id', courseId).eq('module_title', moduleTitle);
        if (error) throw error;
      } else {
        const record = { user_id: user.id, course_id: courseId, module_title: moduleTitle, completed_at: new Date().toISOString() };
        const { error } = await supabase.from('module_progress').upsert(record);
        if (error) throw error;
      }
    } catch (e) {
      toastError('Progress saved locally', 'Retrying sync soon.');
      if (idx >= 0) {
        scheduleOp({ type: 'module_progress', payload: { action: 'delete', user_id: user.id, course_id: courseId, module_title: moduleTitle }, courseId });
      } else {
        scheduleOp({ type: 'module_progress', payload: { action: 'upsert', record: { user_id: user.id, course_id: courseId, module_title: moduleTitle, completed_at: new Date().toISOString() } }, courseId });
      }
    }
  })();
};

export const getCourseModuleCompletionPercent = (courseId: string, total: number): number => {
  if (total === 0) return 0;
  const user = getStoredUser();
  if (!user) return 0;
  const data = getModuleProgress();
  const completed = data[user.id]?.[courseId]?.completed.length || 0;
  return Math.min(100, Math.round((completed / total) * 100));
};

// Auto-complete course when all modules are done
export const syncAutoCompletion = (courseId: string, totalModules: number): void => {
  if (totalModules === 0) return;
  const user = getStoredUser();
  if (!user) return;
  const percent = getCourseModuleCompletionPercent(courseId, totalModules);
  if (percent === 100 && !user.completedCourses.includes(courseId)) {
    user.completedCourses.push(courseId);
  if (!user.certificates.includes(courseId)) user.certificates.push(courseId);
    storeUser(user);
    try { window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user } })); } catch {}
    (async () => {
      try {
        const { error } = await supabase.from('enrollments').upsert({ user_id: user.id, course_id: courseId, completed_at: new Date().toISOString() });
        if (error) throw error;
        toastSuccess('Course completed', 'Progress synced');
      } catch {
        toastError('Completion saved locally', 'Will retry sync');
        scheduleOp({ type: 'completion', payload: { user_id: user.id, course_id: courseId, completed_at: new Date().toISOString() }, courseId });
      }
    })();
  }
};

export const getPendingOpsForCourse = (courseId: string): number => {
  return loadQueue().filter(op => op.courseId === courseId).length;
};

export const getPendingOpDetailsForCourse = (courseId: string) => {
  return loadQueue().filter(op => op.courseId === courseId).map(o => ({ id: o.id, type: o.type, attempts: o.attempts, nextRetry: o.nextRetry, lastError: o.lastError, ageMs: Date.now() - o.createdAt }));
};

// Learning Path enrollment & completion
export const enrollInLearningPath = (pathId: string) => {
  const user = getStoredUser();
  if (!user) return;
  user.learningPaths = user.learningPaths || [];
  if (!user.learningPaths.includes(pathId)) {
    user.learningPaths.push(pathId);
    storeUser(user);
    toastSuccess('Learning Path enrolled', 'Path added to your dashboard');
  }
};

export const completeLearningPath = (pathId: string) => {
  const user = getStoredUser();
  if (!user) return;
  user.pathCertificates = user.pathCertificates || [];
  if (!user.pathCertificates.includes(pathId)) {
    user.pathCertificates.push(pathId);
    storeUser(user);
    toastSuccess('Path completed', 'Certificate issued');
  }
};

// Convenience helpers
export const getCompletedModules = (courseId: string): string[] => {
  const user = getStoredUser();
  if (!user) return [];
  const data = getModuleProgress();
  return data[user.id]?.[courseId]?.completed || [];
};

export const getFirstIncompleteModuleIndex = (course: { id: string; modules?: { title: string }[] }): number | null => {
  if (!course.modules || course.modules.length === 0) return null;
  const done = new Set(getCompletedModules(course.id));
  for (let i = 0; i < course.modules.length; i++) {
    if (!done.has(course.modules[i].title)) return i;
  }
  return 0; // all done -> start at 0 for review
};

// --- Supabase Auth Migration Helpers (skeleton) ---
export const migrateLocalUserToSupabase = async (): Promise<void> => {
  const user = getStoredUser();
  if (!user) return;
  // Placeholder: attempt to upsert user profile row
  try {
    await supabase.from('users').upsert({ id: user.id, email: user.email, name: user.name, membership_type: user.membershipType });
  } catch {}
};

export const hydrateProgressFromSupabase = async (): Promise<void> => {
  const user = getStoredUser();
  if (!user) return;
  try {
    const { data: enroll } = await supabase.from('enrollments').select('*').eq('user_id', user.id);
    const { data: mods } = await supabase.from('module_progress').select('*').eq('user_id', user.id);
    if (enroll) {
      enroll.forEach(e => {
        if (!user.enrolledCourses.includes(e.course_id)) user.enrolledCourses.push(e.course_id);
        if (e.completed_at && !user.completedCourses.includes(e.course_id)) user.completedCourses.push(e.course_id);
      });
    }
    storeUser(user);
    if (mods) {
      // Merge into local module progress if absent
      const local = getModuleProgress();
      if (!local[user.id]) local[user.id] = {};
      mods.forEach(m => {
        if (!local[user.id][m.course_id]) local[user.id][m.course_id] = { completed: [] };
        if (!local[user.id][m.course_id].completed.includes(m.module_title)) local[user.id][m.course_id].completed.push(m.module_title);
      });
      localStorage.setItem(MODULE_PROGRESS_KEY, JSON.stringify(local));
      try { window.dispatchEvent(new Event('modules:changed')); } catch {}
    }
  } catch {}
};