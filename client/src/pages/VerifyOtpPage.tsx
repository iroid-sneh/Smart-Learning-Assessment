import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Mail } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const defaultEmail = (location.state as { email?: string } | null)?.email || '';

  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 4) {
      setError('Please enter your email and valid 4-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data?.success) {
        const user = res.data.data.user;
        const token = res.data.data.token;
        login(user, token);
        navigate(`/${user.role}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex bg-blue-600 p-4 rounded-2xl shadow-lg mb-4 text-white">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Verify OTP</h1>
          <p className="text-slate-500 mt-2">Enter the OTP sent to your email.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleVerify} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <input
              type="text"
              placeholder="4-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-3 text-center text-lg tracking-[0.35em] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <Button type="submit" className="w-full justify-center" size="lg" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already verified?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Go to Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
