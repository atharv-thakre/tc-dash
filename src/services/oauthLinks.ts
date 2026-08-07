import { CreateOAuthLinkInput, DeleteOAuthLinkInput, OAuthLink } from '../types';
import { apiClient, getStoredApiMode } from './apiClient';
import { INITIAL_OAUTH_LINKS } from './mockData';

const DEMO_OAUTH_LINKS_KEY = 'tc_auth_demo_oauth_links';

function getDemoOAuthLinks(): OAuthLink[] {
  const data = localStorage.getItem(DEMO_OAUTH_LINKS_KEY);
  if (!data) {
    localStorage.setItem(DEMO_OAUTH_LINKS_KEY, JSON.stringify(INITIAL_OAUTH_LINKS));
    return INITIAL_OAUTH_LINKS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_OAUTH_LINKS;
  }
}

function saveDemoOAuthLinks(links: OAuthLink[]) {
  localStorage.setItem(DEMO_OAUTH_LINKS_KEY, JSON.stringify(links));
}

export const oauthLinksService = {
  // GET /oauth/
  async listLinks(): Promise<OAuthLink[]> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getDemoOAuthLinks();
    }
    const res = await apiClient.get<OAuthLink[]>('/oauth/');
    return res.data;
  },

  // POST /oauth/
  async createLink(input: CreateOAuthLinkInput): Promise<OAuthLink> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const links = getDemoOAuthLinks();
      const newLink: OAuthLink = {
        id: `lnk_${Date.now()}`,
        account_id: input.account_id,
        provider: input.provider,
        provider_user_id: input.provider_user_id,
        created_at: new Date().toISOString(),
      };
      links.unshift(newLink);
      saveDemoOAuthLinks(links);
      return newLink;
    }
    const res = await apiClient.post<OAuthLink>('/oauth/', input);
    return res.data;
  },

  // DELETE /oauth/
  async deleteLink(input: DeleteOAuthLinkInput): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      let links = getDemoOAuthLinks();
      links = links.filter(
        (l) => !(l.account_id === input.account_id && l.provider.toLowerCase() === input.provider.toLowerCase())
      );
      saveDemoOAuthLinks(links);
      return null;
    }
    const res = await apiClient.delete('/oauth/', { data: input });
    return res.data;
  },
};
