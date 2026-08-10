import React, { useEffect, useState } from 'react';
import { Calendar, Fingerprint, Github, Link2, Link2Off, RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { OAuthLink } from '../types';
import { oauthLinksService } from '../services/oauthLinks';
import { DataTable } from '../components/common/DataTable';
import { SearchBubble, SearchFieldOption } from '../components/common/SearchBubble';
import { Modal } from '../components/common/Modal';

const GoogleIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const OAUTH_SEARCH_FIELDS: SearchFieldOption[] = [
  { key: 'id', label: 'ID' },
  { key: 'provider_id', label: 'Provider ID' },
];
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { FormField } from '../components/common/FormField';
import { formatDate } from '../lib/utils';
import { getErrorMessage } from '../services/apiClient';

export const OAuthLinksPage: React.FC = () => {
  const [links, setLinks] = useState<OAuthLink[]>([]);
  const [searchField, setSearchField] = useState<string>('id');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

  // Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [unlinkingItem, setUnlinkingItem] = useState<OAuthLink | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Link Form State
  const [accountId, setAccountId] = useState('');
  const [provider, setProvider] = useState('google');
  const [providerUserId, setProviderUserId] = useState('');

  const fetchLinks = async (p = page, l = limit) => {
    setIsLoading(true);
    setError(null);
    try {
      if (searchValue.trim()) {
        const res = await oauthLinksService.queryOAuthLinks(searchField, searchValue.trim(), p, l);
        setLinks(res.items);
        setTotalCount(res.total);
      } else {
        const res = await oauthLinksService.listLinks(p, l);
        setLinks(res.items);
        setTotalCount(res.total);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch OAuth provider links'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuerySubmit = () => {
    setPage(1);
    fetchLinks(1, limit);
  };

  const handleResetSearch = () => {
    setSearchValue('');
    setPage(1);
    oauthLinksService.listLinks(1, limit).then((res) => {
      setLinks(res.items);
      setTotalCount(res.total);
    });
  };

  useEffect(() => {
    fetchLinks(page, limit);
  }, [page, limit]);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !providerUserId) {
      toast.error('Account ID and Provider User ID are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await oauthLinksService.createLink({
        account_id: accountId,
        provider,
        provider_user_id: providerUserId,
      });
      toast.success('OAuth provider linked successfully');
      setIsLinkModalOpen(false);
      setAccountId('');
      setProviderUserId('');
      fetchLinks();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to link provider'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlinkConfirm = async () => {
    if (!unlinkingItem) return;
    setIsSubmitting(true);
    try {
      await oauthLinksService.deleteLink({
        account_id: unlinkingItem.account_id,
        provider: unlinkingItem.provider,
      });
      toast.success('OAuth link removed successfully');
      setUnlinkingItem(null);
      fetchLinks();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to unlink provider'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeLinks = Array.isArray(links) ? links : [];

  const columns = [
    {
      header: 'Link Identity',
      sortable: true,
      accessorKey: 'id' as const,
      cell: (item: OAuthLink) => {
        const linkId = item.id || item.account_id;
        const accountId = item.account_id;
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Link2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Link ID
                </span>
                <span className="font-mono text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800/80 px-1.5 py-0.5 rounded border border-gray-200/80 dark:border-gray-700/60">
                  #{linkId}
                </span>
              </div>
              {accountId && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-indigo-400 dark:text-indigo-400/80 uppercase tracking-wider">
                    Account
                  </span>
                  <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {accountId}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'OAuth Provider',
      sortable: true,
      accessorKey: 'provider' as const,
      cell: (item: OAuthLink) => {
        const prov = String(item.provider || '').toLowerCase();
        const isGoogle = prov === 'google';
        const isGithub = prov === 'github';

        return (
          <div className="inline-flex items-center">
            {isGoogle && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-2xs">
                <GoogleIcon />
                <span>Google</span>
              </span>
            )}
            {isGithub && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 border border-gray-800 dark:border-white shadow-2xs">
                <Github className="w-3.5 h-3.5 shrink-0" />
                <span>GitHub</span>
              </span>
            )}
            {!isGoogle && !isGithub && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{item.provider}</span>
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Provider User ID',
      sortable: true,
      accessorKey: 'provider_user_id' as const,
      cell: (item: OAuthLink) => (
        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 font-mono text-xs font-medium text-gray-800 dark:text-gray-200">
          <Fingerprint className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate max-w-[220px]" title={item.provider_user_id}>
            {item.provider_user_id}
          </span>
        </div>
      ),
    },
    {
      header: 'Linked At',
      sortable: true,
      accessorKey: 'created_at' as const,
      cell: (item: OAuthLink) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{formatDate(item.created_at)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="OAuth Links"
        description="Manage connected social authentication provider accounts linked to local user identity records."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLinks}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Link2 className="w-4 h-4" />
              Link Provider Account
            </button>
          </div>
        }
      />

      {/* Query Search Bubble */}
      <div className="w-full">
        <SearchBubble
          fields={OAUTH_SEARCH_FIELDS}
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
        data={safeLinks}
        columns={columns}
        isLoading={isLoading}
        error={error}
        emptyTitle="No OAuth provider links"
        emptyDescription="No social logins (Google/GitHub) have been linked to accounts yet."
        onRefresh={() => fetchLinks(page, limit)}
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
            onClick={() => setUnlinkingItem(item)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all shadow-2xs"
            title="Unlink Provider Account"
          >
            <Link2Off className="w-3.5 h-3.5" />
            <span>Unlink</span>
          </button>
        )}
      />

      {/* Modal: Manual Link Provider */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Link Social Provider"
        description="Manually attach an external OAuth provider user ID to an account."
      >
        <form onSubmit={handleCreateLink} className="space-y-4">
          <FormField label="Target Account ID" required hint="e.g. acc_01h8x8k9z01">
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="acc_01h8x8k9z01"
              required
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-gray-900 dark:text-white"
            />
          </FormField>

          <FormField label="Provider Name" required>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
            >
              <option value="google">Google</option>
              <option value="github">GitHub</option>
            </select>
          </FormField>

          <FormField label="Provider User ID" required hint="Unique sub/ID string from Google or GitHub">
            <input
              type="text"
              value={providerUserId}
              onChange={(e) => setProviderUserId(e.target.value)}
              placeholder="google_108239102830"
              required
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-gray-900 dark:text-white"
            />
          </FormField>

          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {isSubmitting ? 'Linking...' : 'Create OAuth Link'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Unlink Dialog */}
      <ConfirmDialog
        isOpen={!!unlinkingItem}
        onClose={() => setUnlinkingItem(null)}
        onConfirm={handleUnlinkConfirm}
        title="Unlink OAuth Provider"
        description={`Are you sure you want to disconnect ${unlinkingItem?.provider} for account ID ${unlinkingItem?.account_id}?`}
        confirmText="Unlink Provider"
        isDestructive
        isLoading={isSubmitting}
      />
    </div>
  );
};
