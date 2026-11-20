import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';
import ScrollReveal from '@/components/layout/ScrollReveal';
import HomePage from '@/pages/HomePage/HomePage';
import AboutPage from '@/pages/AboutPage/AboutPage';
import ManufacturingPage from '@/pages/ManufacturingPage/ManufacturingPage';
import ProductsPage from '@/pages/ProductsPage/ProductsPage';
import ProductCategoryPage from '@/pages/ProductCategoryPage/ProductCategoryPage';
import CustomOrdersPage from '@/pages/CustomOrdersPage/CustomOrdersPage';
import ContactPage from '@/pages/ContactPage/ContactPage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/om-oss" element={<AboutPage />} />
          <Route path="/tillverkning" element={<ManufacturingPage />} />
          <Route path="/produkter" element={<ProductsPage />} />
          <Route path="/produkter/:slug" element={<ProductCategoryPage />} />
          <Route path="/specialtillverkning" element={<CustomOrdersPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
      <ScrollReveal />
    </BrowserRouter>
  );
}
