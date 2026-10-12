/**
 * Mock My Posts Service
 *
 * TEMPORARY ADAPTER — This service provides mock data for development only.
 * The backend must provide a creator-scoped listing endpoint (e.g.,
 * GET /api/superadmin/events/mine) before this mock can be removed.
 *
 * Requirements for the real backend endpoint:
 * - Must use the authenticated user's identity (req.user.id) server-side.
 * - Must return only events where createdBy matches the authenticated admin.
 * - Must NOT return events created by other administrators or super admins.
 * - Must enforce authorization via the existing permission middleware.
 *
 * DO NOT use the existing GET /api/superadmin/events endpoint for My Posts.
 * That endpoint returns events from ALL creators and is NOT safe for this page.
 *
 * When the confirmed backend contract is available, replace the mock
 * implementation below with a real API call. The interface (MyPostsService)
 * is designed to remain stable so the UI does not need to change.
 */

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  applyLink: string | null;
  closesAt: string;
  createdAt: string;
  status: 'open' | 'closed';
}

/**
 * Simulates a network delay for realistic loading-state testing.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock event records representing posts created by the current administrator.
 * These are fictional development sample data only.
 */
const MOCK_EVENTS: MockEvent[] = [
  {
    id: 'mock-001',
    title: 'Blood Drive — Addis Ababa University',
    description: '<p>Join us for a <strong>community blood drive</strong> at the Addis Ababa University medical campus. All blood types needed, especially O-negative.</p><ul><li>Free health screening</li><li>Refreshments provided</li><li>Certificate of appreciation</li></ul>',
    mediaUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    mediaType: 'image',
    applyLink: 'https://legash.et/events/au-blood-drive',
    closesAt: '2026-10-25T17:00:00.000Z',
    createdAt: '2026-10-01T09:00:00.000Z',
    status: 'open',
  },
  {
    id: 'mock-002',
    title: 'Emergency O-Negative Appeal — St. Paul Hospital',
    description: '<p>St. Paul Hospital urgently needs <strong>O-negative blood</strong> for an ongoing surgical procedure. If you are O-negative and able to donate, please respond immediately.</p>',
    mediaUrl: null,
    mediaType: null,
    applyLink: null,
    closesAt: '2026-10-15T12:00:00.000Z',
    createdAt: '2026-10-08T14:30:00.000Z',
    status: 'open',
  },
  {
    id: 'mock-003',
    title: 'Regional Blood Collection — Hawassa',
    description: '<p>We are expanding our donor network to the <strong>Sidama region</strong>. This event targets first-time donors and provides education on the importance of regular blood donation.</p><blockquote>One donation can save up to three lives.</blockquote>',
    mediaUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
    mediaType: 'image',
    applyLink: 'https://legash.et/events/hawassa-drive',
    closesAt: '2026-10-05T18:00:00.000Z',
    createdAt: '2026-09-20T10:00:00.000Z',
    status: 'closed',
  },
];

/**
 * Service interface for fetching the current administrator's posts.
 * Replace the mock implementation with a real API call when the
 * backend creator-scoped endpoint is available.
 */
export interface MyPostsService {
  getMyPosts(): Promise<MockEvent[]>;
}

/**
 * Mock implementation of MyPostsService.
 * Returns simulated data after a short delay.
 */
export const myPostsService: MyPostsService = {
  async getMyPosts(): Promise<MockEvent[]> {
    await delay(800); // Simulate network latency
    return [...MOCK_EVENTS];
  },
};

export default myPostsService;
