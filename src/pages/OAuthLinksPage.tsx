import React, { useEffect, useState } from 'react';
import { Link2, Link2Off, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { OAuthLink } from '../types';
import { oauthLinksService } from '../services/oauthLinks';
import { DataTable } from '../components/common/DataTable';
import { SearchBubble, SearchFieldOption } from '../components/common/SearchBubble';
import { Modal } from '../components/common/Modal';

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
      header: 'Link ID / Account ID',
      sortable: true,
      accessorKey: 'id' as const,
      cell: (item: OAuthLink) => (
        <div>
          <span className="font-mono text-xs font-bold text-gray-900 dark:text-white block">
            {item.id || item.account_id}
          </span>
          {item.account_id && (
            <span className="text-xs font-mono font-semibold text-indigo-500 block mt-0.5">
              {item.account_id}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'OAuth Provider',
      sortable: true,
      accessorKey: 'provider' as const,
      cell: (item: OAuthLink) => {
        const isGoogle = String(item.provider || '').toLowerCase() === 'google';
        return (
          <Badge variant={isGoogle ? 'info' : 'neutral'} className="font-semibold uppercase">
            {item.provider}
          </Badge>
        );
      },
    },
    {
      header: 'Provider User ID',
      sortable: true,
      accessorKey: 'provider_user_id' as const,
      cell: (item: OAuthLink) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{item.provider_user_id}</span>
      ),
    },
    {
      header: 'Linked At',
      sortable: true,
      accessorKey: 'created_at' as const,
      cell: (item: OAuthLink) => <span className="text-xs font-mono text-gray-400">{formatDate(item.created_at)}</span>,
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
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-semibold text-xs inline-flex items-center gap-1 transition-colors"
            title="Unlink Provider"
          >
            <Link2Off className="w-4 h-4" />
            Unlink
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
