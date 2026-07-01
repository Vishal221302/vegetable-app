export const theme = {
  colors: {
    primary: '#01B763', // Emerald green from design
    primaryLight: '#E6F8EF',
    secondary: '#FF7A00', // Orange for banners
    background: '#FAFAFA', // Light grey/white
    surface: '#FFFFFF',
    text: '#1C1C28', // Dark text
    textLight: '#8F92A1', // Light grey text
    border: '#F0F0F0',
    error: '#FF3B30',
    success: '#01B763',
    headerDark: '#0B151F',
    bannerOrange: '#FF8A00',
    bannerRed: '#FF4B4B',
    bannerLight: '#F3F4F0',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    round: 50,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700', color: '#1C1C28' },
    h2: { fontSize: 22, fontWeight: '700', color: '#1C1C28' },
    h3: { fontSize: 18, fontWeight: '700', color: '#1C1C28' },
    title: { fontSize: 16, fontWeight: '600', color: '#1C1C28' },
    body: { fontSize: 14, color: '#1C1C28' },
    caption: { fontSize: 12, color: '#8F92A1' },
    small: { fontSize: 10, color: '#8F92A1' },
  }
};

export const getDiscountedPrice = (price, tag) => {
  if (price === undefined || price === null) return 0;
  if (tag && typeof tag === 'string') {
    const match = tag.match(/(\d+)\s*%/);
    if (match) {
      const percentage = parseInt(match[1], 10);
      if (!isNaN(percentage) && percentage > 0 && percentage <= 100) {
        return price * (1 - percentage / 100);
      }
    }
  }
  return price;
};
