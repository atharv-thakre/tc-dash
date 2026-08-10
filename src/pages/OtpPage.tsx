import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, Plus, RefreshCw, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CreateOTPResponse, OTPPurpose, OTPRecord } from '../types';
import { otpService } from '../services/otp';
import { DataTable } from '../components/common/DataTable';
import { SearchBubble, SearchFieldOption } from '../components/common/SearchBubble';
import { Modal } from '../components/common/Modal';

const OTP_SEARCH_FIELDS: SearchFieldOption[] = [
  { key: 'identifier', label: 'Identifier' },
];
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { FormField } from '../components/common/FormField';
import { formatDate, maskSecret } from '../lib/utils';
import { getErrorMessage } from '../services/apiClient';

export const OtpPage: React.FC = () => {
  const [records, setRecords] = useState<OTPRecord[]>([]);
  const [searchField, setSearchField] = useState<string>('identifier');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

  // Dialog & Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [revokingItem, setRevokingItem] = useState<OTPRecord | null>(null);
  const [createdOTPResult, setCreatedOTPResult] = useState<CreateOTPResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [identifier, setIdentifier] = useState('');
  const [purpose, setPurpose] = useState<OTPPurpose>('login');
  const [expiresSeconds, setExpiresSeconds] = useState(600); // default 10 mins

  const fetchRecords = async (p = page, l = limit, searchOverride?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const q = searchOverride !== undefined ? searchOverride : searchValue;
      if (q.trim()) {
        const res = await otpService.queryOTPRecords(searchField, q.trim(), p, l);
        setRecords(res.items);
        setTotalCount(res.total);
      } else {
        const res = await otpService.listRecords(p, l);
        setRecords(res.items);
        setTotalCount(res.total);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch OTP records'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuerySubmit = () => {
    setPage(1);
    fetchRecords(1, limit);
  };

  const handleResetSearch = () => {
    setSearchValue('');
    setPage(1);
    fetchRecords(1, limit, '');
  };

  useEffect(() => {
    fetchRecords(page, limit);
  }, [page, limit]);

  const handleCreateOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast.error('Identifier is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await otpService.createOTP({
        identifier,
        purpose,
        expiry: expiresSeconds,
      });
      setCreatedOTPResult(res);
      toast.success('OTP code generated successfully');
      fetchRecords();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to generate OTP'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeSingle = async () => {
    if (!revokingItem) return;
    setIsSubmitting(true);
    try {
      await otpService.deleteOTP({
        identifier: revokingItem.identifier,
        purpose: revokingItem.purpose,
      });
      toast.success('OTP record revoked');
      setRevokingItem(null);
      fetchRecords();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to revoke OTP'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCleanupExpired = async () => {
    setIsSubmitting(true);
    try {
      const res = await otpService.cleanupExpired();
      toast.success(`Cleaned up ${res?.count ?? 0} expired OTP records`);
      fetchRecords();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to cleanup expired records'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    setIsSubmitting(true);
    try {
      await otpService.clearAll();
      toast.success('All OTP records cleared');
      setIsClearAllOpen(false);
      fetchRecords();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to clear OTP records'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeRecords = Array.isArray(records) ? records : [];

  const columns = [
    {
      header: 'Identifier / ID',
      sortable: true,
      accessorKey: 'identifier' as const,
      cell: (item: OTPRecord) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white block">
              {item.identifier}
            </span>
            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/80 px-1.5 py-0.5 rounded border border-gray-200/60 dark:border-gray-700/50 inline-block">
              #{item.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Purpose',
      sortable: true,
      accessorKey: 'purpose' as const,
      cell: (item: OTPRecord) => {
        const purp = item.purpose.toLowerCase();
        return (
          <Badge
            variant={
              purp === 'login'
                ? 'info'
                : purp === 'signup'
                ? 'success'
                : purp === 'reset'
                ? 'warning'
                : 'neutral'
            }
          >
            {item.purpose}
          </Badge>
        );
      },
    },
    {
      header: 'Hash & Attempts',
      sortable: true,
      accessorKey: 'attempts' as const,
      cell: (item: OTPRecord) => (
        <div>
          <span className="font-mono text-xs text-gray-400 block">{maskSecret(item.code_hash, 8)}</span>
          <span className="text-[10px] text-gray-500">Attempts: {item.attempts}</span>
        </div>
      ),
    },
    {
      header: 'Expiry Status',
      sortable: true,
      accessorKey: 'expires_at' as const,
      cell: (item: OTPRecord) => {
        const isExpired = new Date(item.expires_at).getTime() < Date.now();
        return (
          <div>
            <Badge variant={isExpired ? 'danger' : 'success'}>
              {isExpired ? 'Expired' : 'Valid'}
            </Badge>
            <p className="text-[10px] font-mono text-gray-400 mt-0.5">{formatDate(item.expires_at)}</p>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="OTP Verification Records"
        description="Monitor generated OTP challenge hashes, issue new one-time passcodes, and clean up expired challenge records."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRecords(page, limit)}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setCreatedOTPResult(null);
                setIdentifier('');
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate OTP
            </button>
            <button
              onClick={handleCleanupExpired}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              Cleanup Expired
            </button>
            <button
              onClick={() => setIsClearAllOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
            >
              Clear All Records
            </button>
          </div>
        }
      />

      {/* Query Search Bubble */}
      <div className="w-full">
        <SearchBubble
          fields={OTP_SEARCH_FIELDS}
          activeFieldKey={searchField}
          onFieldChange={(key) => setSearchField(key)}
          searchValue={searchValue}
          onSearchValueChange={(val) => setSearchValue(val)}
          onSearchSubmit={handleQuerySubmit}
          onReset={handleResetSearch}
          isLoading={isLoading}
        />
      </div>

      <DataTable
        data={safeRecords}
        columns={columns}
        isLoading={isLoading}
        error={error}
        emptyTitle="No OTP records found"
        emptyDescription="No one-time passcode verification challenges are registered."
        onRefresh={() => fetchRecords(page, limit)}
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        actions={(item) => (
          <button
            onClick={() => setRevokingItem(item)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-semibold text-xs inline-flex items-center gap-1 transition-colors"
            title="Revoke OTP"
          >
            <Trash2 className="w-4 h-4" />
            Revoke
          </button>
        )}
      />

      {/* Modal: Create OTP */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setCreatedOTPResult(null);
        }}
        title="Generate New OTP Challenge"
        description="Creates a sensitive one-time passcode challenge. The generated plaintext code is displayed ONCE."
      >
        {!createdOTPResult ? (
          <form onSubmit={handleCreateOTP} className="space-y-4">
            <FormField label="Identifier (Email / Phone)" required hint="Target recipient identifier">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="user@example.com"
                required
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
              />
            </FormField>

            <FormField label="Challenge Purpose" required>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as OTPPurpose)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
              >
                <option value="login">login</option>
                <option value="signup">signup</option>
                <option value="reset">reset</option>
              </select>
            </FormField>

            <FormField label="Expiration Duration (Seconds)" required hint="Standard default is 600 seconds (10 mins)">
              <input
                type="number"
                value={expiresSeconds}
                onChange={(e) => setExpiresSeconds(Number(e.target.value))}
                min={30}
                max={86400}
                required
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
              />
            </FormField>

            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                {isSubmitting ? 'Generating...' : 'Generate OTP'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider block mb-1">Generated Plaintext OTP Code</span>
              <span className="font-mono text-3xl font-extrabold tracking-widest text-gray-900 dark:text-white my-2 block">
                {createdOTPResult.otp}
              </span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Expires at: <span className="font-mono">{formatDate(createdOTPResult.expires_at)}</span>
              </p>
            </div>
            <p className="text-xs text-rose-500 font-medium">
              Important: This raw code will not be displayed again. Only the bcrypt hash is persisted in the database.
            </p>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setCreatedOTPResult(null);
                  setIsCreateOpen(false);
                }}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Revoke Single Dialog */}
      <ConfirmDialog
        isOpen={!!revokingItem}
        onClose={() => setRevokingItem(null)}
        onConfirm={handleRevokeSingle}
        title="Revoke OTP Record"
        description={`Are you sure you want to revoke the active OTP challenge for identifier ${revokingItem?.identifier}?`}
        confirmText="Revoke OTP"
        isDestructive
        isLoading={isSubmitting}
      />

      {/* Clear All Dialog */}
      <ConfirmDialog
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All OTP Records"
        description="This will permanently purge all pending and historical OTP records from the database."
        confirmText="Clear All OTPs"
        isDestructive
        isLoading={isSubmitting}
      />
    </div>
  );
};
