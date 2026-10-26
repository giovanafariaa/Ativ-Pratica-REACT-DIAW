import { useEffect, useState } from 'react';
import Header from './components/Header';
import ProductSearch from './components/ProductSearch';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import { getProducts, getProductById } from './services/productsApi';
import './App.css';

export default function App() {
  // Lista de produtos e pesquisa
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Detalhes do produto selecionado
  const [selectedId, setSelectedId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  // Carrega a lista ao montar o componente
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const data = await getProducts({ signal: controller.signal });
        if (!Array.isArray(data)) {
          throw new Error('A API não retornou uma lista de produtos.');
        }
        setProducts(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  // Carrega os detalhes sempre que o produto selecionado muda
  useEffect(() => {
    if (selectedId === null) return;

    const controller = new AbortController();

    async function loadDetails() {
      setDetailsLoading(true);
      setDetailsError('');
      setSelectedProduct(null);

      try {
        const data = await getProductById(selectedId, {
          signal: controller.signal,
        });
        setSelectedProduct(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setDetailsError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailsLoading(false);
        }
      }
    }

    loadDetails();
    return () => controller.abort();
  }, [selectedId]);

  function closeDetails() {
    setSelectedId(null);
    setSelectedProduct(null);
    setDetailsError('');
    setDetailsLoading(false);
  }

  // Valor derivado: não precisa de um segundo estado
  const filteredProducts = products.filter((product) =>
    product.descricao.toLocaleLowerCase('pt-BR').includes(
      search.toLocaleLowerCase('pt-BR'),
    ),
  );

  return (
    <main className="container">
      <Header />
      <ProductSearch value={search} onSearchChange={setSearch} />
      {loading && <p role="status">Carregando produtos...</p>}
      {error && <p role="alert" className="error">{error}</p>}
      {!loading && !error && (
        <>
          <p>{filteredProducts.length} produto(s) encontrado(s).</p>
          <ProductList
            products={filteredProducts}
            onViewDetails={setSelectedId}
          />
        </>
      )}
      {selectedId !== null && (
        <ProductDetails
          product={selectedProduct}
          loading={detailsLoading}
          error={detailsError}
          onClose={closeDetails}
        />
      )}
    </main>
  );
}
