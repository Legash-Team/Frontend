import axiosInstance from './axiosInstance';

export interface HelpCenterFaqItem {
  id: string | number;
  question: string;
  answer: string;
  category?: string;
}

export interface GetHelpCenterFaqResponse {
  success?: boolean;
  data?: HelpCenterFaqItem[] | { faqs?: HelpCenterFaqItem[] };
  faqs?: HelpCenterFaqItem[];
  items?: HelpCenterFaqItem[];
}

/**
 * Fetch FAQ data from the backend Help Center endpoint.
 * GET /api/help-center/faq
 * 
 * Rules:
 * - Single source of truth is the backend's data/helpCenterFaq.json.
 * - Dynamically extracts and normalizes FAQ items without hardcoded content.
 */
export const fetchHelpCenterFaqs = async (): Promise<HelpCenterFaqItem[]> => {
  const response = await axiosInstance.get<
    HelpCenterFaqItem[] | GetHelpCenterFaqResponse
  >('/api/help-center/faq');

  const raw = response.data;
  let items: any[] = [];

  if (Array.isArray(raw)) {
    items = raw;
  } else if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.faqs)) {
      items = raw.faqs;
    } else if (Array.isArray(raw.data)) {
      items = raw.data;
    } else if (
      raw.data &&
      typeof raw.data === 'object' &&
      Array.isArray((raw.data as any).faqs)
    ) {
      items = (raw.data as any).faqs;
    } else if (Array.isArray(raw.items)) {
      items = raw.items;
    }
  }

  return items.map((item, index) => ({
    id: item.id || item._id || item.faqId || `faq-${index}`,
    question: item.question || item.q || item.title || 'Frequently Asked Question',
    answer: item.answer || item.a || item.content || item.description || '',
    category: item.category || item.topic || undefined,
  }));
};
