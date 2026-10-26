export default function ProductSearch({ value, onSearchChange }) {
  return (
    <div className="search-box">
      <label htmlFor="product-search">Pesquisar produto</label>
      <input
        id="product-search"
        type="search"
        placeholder="Digite o nome do produto"
        value={value}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  );
}
