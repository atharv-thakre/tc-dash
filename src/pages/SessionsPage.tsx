import React, { useEffect, useState } from 'react';
import { Globe, Laptop, RefreshCw, ShieldAlert, ShieldOff, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { SessionRecord } from '../types';
import { sessionsService } from '../services/sessions';
import { DataTable } from '../components/common/DataTable';
import { SearchBubble, SearchFieldOption } from '../components/common/SearchBubble';
import { Modal } from '../components/common/Modal';

const SESSION_SEARCH_FIELDS: SearchFieldOption[] = [
  { key: 'account_id', label: 'Account ID' },
  { key: 'id', label: 'Session ID' },
  { key: 'ip_address', label: 'IP Address' },
];
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { FormField } from '../components/common/FormField';
import { formatDate, truncateText } from '../lib/utils';
import { getErrorMessage } from '../services/apiClient';

export const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [searchField, setSearchField] = useState<string>('account_id');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

  // Dialog states
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isCleanupOpen, setIsCleanupOpen] = useState(false);
  const [isRevokeAllAccountOpen, setIsRevokeAllAccountOpen] = useState(false);
  const [targetAccountId, setTargetAccountId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSessions = async (p = page, l = limit) => {
    setIsLoading(true);
    setError(null);
    try {
      if (searchValue.trim()) {
        const res = await sessionsService.querySessions(searchField, searchValue.trim(), p, l);
        setSessions(res.items);
        setTotalCount(res.total);
      } else {
        const res = await sessionsService.listSessions(p, l);
        setSessions(res.items);
        setTotalCount(res.total);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch sessions'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuerySubmit = () => {
    setPage(1);
    fetchSessions(1, limit);
  };

  const handleResetSearch = () => {
    setSearchValue('');
    setPage(1);
    sessionsService.listSessions(1, limit).then((res) => {
      setSessions(res.items);
      setTotalCount(res.total);
    });
  };

  useEffect(() => {
    fetchSessions(page, limit);
  }, [page, limit]);

  const handleRevokeSingle = async () => {
    if (!revokingSessionId) return;
    setIsSubmitting(true);
    try {
      await sessionsService.deleteSession(revokingSessionId);
      toast.success('Session revoked successfully');
      setRevokingSessionId(null);
      fetchSessions();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to revoke session'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeAllForAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccountId) {
      toast.error('Please enter an account ID');
      return;
    }
    setIsSubmitting(true);
    try {
      await sessionsService.deleteAllForAccount(targetAccountId);
      toast.success(`All active sessions revoked for account: ${targetAccountId}`);
      setIsRevokeAllAccountOpen(false);
      setTargetAccountId('');
      fetchSessions();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to revoke account sessions'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCleanupExpired = async () => {
    setIsSubmitting(true);
    try {
      await sessionsService.cleanupExpired();
      toast.success('Expired sessions cleaned up');
      setIsCleanupOpen(false);
      fetchSessions();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to cleanup expired sessions'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    setIsSubmitting(true);
    try {
      await sessionsService.clearAll();
      toast.success('All active system sessions destroyed');
      setIsClearAllOpen(false);
      fetchSessions();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to clear all sessions'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeSessions = Array.isArray(sessions) ? sessions : [];

  const columns = [
    {
      header: 'Session ID / Account ID',
      sortable: true,
      accessorKey: 'id' as const,
      cell: (item: SessionRecord) => (
        <div>
          <span className="font-mono text-xs font-bold text-gray-900 dark:text-white block">{item.id}</span>
          <span className="text-xs font-mono font-semibold text-indigo-500 block mt-0.5">{item.account_id}</span>
        </div>
      ),
    },
    {
      header: 'IP & User Agent',
      sortable: true,
      accessorKey: 'ip_address' as const,
      cell: (item: SessionRecord) => (
        <div className="space-y-0.5">
          <p className="text-xs font-mono text-gray-900 dark:text-gray-200 flex items-center gap-1">
            <Globe className="w-3 h-3 text-gray-400" />
            {item.ip_address || 'Unknown IP'}
          </p>
          <p className="text-[11px] text-gray-400 max-w-xs truncate" title={item.user_agent}>
            {truncateText(item.user_agent || 'Unknown Client', 45)}
          </p>
        </div>
      ),
    },
    {
      header: 'Status & Expiry',
      sortable: true,
      accessorKey: 'expires_at' as const,
      cell: (item: SessionRecord) => {
        const isExpired = new Date(item.expires_at).getTime() < Date.now();
        return (
          <div>
            <Badge variant={isExpired ? 'danger' : 'success'}>
              {isExpired ? 'Expired' : 'Active'}
            </Badge>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{formatDate(item.expires_at)}</p>
          </div>
        );
      },
    },
    {
      header: 'Created At',
      sortable: true,
      accessorKey: 'created_at' as const,
      cell: (item: SessionRecord) => <span className="text-xs font-mono text-gray-400">{formatDate(item.created_at)}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Active Sessions Management"
        description="Inspect active JWT token sessions, track client IP addresses, and revoke single or bulk session credentials."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchSessions}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setIsRevokeAllAccountOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-2xs"
            >
              Revoke Account Sessions
            </button>
            <button
              onClick={() => setIsCleanupOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              Clear Expired
            </button>
            <button
              onClick={() => setIsClearAllOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
            >
              Clear All Sessions
            </button>
          </div>
        }
      />

      {/* Query Search Bubble */}
      <div className="w-full">
        <SearchBubble
          fields={SESSION_SEARCH_FIELDS}
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
        data={safeSessions}
        columns={columns}
        isLoading={isLoading}
        error={error}
        emptyTitle="No active sessions"
        emptyDescription="There are currently no active session records in the system."
        onRefresh={() => fetchSessions(page, limit)}
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
            onClick={() => setRevokingSessionId(item.id)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-semibold text-xs inline-flex items-center gap-1 transition-colors"
            title="Revoke session"
          >
            <ShieldOff className="w-4 h-4" />
            Revoke
          </button>
        )}
      />

      {/* Revoke All Sessions for Account Modal */}
      <Modal
        isOpen={isRevokeAllAccountOpen}
        onClose={() => setIsRevokeAllAccountOpen(false)}
        title="Revoke All Sessions for Account"
        description="Destroys every active session token associated with a specific user account."
      >
        <form onSubmit={handleRevokeAllForAccount} className="space-y-4">
          <FormField label="Account ID" required hint="e.g. acc_01h8x8k9z01">
            <input
              type="text"
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              placeholder="acc_01h8x8k9z01"
              required
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-gray-900 dark:text-white"
            />
          </FormField>

          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsRevokeAllAccountOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              {isSubmitting ? 'Revoking...' : 'Revoke All Sessions'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Revoke Single Session Confirm */}
      <ConfirmDialog
        isOpen={!!revokingSessionId}
        onClose={() => setRevokingSessionId(null)}
        onConfirm={handleRevokeSingle}
        title="Revoke Session Token"
        description={`Are you sure you want to revoke session ID: ${revokingSessionId}? The client will be signed out immediately.`}
        confirmText="Revoke Session"
        isDestructive
        isLoading={isSubmitting}
      />

      {/* Cleanup Expired Confirm */}
      <ConfirmDialog
        isOpen={isCleanupOpen}
        onClose={() => setIsCleanupOpen(false)}
        onConfirm={handleCleanupExpired}
        title="Cleanup Expired Sessions"
        description="Delete all session records whose expiry timestamp has passed. Active client sessions will not be affected."
        confirmText="Cleanup Expired"
        isLoading={isSubmitting}
      />

      {/* Clear All Sessions Confirm */}
      <ConfirmDialog
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All Sessions System-Wide"
        description="CRITICAL ACTION: This will destroy every session token in the entire system, logging out all users immediately."
        confirmText="Clear All Sessions"
        isDestructive
        isLoading={isSubmitting}
      />
    </div>
  );
};
