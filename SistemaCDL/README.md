# Sistema de Desafios - Frontend (consolidado)

Projeto frontend estático criado a partir de telas Figma e consolidado em múltiplas páginas HTML responsivas. O código usa Vue 3 (CDN) para widgets reativos leves e um arquivo `messages.js` para strings e conteúdo dinâmico.

## Estado atual — breves notas

- Layout padronizado: todas as páginas usam a estrutura `tela-layout` com o shell `screen` → `shell` → `aside.sidebar` + `div.content` e um único `#app` por página.
- Correções aplicadas em arquivos corrompidos (removidos wrappers duplicados, scripts duplicados, encoding):
	- `detalhesPropossta.html` (corrigido)
	- `detalhesProblema.html` (corrigido)
	- `selecaoInstituicoes.html` (corrigido)
	- `dashboard.html` (corrigido)
	- `empresaDashboard.html` (corrigido)
	- `criaProblema.html` (corrigido)
- Navegação: `index.html` recebeu utilitário `openAllPages()` para abrir outros HTMLs (atalho de inspeção).
- Vue 3 via CDN: `https://unpkg.com/vue@3/dist/vue.global.js` e `messages.js` são carregados em páginas que usam reatividade.

## CSS e layout

- Arquivo central: `theme.css` — regras globais e componentes visuais.
- Importante fix aplicado: substituímos a regra que forçava `.content .cards-grid { grid-template-columns: 1fr; }` por uma versão responsiva (`repeat(auto-fit, minmax(260px,1fr))`), permitindo que listas e grids usem todo o espaço horizontal disponível sem quebrar a responsividade.

## Páginas principais (atualizadas / padronizadas)

- `index.html` — ponto de entrada e atalhos
- `selecaoInstituicoes.html` — seleção/listagem de instituições (grid responsivo)
- `tela-notificacoes-propostas.html` — lista de notificações em grid
- `tela-detalhes-desafio.html` — detalhes do desafio (hero + grids)
- `detalhesProblema.html` — página de detalhes do problema (conteúdo principal + sidebar)
- `dashboard.html`, `empresaDashboard.html`, `criaProblema.html`, `propostas.html` — dashboards e telas relacionadas (padronizadas)

## Como rodar localmente

Recomendo servir a pasta `Consolidada` por um servidor estático local (Python, http-server ou Live Server do VS Code):

```bash
cd Consolidada
python -m http.server 8000
# ou: http-server
# abra http://localhost:8000
```

Algumas páginas usam `messages.js` para popular textos; se abrir HTMLs diretamente via `file://` e o arquivo não carregar, use o servidor local.

## Itens pendentes / observações

- Revisar e finalizar ajustes de `tela-notificacoes-propostas.html` e `tela-detalhes-desafio.html` (validação visual e pequenos ajustes de padding/margem).
- Verificar imagens faltantes dentro de `images/` e substituir placeholders, se necessário.
- QA final: revisar comportamento em mobile e desktop, checar interações Vue e eventuais warnings no console.

## Próximos passos sugeridos

1. Finalizar ajustes e QA nas páginas listadas acima.
2. Opcional: consolidar scripts Vue em `app.js`/módulos e adotar um bundler (Vite) para fluxo de desenvolvimento.
3. Integrar backend (API) para persistência de propostas/inscrições.

---

Arquivo atualizado automaticamente durante a manutenção — verifique o histórico de commits/edições para detalhes.

**Status:** frontend consolidado, layout padronizado, CSS responsivo aplicado, correções de arquivos críticos realizadas.
