# Catálogo de Produtos — React + API REST

SPA em React (Vite) que lista, pesquisa e consulta detalhes de produtos de uma API REST Node/Express (`Teste-De-API-Node`).

## Como executar

Pré-requisito: Node.js 18+ (testado com Node 22).

**1. Subir a API** (pasta do projeto da API):

```bash
cd Teste-De-API-Node-main
npm install
npm start          # http://localhost:3000
```

**2. Subir o front-end** (outro terminal):

```bash
cd catalogo-produtos
npm install
npm run dev        # http://localhost:5173
```

### Configuração da API

- A API **não habilita CORS** e o back-end não foi alterado. Por isso o `vite.config.js` define um **proxy**: o navegador chama `http://localhost:5173/produtos` e o Vite repassa para `http://localhost:3000/produtos`.
- `.env` → `VITE_API_URL=` (vazio = usa o proxy). Se a API estiver em outro endereço, use `API_TARGET=http://host:porta npm run dev`.
- Se algum dia a API tiver CORS, basta `VITE_API_URL=http://localhost:3000`. Reinicie o `npm run dev` após mudar o `.env`.

### Contrato real da API (adaptações em relação ao exemplo do roteiro)

| Roteiro (exemplo) | API real |
|---|---|
| `nome` | **`descricao`** (nome do produto) |
| `descricao` (texto longo) | não existe |
| — | **`estoque`** (exibido nos detalhes) |
| erro: `Erro HTTP 404` | corpo `{ "erro": "Produto não encontrado" }` (a mensagem é exibida) |

`GET /produtos` → array · `GET /produtos/:id` → objeto · campos: `id, descricao, preco, categoria, estoque`.

## Árvore de componentes

```
App                      (estados: products, search, loading, error,
│                         selectedId, selectedProduct, detailsLoading, detailsError)
├── Header
├── ProductSearch        (props: value, onSearchChange)
├── ProductList          (props: products, onViewDetails)
│   └── ProductCard      (props: product, onViewDetails) — repetido para cada produto
└── ProductDetails       (props: product, loading, error, onClose) — só se selectedId !== null
```

```
src/
├── main.jsx
├── App.jsx
├── App.css
├── components/  Header, ProductSearch, ProductList, ProductCard, ProductDetails
├── services/    productsApi.js      (fetch: getProducts, getProductById)
└── data/        products.js         (dados locais da Parte 1; não usado após a Parte 2)
```

## Fluxo de dados

`App` concentra o estado e é o único componente que conversa com a API. Ao montar, um `useEffect` chama `getProducts` e guarda o resultado em `products`, controlando `loading` e `error`. `ProductSearch` é um campo controlado: recebe `value` e, a cada digitação, chama `onSearchChange` (o `setSearch` de `App`). `App` calcula `filteredProducts` a partir de `products` e `search` (valor derivado, sem segundo estado) e o envia a `ProductList`, que usa `map` com `key={product.id}` para gerar um `ProductCard` por produto. Ao clicar em "Ver detalhes", `ProductCard` chama `onViewDetails(id)`, callback repassado por `ProductList` e que é o `setSelectedId` de `App`. A mudança de `selectedId` dispara outro `useEffect`, que chama `getProductById` (`GET /produtos/:id`) e preenche `selectedProduct`, `detailsLoading` e `detailsError`. Esses valores descem por props para `ProductDetails`. O botão "Fechar detalhes" chama `onClose` (`closeDetails`), que limpa o estado e remove o painel.

**Props × useState × useEffect:** props levam dados e funções do pai para o filho (somente leitura); `useState` guarda informação que muda e provoca nova renderização; `useEffect` sincroniza o componente com algo externo (aqui, a API), com `AbortController` para cancelar requisições obsoletas.

> Em desenvolvimento o `StrictMode` executa o efeito duas vezes, por isso `GET /produtos` aparece duplicado na aba Rede. Isso é esperado e não ocorre no build de produção.

## Evidências dos testes manuais (Etapa 9)

Executados contra a API real (`Teste-De-API-Node`) com Chromium automatizado (`evidencias/teste-e2e.py`; capturas em `evidencias/`).

| # | Teste | Resultado | Evidência |
|---|---|---|---|
| 1 | Abre sem erros no console | ✅ 0 erros/avisos | — |
| 2 | Produtos carregados da API | ✅ 5 cartões, `GET /produtos` | `01-lista-api.png` |
| 3 | Busca por nome | ✅ "mouse" → 1 produto, contador atualizado | `02-busca-mouse.png` |
| 4 | Mensagem de lista vazia | ✅ "xyz" → "Nenhum produto encontrado." | `03-lista-vazia.png` |
| 5 | Falha na API exibe erro | ✅ servidor parado → mensagem em `role="alert"` (o proxy responde "Erro HTTP 502") | `06-api-fora-do-ar.png` |
| 6 | "Ver detalhes" consulta por ID | ✅ `GET /produtos/3` | `04-detalhes.png` |
| 7 | "Fechar detalhes" oculta o painel | ✅ | — |
| 8 | Navegação sem recarregar | ✅ 0 navegações de página | — |
| + | Erro 404 nos detalhes (produto excluído no servidor) | ✅ mostra "Produto não encontrado" | `05-erro-detalhes.png` |

Verificações extras: `npm run build` e `npm run lint` sem erros.
