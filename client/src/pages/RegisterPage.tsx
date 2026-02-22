import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, User, Lock, Mail, Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
      });

      if (res.data.success) {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex bg-blue-600 p-4 rounded-2xl shadow-lg mb-4 text-white">
          <GraduationCap size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
        <p className="text-slate-500 mt-2">
          Join Smart Learn academic portal
        </p>
      </div>

      {/* Register Card */}
      <Card className="p-8">
        <form onSubmit={handleRegister} className="space-y-6">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            {(['student', 'faculty'] as const).map(r => <button key={r} type="button" onClick={() => setRole(r)} className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {r}
            </button>)}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-4">
            <Input name="name" value={formData.name} onChange={handleChange} icon={<User className="w-5 h-5" />} placeholder="Full Name" required />
            <Input name="email" value={formData.email} onChange={handleChange} icon={<Mail className="w-5 h-5" />} type="email" placeholder="Email address" required />
            <Input name="password" value={formData.password} onChange={handleChange} icon={<Lock className="w-5 h-5" />} type="password" placeholder="Password" required minLength={6} />
            <Input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} icon={<Lock className="w-5 h-5" />} type="password" placeholder="Confirm Password" required />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full justify-center" size="lg" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <Shield size={14} />
        <span>Secure Academic Portal System</span>
      </div>
    </div>
  </div>;
}