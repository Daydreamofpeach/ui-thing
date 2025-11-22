import type { FontInfo, FilterFontCategory, PaginatedFontsResponse } from '~/types/fonts';

interface UseFontSearchParams {
  query: string;
  category?: FilterFontCategory;
  limit?: number;
  enabled?: boolean;
}

export function useGoogleFonts() {
  const fonts = ref<FontInfo[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);
  const hasMore = ref(false);
  const currentOffset = ref(0);

  const searchFonts = async ({
    query = '',
    category = 'all',
    limit = 20,
    offset = 0,
  }: {
    query?: string;
    category?: FilterFontCategory;
    limit?: number;
    offset?: number;
  }) => {
    isLoading.value = true;
    error.value = null;

    try {
      const searchParams = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (category && category !== 'all') {
        searchParams.append('category', category);
      }

      const response = await $fetch<PaginatedFontsResponse>(
        `/api/google-fonts?${searchParams}`
      );

      if (offset === 0) {
        fonts.value = response.fonts;
      } else {
        fonts.value = [...fonts.value, ...response.fonts];
      }

      total.value = response.total;
      hasMore.value = response.hasMore;
      currentOffset.value = response.offset;

      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch fonts';
      console.error('Error fetching fonts:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadMore = async () => {
    if (!hasMore.value || isLoading.value) return;

    const currentQuery = ref(''); // You might want to store this in state
    const currentCategory = ref<FilterFontCategory>('all'); // You might want to store this in state

    await searchFonts({
      query: currentQuery.value,
      category: currentCategory.value,
      offset: currentOffset.value + fonts.value.length,
    });
  };

  const loadFont = (fontFamily: string, variants: string[] = ['400']) => {
    if (import.meta.client) {
      // Create a link element to load the font
      const linkId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
      
      // Check if font is already loaded
      if (document.getElementById(linkId)) {
        return;
      }

      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      
      // Build Google Fonts URL
      const familyParam = fontFamily.replace(/\s+/g, '+');
      // Convert variant strings to weight numbers (e.g., 'regular' -> '400', '700' -> '700')
      const weightMap: Record<string, string> = {
        '100': '100',
        '200': '200',
        '300': '300',
        'regular': '400',
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
        '900': '900',
      };
      const weights = variants
        .map(v => weightMap[v.toLowerCase()] || v)
        .filter(v => /^\d+$/.test(v))
        .join(';');
      
      if (weights) {
        link.href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weights}&display=swap`;
      } else {
        link.href = `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`;
      }
      
      document.head.appendChild(link);
    }
  };

  return {
    fonts,
    isLoading,
    error,
    total,
    hasMore,
    searchFonts,
    loadMore,
    loadFont,
  };
}

