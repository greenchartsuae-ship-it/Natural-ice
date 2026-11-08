import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { t } from '@/lib/i18n';
import { productNameAr, UNIT_AR } from '@/lib/productNameAr';

export default function LandingProducts({ categories = [], names = [], lang = 'en' }) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['landing-products', categories.join(','), names.join(',')],
    queryFn: async () => {
      const or = [];
      if (categories.length) or.push({ category: { $in: categories } });
      names.forEach((n) => or.push({ name: { $regex: n, $options: 'i' } }));
      const list = await base44.entities.Product.filter({ is_active: true, $or: or }, 'sort_order', 12);
      return list.filter((p) => !p.exclusive_client_email);
    },
  });

  if (isLoading) return <div className="h-40 rounded-2xl bg-slate-50 animate-pulse" />;
  if (!products.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((p) => (
        <Link key={p.id} to="/products" className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="aspect-square bg-slate-50">
            {p.image_url && <img src={p.image_url} alt={`${p.name} ${t(lang, 'altSuffix')}`} className="w-full h-full object-cover" loading="lazy" />}
          </div>
          <div className="p-3">
            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{lang === 'ar' ? productNameAr(p.name) : p.name}</p>
            <p className="text-xs font-bold text-[#1D71B8] mt-0.5">
              {p.price_on_request ? t(lang, 'onRequest') : lang === 'ar' ? `${p.price} درهم / ${UNIT_AR[p.unit] || p.unit}` : `AED ${p.price} / ${p.unit}`}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}