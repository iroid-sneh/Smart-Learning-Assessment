import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Mail, KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import {
  validateEmail,
  validatePassword,
  extractApiError,
} from '../utils/validation';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

type Step = 'email' | 'reset' | 'done';
type Errors = Partial<Record<'email' | 'otp' | 'newPassword' | 'confirmPassword' | 'form', string>>;

export function ForgotPasswordModal({ isOpen, onClose, initialEmail = '' }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const resetAll = () => {
    setStep('email');
    setEmail(initialEmail);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setSubmitting(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleSendOtp = async () => {
    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setStep('reset');
    } catch (err) {
      setErrors({ form: extractApiError(err, 'Could not send OTP. Please try again.') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    const next: Errors = {};
    if (!otp || otp.trim().length !== 4 || !/^\d{4}$/.test(otp.trim())) {
      next.otp = 'Enter the 4-digit OTP sent to your email.';
    }
    next.newPassword = validatePassword(newPassword);
    if (!confirmPassword) {
      next.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword && confirmPassword !== newPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }
    setErrors(next);
    if (next.otp || next.newPassword || next.confirmPassword) return;

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });
      setStep('done');
    } catch (err) {
      setErrors({ form: extractApiError(err, 'Password reset failed. Please try again.') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setErrors({});
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setErrors({ form: 'A new OTP has been sent to your email.' });
    } catch (err) {
      setErrors({ form: extractApiError(err, 'Could not resend OTP. Please try again.') });
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    step === 'email'
      ? 'Forgot Password'
      : step === 'reset'
      ? 'Reset Password'
      : 'Password Reset';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      {step === 'email' && (
        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}
          noValidate
        >
          <p className="text-sm text-gray-600">
            Enter the email address associated with your account. We'll send you a 4-digit OTP to reset your password.
          </p>
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.form}
            </div>
          )}
          <Input
            label="Email Address"
            type="email"
            icon={<Mail className="w-4 h-4" />}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: '' })); }}
            error={errors.email}
            maxLength={254}
            required
          />
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" type="button" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} disabled={submitting}>
              Send OTP
            </Button>
          </div>
        </form>
      )}

      {step === 'reset' && (
        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); handleReset(); }}
          noValidate
        >
          <p className="text-sm text-gray-600">
            Enter the 4-digit OTP sent to <strong>{email}</strong> and choose a new password.
          </p>
          {errors.form && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              {errors.form}
            </div>
          )}
          <Input
            label="4-digit OTP"
            icon={<KeyRound className="w-4 h-4" />}
            placeholder="1234"
            value={otp}
            maxLength={4}
            inputMode="numeric"
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
              setOtp(digits);
              if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
            }}
            error={errors.otp}
            required
          />
          <div>
            <Input
              label="New Password"
              type="password"
              icon={<Lock className="w-4 h-4" />}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' })); }}
              error={errors.newPassword}
              maxLength={128}
              required
            />
            {!errors.newPassword && (
              <p className="mt-1 text-xs text-gray-500">
                At least 8 characters, including an uppercase letter, a lowercase letter, and a number.
              </p>
            )}
          </div>
          <Input
            label="Confirm New Password"
            type="password"
            icon={<Lock className="w-4 h-4" />}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
            error={errors.confirmPassword}
            maxLength={128}
            required
          />
          <div className="flex items-center justify-between pt-2 text-sm">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              onClick={handleResendOtp}
              disabled={submitting}
            >
              Resend OTP
            </button>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
              onClick={() => { setStep('email'); setErrors({}); }}
              disabled={submitting}
            >
              Change email
            </button>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" type="button" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} disabled={submitting}>
              Reset Password
            </Button>
          </div>
        </form>
      )}

      {step === 'done' && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Password changed successfully.</p>
              <p className="text-sm text-green-700 mt-1">
                You can now sign in with your new password.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleClose}>
              Back to Login
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
