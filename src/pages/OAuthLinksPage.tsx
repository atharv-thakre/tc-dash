import React, { useEffect, useState } from 'react';
import { Link2, Link2Off, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { OAuthLink } from '../types';
import { oauthLinksService } from '../services/oauthLinks';
import { DataTable } from '../components/common/DataTable';
import { SearchBar } from '../components/common/SearchBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { FormField } from '../components/common/FormField';
import { formatDate } from '../lib/utils';
import { getErrorMessage } from '../services/apiClient';

export const OAuthLinksPage: React.FC = () => {
  const [links, setLinks] = useState<OAuthLink[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [unlinkingItem, setUnlinkingItem] = useState<OAuthLink | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Link Form State
  const [accountId, setAccountId] = useState('');
  const [provider, setProvider] = useState('google');
  const [providerUserId, setProviderUserId] = useState('');

  const fetchLinks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await oauthLinksService.listLinks();
      setLinks(data);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch OAuth provider links'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

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
  const filtered = safeLinks.filter(
    (l) =>
      String(l.account_id ?? '').toLowerCase().includes(search.toLowerCase()) ||
      String(l.provider ?? '').toLowerCase().includes(search.toLowerCase()) ||
      String(l.provider_user_id ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Account ID',
      sortable: true,
      accessorKey: 'account_id' as const,
      cell: (item: OAuthLink) => (
        <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{item.account_id}</span>
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

      <div className="flex items-center justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by account ID or provider user ID..." />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        error={error}
        emptyTitle="No OAuth provider links"
        emptyDescription="No social logins (Google/GitHub) have been linked to accounts yet."
        onRefresh={fetchLinks}
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
