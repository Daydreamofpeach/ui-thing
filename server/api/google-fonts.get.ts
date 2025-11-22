import type { GoogleFontsAPIResponse, FontInfo, PaginatedFontsResponse, FilterFontCategory } from '~/types/fonts';

const GOOGLE_FONTS_API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const GOOGLE_FONTS_API_KEY = config.googleFontsApiKey || '';
  
  const query = getQuery(event);
  const searchQuery = (query.q as string) || '';
  const category = (query.category as FilterFontCategory) || 'all';
  const limit = parseInt((query.limit as string) || '20', 10);
  const offset = parseInt((query.offset as string) || '0', 10);

  try {
    // Fetch all fonts from Google Fonts API
    // Note: Google Fonts API works without a key but has rate limits
    // If API key is provided in .env as GOOGLE_FONTS_API_KEY, use it for higher rate limits
    let apiUrl = `${GOOGLE_FONTS_API_URL}?sort=popularity`;
    
    if (GOOGLE_FONTS_API_KEY && GOOGLE_FONTS_API_KEY.trim() !== '') {
      apiUrl = `${GOOGLE_FONTS_API_URL}?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`;
    }
    
    const response = await $fetch<GoogleFontsAPIResponse>(apiUrl);

    if (!response.items) {
      throw createError({
        statusCode: 500,
        message: 'Invalid response from Google Fonts API',
      });
    }

    // Transform Google Fonts to our FontInfo format
    let fonts: FontInfo[] = response.items.map((font) => ({
      family: font.family,
      category: font.category,
      variants: font.variants,
      variable: !!font.axes && font.axes.length > 0,
    }));

    // Filter by category
    if (category && category !== 'all') {
      fonts = fonts.filter((font) => font.category === category);
    }

    // Filter by search query
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      fonts = fonts.filter((font) =>
        font.family.toLowerCase().includes(queryLower)
      );
    }

    const total = fonts.length;

    // Apply pagination
    const paginatedFonts = fonts.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    const result: PaginatedFontsResponse = {
      fonts: paginatedFonts,
      total,
      offset,
      limit,
      hasMore,
    };

    return result;
  } catch (error: any) {
    console.error('Error fetching Google Fonts:', error);

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch fonts from Google Fonts API',
    });
  }
});

