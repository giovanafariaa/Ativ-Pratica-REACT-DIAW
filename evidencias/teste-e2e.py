import json, subprocess, time
from playwright.sync_api import sync_playwright
OUT='/home/claude/catalogo-produtos/evidencias'
res=[]
def check(nome, ok, detalhe=''):
    res.append((nome, bool(ok), detalhe)); print(('OK  ' if ok else 'FALHA'), nome, detalhe)

with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1000,'height':800})
    console=[]; reqs=[]
    pg.on('console', lambda m: console.append((m.type,m.text)) if m.type in('error','warning') else None)
    pg.on('pageerror', lambda e: console.append(('pageerror',str(e))))
    pg.on('request', lambda r: reqs.append((r.method,r.url)) if '/produtos' in r.url else None)
    navs=[]; pg.on('framenavigated', lambda f: navs.append(f.url))
    pg.goto('http://localhost:5173'); pg.wait_for_selector('.product-card')
    n_nav=len(navs)
    check('1. Abre sem erros no console', not console, str(console))
    cards=pg.locator('.product-card').count()
    check('2. Produtos carregados da API', cards==5 and ('GET','http://localhost:5173/produtos') in reqs, f'{cards} cartões; requisições: {reqs}')
    pg.screenshot(path=f'{OUT}/01-lista-api.png')
    pg.fill('#product-search','mouse'); 
    check('3. Busca por nome funciona', pg.locator('.product-card').count()==1 and '1 produto(s)' in pg.inner_text('main'), pg.inner_text('.product-card h2'))
    pg.screenshot(path=f'{OUT}/02-busca-mouse.png')
    pg.fill('#product-search','xyz')
    check('4. Mensagem de lista vazia', 'Nenhum produto encontrado.' in pg.inner_text('main') and '0 produto(s)' in pg.inner_text('main'))
    pg.screenshot(path=f'{OUT}/03-lista-vazia.png')
    pg.fill('#product-search','')
    check('   Apagar a busca restaura a lista', pg.locator('.product-card').count()==5)
    reqs.clear()
    pg.locator('.product-card').nth(2).get_by_role('button',name='Ver detalhes').click()
    pg.wait_for_selector('.product-details h2')
    check('6. Ver detalhes faz GET /produtos/3', ('GET','http://localhost:5173/produtos/3') in reqs, str(reqs))
    check('   Painel mostra dados do produto', 'Monitor 24 polegadas' in pg.inner_text('.product-details') and 'Estoque: 8' in pg.inner_text('.product-details'))
    pg.screenshot(path=f'{OUT}/04-detalhes.png')
    pg.locator('.product-card').nth(0).get_by_role('button',name='Ver detalhes').click()
    pg.wait_for_function("document.querySelector('.product-details h2')?.innerText==='Teclado Mecânico'")
    check('   Seleção de outro produto atualiza o painel', True)
    pg.get_by_role('button',name='Fechar detalhes').click()
    check('7. Fechar detalhes oculta o painel', pg.locator('.product-details').count()==0)
    check('8. Navegação sem recarregar a página', len(navs)==n_nav, f'navegações: {len(navs)-n_nav}')
    # 404 em detalhes: produto removido no servidor entre listagem e clique
    import urllib.request
    urllib.request.urlopen(urllib.request.Request('http://localhost:3000/produtos/2',method='DELETE'))
    pg.locator('.product-card').nth(1).get_by_role('button',name='Ver detalhes').click()
    pg.wait_for_selector('.product-details [role=alert]')
    check('   Erro 404 nos detalhes exibe mensagem da API', 'Produto não encontrado' in pg.inner_text('.product-details'), pg.inner_text('.product-details [role=alert]'))
    pg.screenshot(path=f'{OUT}/05-erro-detalhes.png')
    # API fora do ar
    subprocess.run(['pkill','-f','node server.js'])
    time.sleep(1); pg.reload(); pg.wait_for_selector('[role=alert]')
    check('5. Falha da API exibe mensagem de erro', True, pg.inner_text('[role=alert]'))
    pg.screenshot(path=f'{OUT}/06-api-fora-do-ar.png')
    b.close()
json.dump(res, open('/tmp/res.json','w'))
