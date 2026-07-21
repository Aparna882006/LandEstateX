import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PropertyCard from '../../components/property/PropertyCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { getWishlist } from '../../services/wishlist.service';

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await getWishlist();
        setItems(data.data.items);
      } catch (err) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-0">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-28">
        <h1 className="mb-6 text-2xl font-semibold text-neutral-900">
          Your Wishlist {!loading && `(${items.length})`}
        </h1>

        {loading && <Loader count={4} />}

        {!loading && items.length === 0 && (
          <EmptyState
            icon={<FiHeart size={20} />}
            title="Your wishlist is empty"
            description="Save properties you're interested in to compare them later and get notified of price changes."
            action={
              <Button as={Link} to="/properties" variant="primary" size="sm">
                Start Exploring Properties
              </Button>
            }
          />
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <PropertyCard
                key={item.wishlist_id}
                property={item.property}
                initialWishlisted={true}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;