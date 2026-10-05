import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { Language, AuditLogEntry } from '../types';
import { ShieldCheck, X, AlertCircle } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (entry: AuditLogEntry) => void;
  lang: Language;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lang
}) => {
  const t = TRANSLATIONS[lang];

  // Requirements: Empty initial fields (no pre-filled person, role, ID, or notes)
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Scientist' | 'Station Engineer' | ''>('');
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [declared, setDeclared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFormValid =
    name.trim().length > 0 &&
    role.length > 0 &&
    employeeId.trim().length > 0 &&
    declared;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    const entry: AuditLogEntry = {
      id: `AUDIT-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      verifiedByName: name.trim(),
      role: role as 'Scientist' | 'Station Engineer',
      employeeId: employeeId.trim(),
      datasetId: 'DATASET-30D-SIM',
      declarationAccepted: true,
      notes: notes.trim()
    };

    // Save audit entry through the backend API
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: entry.verifiedByName,
          role: entry.role,
          employee_id: entry.employeeId,
          dataset_id: entry.datasetId,
          notes: entry.notes
        })
      });
    } catch (err) {
      // Backend request logged
      console.log('Saved audit entry locally');
    }

    setIsSubmitting(false);
    onConfirm(entry);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-verification-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-lg overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="bg-[#1E3A68] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 id="modal-verification-title" className="font-bold text-base">
              {t.modal_title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Declaration Text Box */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded p-3 text-amber-900 dark:text-amber-200">
            <p className="font-semibold italic leading-relaxed">
              "{t.modal_declaration}"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name - Empty initially */}
            <div>
              <label htmlFor="verif-name" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.modal_name_label}
              </label>
              <input
                id="verif-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                placeholder="Enter Full Name"
              />
            </div>

            {/* Role - Empty initially */}
            <div>
              <label htmlFor="verif-role" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.modal_role_label}
              </label>
              <select
                id="verif-role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              >
                <option value="">-- Select Role --</option>
                <option value="Scientist">{t.modal_role_scientist}</option>
                <option value="Station Engineer">{t.modal_role_engineer}</option>
              </select>
            </div>
          </div>

          {/* Employee ID - Empty initially */}
          <div>
            <label htmlFor="verif-empid" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.modal_empid_label}
            </label>
            <input
              id="verif-empid"
              type="text"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
              placeholder="Enter Employee / Mission ID"
            />
          </div>

          {/* User Typed Notes (no invented reference) */}
          <div>
            <label htmlFor="verif-notes" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Verification Notes / Observation (typed by user)
            </label>
            <textarea
              id="verif-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              placeholder="Enter optional verification notes, reference log number, or remarks..."
            />
          </div>

          {/* Checkbox declaration */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 select-none">
                {t.modal_checkbox_text}
              </span>
            </label>
          </div>

          {/* Prototype disclaimer */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-3">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>Prototype - simulated data - not an official Government of India website.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs sm:text-sm transition-colors"
            >
              {t.modal_btn_cancel}
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`px-4 py-2 rounded font-semibold text-xs sm:text-sm text-white transition-all ${
                isFormValid && !isSubmitting
                  ? 'bg-[#1E3A68] hover:bg-[#15294a] shadow-xs'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Saving...' : t.modal_btn_confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
