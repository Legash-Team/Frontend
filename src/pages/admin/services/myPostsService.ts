import axiosInstance from '@/api/axiosInstance';

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

export interface MyPostsService {
  getMyPosts(): Promise<MockEvent[]>;
}

export const myPostsService: MyPostsService = {
  async getMyPosts(): Promise<MockEvent[]> {
    const response = await axiosInstance.get<{ success: boolean; events: MockEvent[] }>('/api/admin/events/mine');
    return response.data?.events || [];
  },
};

export default myPostsService;
