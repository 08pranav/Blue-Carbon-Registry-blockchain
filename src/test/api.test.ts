import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, ApiError } from '@/lib/api';

const respond = (body: unknown, ok = true, status = 200) =>
  ({ ok, status, json: () => Promise.resolve(body) }) as Response;

describe('api client', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('loads marketplace listings from same-origin /api', async () => {
    fetchMock.mockResolvedValue(respond({ listings: [{ id: 'LST-1', credits: 5 }] }));
    const listings = await api.listListings();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/marketplace/listings');
    expect(listings).toEqual([{ id: 'LST-1', credits: 5 }]);
  });

  it('asks for an NGO\'s own projects by wallet address', async () => {
    fetchMock.mockResolvedValue(respond({ projects: [] }));
    await api.listProjects('NGO', '0xabc');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/projects?role=NGO&userId=0xabc');
  });

  it('sends status updates as JSON PATCH', async () => {
    fetchMock.mockResolvedValue(respond({ project: { id: 'P1' } }));
    await api.setProjectStatus('P1', { status: 'VERIFIED', allocatedCredits: 10, mintTxHash: '0x1' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/projects/P1/status');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toMatchObject({ status: 'VERIFIED', allocatedCredits: 10 });
  });

  it('surfaces the error message returned by the server', async () => {
    fetchMock.mockResolvedValue(respond({ error: 'Only the owning NGO can list' }, false, 403));
    await expect(api.listListings()).rejects.toThrow('Only the owning NGO can list');
  });

  it('explains when the API cannot be reached', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(api.listListings()).rejects.toBeInstanceOf(ApiError);
    await expect(api.listListings()).rejects.toThrow(/Is the backend running/);
  });
});
