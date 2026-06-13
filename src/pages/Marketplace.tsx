import React, { useEffect, useMemo, useState } from 'react';
import { Upload, Search, Box, SlidersHorizontal, X } from 'lucide-react';
import { GlassCard, Button } from '@/components/UI';
import ProductCard from '@/components/Marketplace/ProductCard';
import ModelViewer from '@/components/Marketplace/ModelViewer';
import { marketplaceService } from '@/services/api';
import { useStore } from '@/store/useStore';
import { useI18n } from '@/lib/i18n';
import { Link, useNavigate } from 'react-router-dom';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  images: string[];
  modelUrl?: string;
  brand?: string;
  rating: number;
  reviews: any[];
  inStock: boolean;
  seller: {
    id: string;
    name: string;
  };
};

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'demo-sofa',
    name: 'Sofa',
    description: 'Sofa 3D showcase model with interactive preview.',
    price: 29999,
    images: ['/models/previews/demo.svg'],
    modelUrl: '/models/demo.glb',
    brand: 'RISEher Demo',
    rating: 4.5,
    reviews: [],
    inStock: true,
    seller: { id: 'demo-business', name: 'RISEher Demo Seller' },
  },
  {
    id: 'demo-bottle',
    name: 'Bottle',
    description: 'Bottle 3D showcase model with interactive preview.',
    price: 799,
    images: ['/models/previews/demo1.svg'],
    modelUrl: '/models/demo1.glb',
    brand: 'RISEher Demo',
    rating: 4.4,
    reviews: [],
    inStock: true,
    seller: { id: 'demo-business', name: 'RISEher Demo Seller' },
  },
  {
    id: 'demo-plants',
    name: 'Plants',
    description: 'Plants 3D showcase model with interactive preview.',
    price: 1299,
    images: ['/models/previews/demo2.svg'],
    modelUrl: '/models/demo2.glb',
    brand: 'RISEher Demo',
    rating: 4.6,
    reviews: [],
    inStock: true,
    seller: { id: 'demo-business', name: 'RISEher Demo Seller' },
  },
  {
    id: 'demo-lamp',
    name: 'Table Lamp',
    description: 'Table Lamp 3D showcase model with interactive preview.',
    price: 2499,
    images: ['/models/previews/demo3.svg'],
    modelUrl: '/models/demo3.glb',
    brand: 'RISEher Demo',
    rating: 4.5,
    reviews: [],
    inStock: true,
    seller: { id: 'demo-business', name: 'RISEher Demo Seller' },
  },
  {
    id: 'demo-plush',
    name: 'Plush',
    description: 'Plush 3D showcase model with interactive preview.',
    price: 1499,
    images: ['/models/previews/demo4.svg'],
    modelUrl: '/models/demo4.glb',
    brand: 'RISEher Demo',
    rating: 4.3,
    reviews: [],
    inStock: true,
    seller: { id: 'demo-business', name: 'RISEher Demo Seller' },
  },
  {
    id: 'demo-saree',
    name: 'Saree',
    description: 'Saree 3D showcase model with interactive preview.',
    price: 3599,
    images: ['/models/previews/demo5.svg'],
    modelUrl: '/models/demo5.glb',
    brand: 'RISEher Demo',
    rating: 4.7,
    reviews: [],
    inStock: true,
    seller: { id: 'demo-business', name: 'RISEher Demo Seller' },
  },
  {
    id: 'demo-vacuum',
    name: 'Vacuum Cleaner',
    description: 'Home cleaning appliance 3D model for realistic product walkthrough.',
    price: 10999,
    images: ['/models/previews/demo6.svg'],
    modelUrl: '/models/demo6.glb',
    brand: 'RISEher Demo',
    rating: 4.6,
    reviews: [],
    inStock: true,
    seller: { id: 'demo-business', name: 'RISEher Demo Seller' },
  },
];

