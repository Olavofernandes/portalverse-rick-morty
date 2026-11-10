# Portalverse — Rick & Morty Explorer

Projeto acadêmico de Front-End desenvolvido com **HTML, CSS e JavaScript puro**, consumindo a API pública Rick and Morty.

## Como executar
1. Extraia o arquivo ZIP.
2. Abra a pasta no Visual Studio Code.
3. Abra `index.html` no navegador. Recomendado: usar a extensão Live Server no VS Code.
4. É necessário estar conectado à internet para carregar os dados da API e as fontes externas.

## Funcionalidades
- Consulta de personagens com `fetch()`.
- Cards criados dinamicamente com `document.createElement()` e inseridos com `appendChild()`.
- Pesquisa por nome e filtros de status e espécie.
- Carregamento de páginas adicionais da API.
- Favoritos salvos no `localStorage`.
- Modal com informações adicionais do personagem.
- Layout responsivo para computador e celular.

## API utilizada
Rick and Morty API: https://rickandmortyapi.com/documentation/

Endpoint principal: `https://rickandmortyapi.com/api/character`

A API é pública e não exige chave/token para os endpoints usados neste projeto. A resposta contém `info` (quantidade total, páginas e URL da próxima página) e `results` (lista de personagens).

## Arquivos
- `index.html` — estrutura da página.
- `style.css` — identidade visual e responsividade.
- `script.js` — requisições, filtros, criação dos cards e interações.
- `relatorio_teorico.pdf` — parte teórica do trabalho.
- `roteiro_video.txt` — sugestão de roteiro para o pitch.

## Publicação no GitHub
Crie um repositório público no GitHub, envie os arquivos desta pasta e copie o link do repositório para a entrega. Para publicar como site, acesse Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.
