import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
//import ChatWidget from './components/ChatWidget.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CustomOrders from './pages/CustomOrders.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

import ProfileLayout from './pages/profile/ProfileLayout.jsx';
import PersonalInfo from './pages/profile/PersonalInfo.jsx';
import Addresses from './pages/profile/Addresses.jsx';
import WalletPage from './pages/profile/WalletPage.jsx';
import Orders from './pages/profile/Orders.jsx';
import OrderDetail from './pages/profile/OrderDetail.jsx';
import MyReviews from './pages/profile/MyReviews.jsx';
import Returns from './pages/profile/Returns.jsx';
import MyCustomRequests from './pages/profile/MyCustomRequests.jsx';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/custom-orders" element={<CustomOrders />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute><ProfileLayout /></ProtectedRoute>}>
            <Route index element={<PersonalInfo />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="reviews" element={<MyReviews />} />
            <Route path="returns" element={<Returns />} />
            <Route path="custom-requests" element={<MyCustomRequests />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {/* <ChatWidget /> */}
    </div>
  );
}

export default App;
