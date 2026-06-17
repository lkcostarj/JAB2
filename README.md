# Impulsa — Aprenda. Crie. Venda.

Rede social de **aprendizado + marketplace de infoprodutos**. Inspirada na
experiência visual do Instagram, mas otimizada para **marketing digital,
criação de conteúdo e venda de produtos digitais** — algo como um
*Hotmart + Instagram + comunidade*.

> Versão atual: **MVP funcional** (front-end estático, sem backend). Todos os
> dados são persistidos no `localStorage` do navegador.

## Como rodar

É um site estático — não precisa de build nem servidor.

- **Local:** abra `index.html` no navegador (ou rode `python3 -m http.server` na pasta e acesse `http://localhost:8000`).
- **GitHub Pages:** basta publicar a branch; o `index.html` na raiz já é a aplicação.

> O site da JAB Produções Artísticas que existia antes foi preservado em [`jab.html`](jab.html).

## Contas de teste

| Tipo       | E-mail               | Senha    |
|------------|----------------------|----------|
| Criadora   | `ana@impulsa.app`    | `123456` |
| Admin      | `admin@impulsa.app`  | `admin`  |
| Visitante  | `demo@impulsa.app`   | `demo`   |

Na tela de login há botões de acesso rápido para essas contas. Você também
pode criar uma conta nova pelo cadastro.

## Funcionalidades (MVP)

- **Usuários:** cadastro/login, perfil personalizado (foto, bio), seguidores/seguindo, conteúdos salvos.
- **Feed estilo Instagram:** publicações com imagem/vídeo/texto, curtidas, comentários, compartilhamento, salvar. Ordenação por um "algoritmo" de relevância (recência + engajamento + afinidade + destaque).
- **Publicações ricas:** título, descrição, mídia, tags/categorias e botão de ação (CTA).
- **Venda de infoprodutos:** cada post pode vincular um produto (nome, imagem, descrição, preço, link de checkout, criador) com botão **"Quero acessar"**.
- **Conteúdos gratuitos:** cursos, aulas, PDFs e materiais organizados por categoria (Marketing Digital, Vendas, Tráfego Pago, Produtividade, Desenvolvimento Pessoal).
- **Sistema de criadores:** qualquer usuário vira criador; painel com métricas (visualizações, curtidas, cliques nos links, conversões e taxa de conversão).
- **Administração:** gerenciar usuários, remover conteúdos, gerenciar categorias, destacar conteúdos e controlar criadores.
- **UI premium, mobile-first e responsiva:** navegação por sidebar (desktop) e bottom nav (mobile) — Início, Explorar, Conteúdos, Criar, Avisos, Perfil.

## Arquitetura

```
index.html              # shell da SPA
assets/css/app.css       # tema / design system
assets/js/store.js       # estado + persistência (localStorage) + dados de exemplo
assets/js/app.js         # roteador (hash), views, componentes e interações
```

A camada `store.js` isola toda a lógica de dados. Para evoluir para um produto
real, basta substituí-la por chamadas a uma API/back-end, mantendo a mesma
interface pública (login, posts, products, freeContent, etc.).

## Próximos passos (roadmap)

- Backend real (auth, banco de dados) e upload de mídia em nuvem.
- Integração de pagamentos (checkout/assinatura) substituindo o `saleUrl`.
- Sistema de assinatura e área de membros.
- Notificações em tempo real e mensagens diretas.
