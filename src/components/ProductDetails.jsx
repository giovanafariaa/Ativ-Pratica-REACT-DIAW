export default function ProductDetails({ product, loading, error, onClose }) {
  return (
    <section className="product-details" aria-label="Detalhes do produto">
      <button type="button" onClick={onClose}>Fechar detalhes</button>
      {loading && <p role="status">Carregando detalhes...</p>}
      {error && <p role="alert" className="error">{error}</p>}
      {!loading && !error && product && (
        <>
          <h2>{product.descricao}</h2>
          <p>Código: {product.id}</p>
          <p>Categoria: {product.categoria}</p>
          <p>Estoque: {product.estoque} unidade(s)</p>
          <p>Preço: {product.preco.toLocaleString('pt-BR', {
            style: 'currency', currency: 'BRL',
          })}</p>
        </>
      )}
    </section>
  );
}
