import ProductCard from './ProductCard';

export default function ProductList({ products, onViewDetails }) {
  if (products.length === 0) {
    return <p>Nenhum produto encontrado.</p>;
  }

  return (
    <section className="product-grid" aria-label="Lista de produtos">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetails={onViewDetails}
        />
      ))}
    </section>
  );
}
