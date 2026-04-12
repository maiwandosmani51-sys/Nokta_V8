import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { accounts, type AccountRole } from '../../config/accounts';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<AccountRole | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (role: AccountRole) => {
    setSelectedRole(role);
    const account = accounts[role];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

  const selectedAccount = selectedRole ? accounts[selectedRole] : undefined;

  const roleRedirectMap: Record<AccountRole, string> = {
    super_admin: '/dashboard/super-admin',
    admin: '/dashboard/admin',
    teacher: '/dashboard/teacher',
    student: '/dashboard/student',
    family_student: '/dashboard/family',
    accountant: '/dashboard/accountant',
    librarian: '/dashboard/librarian'
  };

  const getDashboardPath = (role: string) => {
    const normalizedRole = (role ?? '').toLowerCase() as AccountRole;
    return roleRedirectMap[normalizedRole] ?? '/dashboard';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      // Clear old tokens before login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      const loginEmail = email || selectedAccount?.email || '';
      const loginPassword = password || selectedAccount?.password || '';
      const response = await authService.login({ email: loginEmail, password: loginPassword });

      const token = response?.token;
      const user = response?.user;
      const role = String(user?.role ?? '').toLowerCase();
      const targetRoute = getDashboardPath(role);

      console.log('Login response', response);
      console.log('Token', token);
      console.log('Role', role);
      console.log('Redirecting to', targetRoute);

      if (!token || !user) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate(targetRoute, { replace: true });
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || t('login_error'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md space-y-8 shadow-lg">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{t('welcome')}</p>
          <h1 className="text-3xl font-bold text-text">{t('login_title')}</h1>
          <p className="text-text-secondary">{t('login_description')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-text">{t('select_role')}</label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value as AccountRole)}
              className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition duration-300 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">{t('choose_role')}</option>
              {Object.entries(accounts).map(([role, account]) => (
                <option key={role} value={role}>
                  {account.name} ({t(role)})
                </option>
              ))}
            </select>
            <p className="text-xs text-text-secondary">{t('login_role_help')}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-text">{t('email')}</label>
            <Input
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder={t('login_placeholder_email')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-text">{t('password')}</label>
            <div className="relative">
              <Input
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login_placeholder_password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button type="submit" className="w-full flex items-center justify-center gap-2">
            <LogIn className="h-5 w-5" /> {t('sign_in')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
