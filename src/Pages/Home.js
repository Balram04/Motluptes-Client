import React, { useContext } from 'react';
import { PetContext } from '../Context/Context';
import ProductList from '../Components/ProductCard';
import Header from '../Components/Header';
import Categories from '../Components/Categories';
import Services from '../Components/Services';
import Brands from '../Components/Brands';
import '../Styles/Products.css';
import '../Styles/Home.css';

const Home = () => {
  const { products } = useContext(PetContext);

  return (
    <div className="home-container">
      <Header />
      <Categories />

      <section className="products-section">
        <div className="products-header">
          <h1 className="products-title">
            <span className="highlight">Best</span> Seller
          </h1>
          <p className="products-subtitle">Discover our most popular pet products loved by thousands of pet parents</p>
        </div>
        <ProductList products={products.slice(0, 8)} />
      </section>

      <Services />
      <Brands />
    </div>
  );
};

export default Home;
