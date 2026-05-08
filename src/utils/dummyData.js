export const categories = [
  { id: '1', name: 'Leafy Greens', image: 'https://cdn-icons-png.flaticon.com/512/2329/2329903.png' },
  { id: '2', name: 'Root Veggies', image: 'https://cdn-icons-png.flaticon.com/512/4603/4603387.png' },
  { id: '3', name: 'Cruciferous', image: 'https://cdn-icons-png.flaticon.com/512/2909/2909873.png' },
  { id: '4', name: 'Alliums', image: 'https://cdn-icons-png.flaticon.com/512/3257/3257989.png' },
  { id: '5', name: 'Gourds', image: 'https://cdn-icons-png.flaticon.com/512/3257/3257850.png' },
  { id: '6', name: 'Mushrooms', image: 'https://cdn-icons-png.flaticon.com/512/2909/2909893.png' },
];

export const products = [
  {
    id: '1',
    name: "Fresh Broccoli",
    price: 4.50,
    pricePer: 'kg',
    category: 'Cruciferous',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&q=80',
    description: 'Fresh and vibrant broccoli heads, rich in vitamins and perfect for steaming, roasting, or adding to your favorite stir-fry.',
    discount: null,
    rating: 4.8,
    time: '15 min',
    kcal: '34 kcal',
  },
  {
    id: '2',
    name: 'Organic Carrots',
    price: 2.20,
    pricePer: 'kg',
    category: 'Root Veggies',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&q=80',
    description: 'Crunchy and sweet organic carrots, handpicked from the farm. Packed with Vitamin A and great for snacking or cooking.',
    discount: 10,
    rating: 4.7,
    time: '10 min',
    kcal: '41 kcal',
  },
  {
    id: '3',
    name: 'Green Spinach',
    price: 1.50,
    pricePer: 'bunch',
    category: 'Leafy Greens',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&q=80',
    description: 'Nutrient-dense green spinach leaves. Excellent source of iron and perfect for salads and healthy smoothies.',
    discount: null,
    rating: 4.9,
    time: '5 min',
    kcal: '23 kcal',
  },
  {
    id: '4',
    name: 'Red Onions',
    price: 3.10,
    pricePer: 'kg',
    category: 'Alliums',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&q=80',
    description: 'Crisp red onions with a mild to sweet flavor. A must-have staple for your kitchen to enhance the taste of any dish.',
    discount: 5,
    rating: 4.6,
    time: '12 min',
    kcal: '40 kcal',
  },
  {
    id: '5',
    name: 'Fresh Tomatoes',
    price: 5.00,
    pricePer: 'kg',
    category: 'Gourds',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80',
    description: 'Juicy, ripe red tomatoes perfect for salads, sauces, or sandwiches. Grown locally and delivered fresh.',
    discount: 15,
    rating: 4.5,
    time: '10 min',
    kcal: '18 kcal',
  },
];

export const banners = [
  { 
    id: '1', 
    badge: 'Farm to Table',
    title: 'Fresh Veggies', 
    subtitle: 'FLAT 20% OFF',
    color: '#01B763', // Green
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80' // Mixed veggies
  },
  { 
    id: '2', 
    badge: 'Organic Certified',
    title: 'Leafy Greens', 
    subtitle: 'BUY 1 GET 1 FREE',
    color: '#FF8A00', // Orange
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80' // Cabbage/lettuce
  },
];
