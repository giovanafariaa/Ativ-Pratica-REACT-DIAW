export default function ProductCard({ product, onViewDetails }) {
  return (
    <article className="product-card">
      <h2>{product.descricao}</h2>
      <p>{product.categoria}</p>
      <strong>
        {product.preco.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })}
      </strong>
      <button type="button" onClick={() => onViewDetails(product.id)}>
        Ver detalhes
      </button>
    </article>
  );
}
