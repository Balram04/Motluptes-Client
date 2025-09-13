import React, { useState, useEffect, useContext } from 'react';
import ProductList from '../Components/ProductCard';
import { PetContext } from '../Context/Context';

export default function DogFood() {
  const { fetchDogFood } = useContext(PetContext);
  const [dogFood, setDogFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const products = await fetchDogFood();
        setDogFood(products || []);
      } catch (err) {
        console.error('Error in DogFood component:', err);
        setError('Failed to load dog food products');
        setDogFood([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchDogFood]);

  if (loading) {
    return (
      <section className="products d-flex flex-column align-items-center mb-5" style={{ paddingTop: '80px' }}>
        <h1 className="mt-5 text-black fw-bolder">
          <span>Dog</span> Food
        </h1>
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="products d-flex flex-column align-items-center mb-5" style={{ paddingTop: '80px' }}>
        <h1 className="mt-5 text-black fw-bolder">
          <span>Dog</span> Food
        </h1>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="products d-flex flex-column align-items-center mb-5" style={{ paddingTop: '80px' }}>
        <h1 className="mt-5 text-black fw-bolder">
          <span>Dog</span> Food
        </h1>

        <ProductList products={dogFood} />
      </section>
    </>
  );
}
