import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isArabicPath, toArPath, toEnPath, hasArabic } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { pathname } = useLocation();
  const arabic = isArabicPath(pathname);
  if (!arabic && !hasArabic(pathname)) return null;
  return arabic ? (
    <Link to={toEnPath(pathname)} lang="en" className="h-11 px-3 inline-flex items-center rounded-full text-sm font-medium text-[#1D71B8] hover:bg-slate-100">English</Link>
  ) : (
    <Link to={toArPath(pathname)} lang="ar" className="h-11 px-3 inline-flex items-center rounded-full text-sm font-medium text-[#1D71B8] hover:bg-slate-100">العربية</Link>
  );
}