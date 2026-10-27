# Catálogo de Produtos — React + API REST

Aplicação feita em React (Vite) que lista, pesquisa e mostra os detalhes de produtos vindos de uma API REST em Node/Express (`Teste-De-API-Node`).

## Como executar

**Pré-requisito:** Node.js 18 ou superior.

**1. Subir a API** (em um terminal):

```bash
cd Teste-De-API-Node-main
npm install
npm start
```

A API fica em `http://localhost:3000`.

**2. Subir o front-end** (em outro terminal):

```bash
cd catalogo-produtos
npm install
npm run dev
```

O site abre em `http://localhost:5173`.

## Configuração da API

- A API **não tem CORS habilitado** e não foi alterada. Por isso o `vite.config.js` usa um **proxy**: o navegador chama `http://localhost:5173/produtos` e o Vite repassa para `http://localhost:3000/produtos`.
- No arquivo `.env`, `VITE_API_URL=` fica **vazio** para usar o proxy.
- Se a API estiver em outro endereço, rode: `API_TARGET=http://host:porta npm run dev`
- Depois de mudar o `.env`, reinicie o `npm run dev`.

## Dados da API

Endpoints usados:

- `GET /produtos` → lista de produtos
- `GET /produtos/:id` → um produto

Campos de cada produto: `id`, `descricao` (nome do produto), `preco`, `categoria` e `estoque`.

## Árvore de componentes

```
App
├── Header
├── ProductSearch      (props: value, onSearchChange)
├── ProductList        (props: products, onViewDetails)
│   └── ProductCard    (props: product, onViewDetails)
└── ProductDetails     (props: product, loading, error, onClose)
                       só aparece quando há um produto selecionado
```

Estrutura de pastas:

```
src/
├── main.jsx
├── App.jsx
├── App.css
├── components/   Header, ProductSearch, ProductList, ProductCard, ProductDetails
├── services/     productsApi.js   (funções getProducts e getProductById)
└── data/         products.js      (dados locais da Parte 1, não usado depois)
```

## Fluxo de dados

O `App` guarda todos os estados e é o único componente que conversa com a API. Quando a página abre, um `useEffect` chama `getProducts` e salva a lista em `products`, controlando também `loading` e `error`. O `ProductSearch` é um campo controlado: a cada letra digitada ele chama `onSearchChange`, que atualiza o estado `search` no `App`. Com isso, o `App` calcula a lista filtrada e a envia para o `ProductList`, que usa `map` para criar um `ProductCard` para cada produto. Ao clicar em "Ver detalhes", o `ProductCard` chama `onViewDetails(id)`, que atualiza o `selectedId` no `App`. Essa mudança dispara outro `useEffect`, que busca o produto em `GET /produtos/:id` e preenche os estados usados pelo `ProductDetails`. Por fim, o botão "Fechar detalhes" chama `onClose`, que limpa o estado e remove o painel.

**Resumo:**
- **props:** levam dados e funções do componente pai para o filho.
- **useState:** guarda valores que mudam e fazem a tela atualizar.
- **useEffect:** sincroniza o componente com algo externo, como a API.

> Em desenvolvimento, o `StrictMode` executa o efeito duas vezes, então `GET /produtos` aparece duplicado na aba Rede. Isso é normal e não acontece no build de produção.

## Testes manuais

Testes feitos com a API real. As capturas de tela estão na pasta `evidencias/`.

| # | Teste | Resultado | Evidência |
|---|---|---|---|
| 1 | Abrir sem erros no console | ✅ Nenhum erro | — |
| 2 | Carregar produtos da API | ✅ 5 cartões exibidos | `01-lista-api.png` |
| 3 | Buscar por nome ("mouse") | ✅ 1 produto encontrado | `02-busca-mouse.png` |
| 4 | Busca sem resultado ("xyz") | ✅ "Nenhum produto encontrado." | `03-lista-vazia.png` |
| 5 | API fora do ar | ✅ Mensagem de erro exibida | `06-api-fora-do-ar.png` |
| 6 | Clicar em "Ver detalhes" | ✅ Chama `GET /produtos/3` | `04-detalhes.png` |
| 7 | Clicar em "Fechar detalhes" | ✅ Painel some | — |
| 8 | Navegar sem recarregar a página | ✅ Nenhum recarregamento | — |
| 9 | Produto não encontrado (404) | ✅ "Produto não encontrado" | `05-erro-detalhes.png` |

Também foram executados `npm run build` e `npm run lint`, sem erros.
