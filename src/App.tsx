import { Routes, Route } from 'react-router';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';
import ScrollReveal from '@/components/layout/ScrollReveal';
import RouteFocus from '@/components/layout/RouteFocus';
import HomePage from '@/pages/HomePage/HomePage';
import AboutPage from '@/pages/AboutPage/AboutPage';
import ManufacturingPage from '@/pages/ManufacturingPage/ManufacturingPage';
import ProductsPage from '@/pages/ProductsPage/ProductsPage';
import ProductCategoryPage from '@/pages/ProductCategoryPage/ProductCategoryPage';
import CustomOrdersPage from '@/pages/CustomOrdersPage/CustomOrdersPage';
import ContactPage from '@/pages/ContactPage/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';

/**
 * The whole site, without a router: main.tsx wraps it in a BrowserRouter,
 * entry-server.tsx in a StaticRouter for prerendering (scripts/prerender.mjs).
 */
export default function App() {
  return (
    <>
      <ScrollToTop />
      <a href="#main" className="skip-link">Hoppa till innehållet</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/om-oss" element={<AboutPage />} />
          <Route path="/tillverkning" element={<ManufacturingPage />} />
          <Route path="/produkter" element={<ProductsPage />} />
          <Route path="/produkter/:slug" element={<ProductCategoryPage />} />
          <Route path="/specialtillverkning" element={<CustomOrdersPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <ScrollReveal />
      <RouteFocus />
    </>
  );
}
