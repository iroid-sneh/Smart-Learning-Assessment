import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Lock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import {
  validateRequired,
  validatePassword,
  extractApiError,
} from '../utils/validation';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Errors = Partial<Record<'currentPassword' | 'newPassword' | 'confirmPassword' | 'form', string>>;

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const resetAll = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setSubmitting(false);
    setDone(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const validate = (): Errors => {
    const next: Errors = {};
    next.currentPassword = validateRequired(currentPassword, 'Current password');
    next.newPassword = validatePassword(newPassword);
    if (!next.newPassword && newPassword === currentPassword) {
      next.newPassword = 'New password must be different from your current password.';
    }
    if (!confirmPassword) {
      next.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword && confirmPassword !== newPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }
    return next;
  };

  const handleSubmit = async () => {
    const next = validate();
    setErrors(next);
    if (next.currentPassword || next.newPassword || next.confirmPassword) return;

    setSubmitting(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setDone(true);
    } catch (err: any) {
      const msg = extractApiError(err, 'Could not change your password. Please try again.');
      // Map common server errors back to the correct field for a precise UX.
      if (/current password/i.test(msg)) {
        setErrors({ currentPassword: msg });
      } else if (/different from your current/i.test(msg) || /same/i.test(msg)) {
        setErrors({ newPassword: msg });
      } else {
        setErrors({ form: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={done ? 'Password Updated' : 'Change Password'}>
      {done ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Password changed successfully.</p>
              <p className="text-sm text-green-700 mt-1">
                Use your new password the next time you sign in.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleClose}>Done</Button>
          </div>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          noValidate
        >
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.form}
            </div>
          )}
          <Input
            label="Current Password"
            type="password"
            icon={<Lock className="w-4 h-4" />}
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); if (errors.currentPassword) setErrors(prev => ({ ...prev, currentPassword: '' })); }}
            error={errors.currentPassword}
            maxLength={128}
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
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" type="button" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} disabled={submitting}>
              Update Password
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