const Marketplace = () => {
  const { t } = useI18n();
  const { user, addToCart } = useStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [only3DModels, setOnly3DModels] = useState(false);
  const [minRating, setMinRating] = useState('0');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'smart' | 'price_low' | 'price_high' | 'rating' | 'name'>('smart');
  const [selectedModel, setSelectedModel] = useState<{ url: string; title: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchProducts = async (query?: string) => {
    try {
      const response = await marketplaceService.getProducts(undefined, undefined, query || undefined);
      const apiProducts = Array.isArray(response.data) ? response.data : [];
      const nextProducts = apiProducts.length > 0 ? apiProducts : FALLBACK_PRODUCTS;
      setProducts(nextProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts(FALLBACK_PRODUCTS);
    }
  };

  useEffect(() => {
    fetchProducts();
    marketplaceService.getAllBrands()
      .then((response) => setBrands(response.data || []))
      .catch((error) => console.error('Failed to fetch brands:', error));
  }, []);

  const availableBrands = useMemo(() => {
    const fromApi = brands.map((b) => b?.name).filter(Boolean);
    const fromProducts = products.map((p) => p.brand).filter(Boolean) as string[];
    return Array.from(new Set([...fromApi, ...fromProducts])).sort((a, b) => a.localeCompare(b));
  }, [brands, products]);

  const availableCategories = useMemo(() => {
    const categories = products.map((p) => p.category).filter(Boolean) as string[];
    return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const activeFilterCount = useMemo(() => {
    return [
      selectedBrand !== 'all',
      selectedCategory !== 'all',
      inStockOnly,
      only3DModels,
      Number(minRating) > 0,
      minPrice.trim() !== '',
      maxPrice.trim() !== '',
      sortBy !== 'smart',
    ].filter(Boolean).length;
  }, [selectedBrand, selectedCategory, inStockOnly, only3DModels, minRating, minPrice, maxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedBrand('all');
    setSelectedCategory('all');
    setInStockOnly(false);
    setOnly3DModels(false);
    setMinRating('0');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('smart');
  };

  const shownProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const minRatingValue = Number(minRating || '0');
    const minPriceValue = minPrice.trim() === '' ? Number.NEGATIVE_INFINITY : Number(minPrice);
    const maxPriceValue = maxPrice.trim() === '' ? Number.POSITIVE_INFINITY : Number(maxPrice);

    const filtered = products.filter((p) => {
      const matchesSearch = !q || [p.name, p.description, p.brand, p.seller?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));

      const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStock = !inStockOnly || p.inStock;
      const matches3D = !only3DModels || Boolean(p.modelUrl);
      const matchesRating = (p.rating || 0) >= minRatingValue;
      const matchesPrice = p.price >= minPriceValue && p.price <= maxPriceValue;

      return matchesSearch && matchesBrand && matchesCategory && matchesStock && matches3D && matchesRating && matchesPrice;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);

      // Smart ranking: prioritize textual relevance, then quality and availability.
      const smartScore = (product: Product) => {
        const text = `${product.name} ${product.description} ${product.brand || ''} ${product.seller?.name || ''}`.toLowerCase();
        const exact = q && product.name.toLowerCase() === q ? 80 : 0;
        const startsWith = q && product.name.toLowerCase().startsWith(q) ? 35 : 0;
        const includes = q && text.includes(q) ? 20 : 0;
        const ratingScore = (product.rating || 0) * 6;
        const stockBoost = product.inStock ? 6 : -8;
        const modelBoost = product.modelUrl ? 4 : 0;
        return exact + startsWith + includes + ratingScore + stockBoost + modelBoost;
      };

      return smartScore(b) - smartScore(a);
    });
  }, [
    products,
    search,
    selectedBrand,
    selectedCategory,
    inStockOnly,
    only3DModels,
    minRating,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const handleUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.glb')) {
      setUploadError('Only .glb files are supported.');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await marketplaceService.uploadModelBase64(file.name, base64);
      await fetchProducts();
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Failed to upload model. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('marketplace.title')}</h1>
          <p className="text-slate-500">Browse products with 3D model previews.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Upload size={16} />
            {uploading ? 'Uploading...' : t('marketplace.upload')}
            <input
              type="file"
              accept=".glb,model/gltf-binary"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0] || null)}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <GlassCard className="p-4">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, brand, seller, or description"
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className="whitespace-nowrap"
              >
                <SlidersHorizontal size={16} />
                Advanced Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </Button>

              {activeFilterCount > 0 && (
                <Button type="button" variant="ghost" onClick={resetFilters} className="whitespace-nowrap">
                  <X size={16} /> Reset
                </Button>
              )}
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">All brands</option>
                  {availableBrands.map((brandName) => (
                    <option key={brandName} value={brandName}>{brandName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">All categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Minimum rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="0">Any rating</option>
                  <option value="3">3.0+</option>
                  <option value="4">4.0+</option>
                  <option value="4.5">4.5+</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="smart">Smart (recommended)</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Min price (INR)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Max price (INR)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="e.g. 20000"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  id="in-stock-filter"
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <label htmlFor="in-stock-filter" className="text-sm text-slate-700">In-stock only</label>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  id="only-3d-filter"
                  type="checkbox"
                  checked={only3DModels}
                  onChange={(e) => setOnly3DModels(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <label htmlFor="only-3d-filter" className="text-sm text-slate-700">3D models only</label>
              </div>
            </div>
          )}

          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{shownProducts.length}</span> of {products.length} products
          </div>
        </div>
      </GlassCard>

      {uploadError && (
        <GlassCard className="border border-red-200 bg-red-50 text-sm text-red-700">{uploadError}</GlassCard>
      )}

      {shownProducts.length === 0 ? (
        <GlassCard className="p-10 text-center text-slate-500">
          <Box className="mx-auto mb-3" />
          No products found.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {shownProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onView3D={(url) => setSelectedModel({ url, title: product.name })}
            />
          ))}
        </div>
      )}

      <ModelViewer
        isOpen={Boolean(selectedModel)}
        modelUrl={selectedModel?.url || ''}
        title={selectedModel?.title}
        onClose={() => setSelectedModel(null)}
      />

      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => fetchProducts(search)}>Refresh Products</Button>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Collaborated Brands</h2>
          <p className="text-slate-500">Open a brand page to explore its products and flow.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/brands/${encodeURIComponent(brand.name)}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-sm font-semibold text-slate-800">{brand.name}</div>
              <div className="mt-1 text-xs text-slate-500">{brand.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
 
