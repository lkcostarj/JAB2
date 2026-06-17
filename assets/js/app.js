/* ============================================================================
 * Impulsa — App (UI + roteamento + views)
 * SPA em JS puro. Renderização por template strings + delegação de eventos.
 * ==========================================================================*/
(function () {
  'use strict';
  const S = window.Store;

  /* ----------------------------- Ícones (SVG) ----------------------------- */
  const ICON = {
    home:    '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6 6-2z"/>',
    plus:    '<path d="M12 5v14M5 12h14"/>',
    bell:    '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    user:    '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>',
    book:    '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M18 3v18"/>',
    chart:   '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    shield:  '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    heart:   '<path d="M20.8 8.6a5.5 5.5 0 0 0-9.3-2.6L12 6.4l-.5-.4A5.5 5.5 0 1 0 3.2 13l8.3 7 8.3-7c2-1.7 2.4-4 1-6.4z"/>',
    comment: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    share:   '<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/>',
    bookmark:'<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5-7 5V4a1 1 0 0 1 1-1z"/>',
    logout:  '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    tag:     '<path d="M20 13l-7 7-9-9V4h7z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    eye:     '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    cart:    '<circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/><path d="M3 3h2l2 12h11l2-8H6"/>',
    search:  '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
    trash:   '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    star:    '<path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-3.5L6 21l1.5-7L2 9.5 9 9z"/>',
    check:   '<path d="M20 6L9 17l-5-5"/>',
    image:   '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
    play:    '<circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4z"/>',
  };
  const icon = (name, cls = 'w-5 h-5', stroke = 2) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" class="${cls}">${ICON[name] || ''}</svg>`;

  /* ----------------------------- Helpers UI ------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k' : String(n);
  const money = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'agora';
    const m = Math.floor(s / 60); if (m < 60) return m + 'min';
    const h = Math.floor(m / 60); if (h < 24) return h + 'h';
    const d = Math.floor(h / 24); if (d < 7) return d + 'd';
    return new Date(ts).toLocaleDateString('pt-BR');
  }

  let toastWrap;
  function toast(msg) {
    if (!toastWrap || !document.body.contains(toastWrap)) { toastWrap = document.createElement('div'); toastWrap.className = 'toast-wrap'; document.body.appendChild(toastWrap); }
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2600);
  }

  function openModal(innerHtml) {
    closeModal();
    const back = document.createElement('div'); back.className = 'modal-backdrop'; back.id = 'modal';
    back.innerHTML = `<div class="modal card fade-in p-5">${innerHtml}</div>`;
    back.addEventListener('click', (e) => { if (e.target === back) closeModal(); });
    document.body.appendChild(back);
  }
  function closeModal() { const m = $('#modal'); if (m) m.remove(); }

  /* ----------------------------- Componentes ----------------------------- */
  function avatar(user, size = 40, ring = true) {
    const s = `width:${size}px;height:${size}px`;
    const img = `<img src="${user.avatar}" class="avatar" style="${s}" alt="${esc(user.name)}">`;
    return (ring && user.isCreator) ? `<span class="ring-creator inline-block">${img}</span>` : img;
  }

  function userTag(user, sub) {
    return `<a class="flex items-center gap-3 min-w-0" href="#/u/${user.username}">
      ${avatar(user, 44)}
      <span class="min-w-0">
        <span class="flex items-center gap-1 font-semibold truncate">${esc(user.name)}
          ${user.isAdmin ? `<span class="chip" title="Administrador">admin</span>` : user.isCreator ? `<span class="chip">criador</span>` : ''}</span>
        <span class="block text-xs text-muted truncate">${sub || '@' + esc(user.username)}</span>
      </span></a>`;
  }

  function productBox(product, postId) {
    if (!product) return '';
    const creator = S.user(product.creatorId);
    return `<div class="surface-2 rounded-2xl p-3 mt-3 flex gap-3 items-center border-app">
      <img src="${product.image}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0" alt="">
      <div class="min-w-0 flex-1">
        <div class="text-[11px] uppercase tracking-wide text-muted flex items-center gap-1">${icon('cart','w-3.5 h-3.5')} Infoproduto</div>
        <div class="font-semibold truncate">${esc(product.name)}</div>
        <div class="text-sm text-muted">${money(product.price)} · por ${esc(creator ? creator.name : 'criador')}</div>
      </div>
      <a class="btn btn-primary btn-sm flex-shrink-0" href="${esc(product.saleUrl)}" target="_blank" rel="noopener"
         data-action="buy" data-post="${postId || ''}">Quero acessar</a>
    </div>`;
  }

  function postCard(post) {
    const author = S.user(post.authorId);
    const me = S.currentUser();
    const liked = me && post.likes.includes(me.id);
    const saved = me && S.isSaved(post.id, me.id);
    const product = post.productId ? S.product(post.productId) : null;
    const media = post.media
      ? (post.type === 'video'
          ? `<video src="${esc(post.media)}" controls class="w-full bg-black aspect-video"></video>`
          : `<img src="${esc(post.media)}" class="w-full object-cover" style="max-height:560px" alt="">`)
      : '';
    const ctaExternal = (post.cta && post.cta.url && !product)
      ? `<a class="btn btn-ghost btn-sm mt-3 w-full" href="${esc(post.cta.url)}" target="_blank" rel="noopener" data-action="cta" data-post="${post.id}">${esc(post.cta.label || 'Saiba mais')}</a>`
      : '';
    const tags = (post.tags || []).map((t) => `<a href="#/explore?tag=${encodeURIComponent(t)}" class="chip">#${esc(t)}</a>`).join(' ');
    return `<article class="card fade-in" data-post-card="${post.id}">
      <header class="flex items-center justify-between p-4">
        ${userTag(author, '@' + author.username + ' · ' + timeAgo(post.createdAt))}
        <div class="flex items-center gap-2">
          ${post.featured ? `<span class="chip" title="Em destaque">${icon('star','w-3 h-3')} destaque</span>` : ''}
          <span class="chip-accent chip">${esc(post.category)}</span>
        </div>
      </header>
      ${media}
      <div class="p-4">
        <h3 class="font-brand text-lg font-bold">${esc(post.title)}</h3>
        <p class="text-sm text-gray-300 mt-1 whitespace-pre-line">${esc(post.description)}</p>
        ${tags ? `<div class="flex flex-wrap gap-1.5 mt-3">${tags}</div>` : ''}
        ${productBox(product, post.id)}
        ${ctaExternal}
      </div>
      <footer class="flex items-center gap-1 px-3 pb-3 text-muted">
        <button class="btn btn-ghost btn-sm border-0 ${liked ? 'text-pink-400' : ''}" data-action="like" data-post="${post.id}">
          ${icon('heart','w-5 h-5', liked ? 0 : 2)} ${fmt(post.likes.length)}</button>
        <button class="btn btn-ghost btn-sm border-0" data-action="open-post" data-post="${post.id}">${icon('comment')} ${fmt(post.comments.length)}</button>
        <button class="btn btn-ghost btn-sm border-0" data-action="share" data-post="${post.id}">${icon('share')} ${fmt(post.shares)}</button>
        <span class="ml-auto flex items-center gap-1 text-xs">${icon('eye','w-4 h-4')} ${fmt(post.views)}</span>
        <button class="btn btn-ghost btn-sm border-0 ${saved ? 'text-violet-300' : ''}" data-action="save" data-post="${post.id}" title="Salvar">${icon('bookmark')}</button>
      </footer>
    </article>`;
  }

  function freeCard(fc) {
    const author = S.user(fc.authorId);
    return `<div class="card fade-in overflow-hidden">
      <div class="relative">
        <img src="${fc.cover}" class="w-full aspect-video object-cover" alt="">
        <span class="chip-accent chip absolute top-2 left-2">${esc(fc.type)}</span>
      </div>
      <div class="p-4">
        <div class="text-xs text-muted">${esc(fc.category)}</div>
        <h4 class="font-semibold mt-1 line-clamp-2">${esc(fc.title)}</h4>
        <p class="text-sm text-muted mt-1 line-clamp-2">${esc(fc.description)}</p>
        <div class="flex items-center justify-between mt-3">
          <span class="text-xs text-muted">por ${esc(author ? author.name : '—')}</span>
          <a class="btn btn-accent btn-sm" href="${esc(fc.url)}" target="_blank" rel="noopener">Acessar grátis</a>
        </div>
      </div>
    </div>`;
  }

  function emptyState(text, sub) {
    return `<div class="card p-10 text-center text-muted fade-in">
      <div class="text-4xl mb-2">✨</div>
      <p class="font-semibold text-gray-200">${esc(text)}</p>${sub ? `<p class="text-sm mt-1">${esc(sub)}</p>` : ''}</div>`;
  }

  /* ------------------------------- Layout -------------------------------- */
  const NAV = [
    { route: '#/feed', icon: 'home', label: 'Início' },
    { route: '#/explore', icon: 'compass', label: 'Explorar' },
    { route: '#/free', icon: 'book', label: 'Conteúdos' },
    { route: '#/create', icon: 'plus', label: 'Criar' },
    { route: '#/notifications', icon: 'bell', label: 'Avisos' },
    { route: '#/me', icon: 'user', label: 'Perfil' },
  ];

  function sidebar(active) {
    const me = S.currentUser();
    const unread = me ? S.unreadCount(me.id) : 0;
    const links = [
      { route: '#/feed', icon: 'home', label: 'Início' },
      { route: '#/explore', icon: 'compass', label: 'Explorar' },
      { route: '#/free', icon: 'book', label: 'Conteúdos Gratuitos' },
      { route: '#/create', icon: 'plus', label: 'Criar publicação' },
      { route: '#/notifications', icon: 'bell', label: 'Notificações', badge: unread },
      { route: '#/me', icon: 'user', label: 'Meu perfil' },
    ];
    if (me && me.isCreator) links.push({ route: '#/creator', icon: 'chart', label: 'Painel do criador' });
    if (me && me.isAdmin) links.push({ route: '#/admin', icon: 'shield', label: 'Administração' });
    return `<aside class="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0 p-4 border-r border-app">
      <a href="#/feed" class="font-brand text-2xl font-extrabold brand-text px-2 mb-6 mt-2">Impulsa</a>
      <nav class="flex flex-col gap-1 flex-1">
        ${links.map((l) => `<a class="nav-link ${active === l.route ? 'active' : ''}" href="${l.route}">
            <span class="relative">${icon(l.icon)}${l.badge ? `<span class="badge">${l.badge}</span>` : ''}</span>
            <span>${l.label}</span></a>`).join('')}
      </nav>
      <div class="mt-4 border-t border-app pt-3">
        ${me ? `<div class="flex items-center gap-3 mb-2 px-1">${avatar(me, 40)}
            <div class="min-w-0"><div class="font-semibold text-sm truncate">${esc(me.name)}</div>
            <div class="text-xs text-muted truncate">@${esc(me.username)}</div></div></div>
          <button class="nav-link w-full" data-action="logout">${icon('logout')} Sair</button>` : ''}
      </div>
    </aside>`;
  }

  function topbar(active) {
    const me = S.currentUser();
    const unread = me ? S.unreadCount(me.id) : 0;
    return `<header class="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-app" style="background:rgba(11,11,18,.9);backdrop-filter:blur(10px)">
      <a href="#/feed" class="font-brand text-xl font-extrabold brand-text">Impulsa</a>
      <div class="flex items-center gap-1">
        <a href="#/explore" class="btn btn-ghost btn-sm border-0">${icon('search')}</a>
        <a href="#/notifications" class="btn btn-ghost btn-sm border-0 relative">${icon('bell')}${unread ? `<span class="badge">${unread}</span>` : ''}</a>
      </div></header>`;
  }

  function bottomNav(active) {
    const me = S.currentUser();
    const unread = me ? S.unreadCount(me.id) : 0;
    return `<nav class="bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-40 flex">
      ${NAV.map((l) => `<a class="bottom-link ${active === l.route || (l.route === '#/me' && active && active.startsWith('#/me')) ? 'active' : ''}" href="${l.route}">
        <span class="relative">${icon(l.icon, 'w-6 h-6')}${l.route === '#/notifications' && unread ? `<span class="badge">${unread}</span>` : ''}</span>
        <span>${l.label}</span></a>`).join('')}
    </nav>`;
  }

  function layout(active, contentHtml, opts = {}) {
    const aside = opts.rightAside || '';
    return `<div class="flex min-h-screen max-w-[1280px] mx-auto">
      ${sidebar(active)}
      <main class="flex-1 min-w-0">
        ${topbar(active)}
        <div class="px-4 lg:px-8 py-5 pb-24 lg:pb-10">${contentHtml}</div>
      </main>
      ${aside}
    </div>
    ${bottomNav(active)}`;
  }

  /* ------------------------------- Views --------------------------------- */
  const app = () => $('#app');

  function rightSuggestions() {
    const me = S.currentUser();
    const creators = S.users().filter((u) => u.isCreator && (!me || u.id !== me.id)).slice(0, 4);
    return `<aside class="hidden xl:block w-72 flex-shrink-0 p-5">
      <div class="card p-4 sticky top-5">
        <h4 class="font-semibold mb-3">Criadores em destaque</h4>
        <div class="flex flex-col gap-3">
        ${creators.map((c) => {
          const following = me && S.isFollowing(me.id, c.id);
          return `<div class="flex items-center justify-between gap-2">
            ${userTag(c, `${c.followers.length} seguidores`)}
            ${me ? `<button class="btn ${following ? 'btn-ghost' : 'btn-primary'} btn-sm" data-action="follow" data-user="${c.id}">${following ? 'Seguindo' : 'Seguir'}</button>` : ''}
          </div>`;
        }).join('')}
        </div>
        <div class="mt-4 pt-4 border-t border-app text-xs text-muted">
          Impulsa · Aprenda, crie e venda.<br>Rede social de conhecimento + marketplace de infoprodutos.
        </div>
      </div>
    </aside>`;
  }

  function viewFeed() {
    const me = S.currentUser();
    const posts = S.feed(me ? me.id : null);
    const list = posts.length ? posts.map(postCard).join('') : emptyState('Ainda não há publicações', 'Que tal criar a primeira?');
    const stories = S.users().filter((u) => u.isCreator).map((u) =>
      `<a href="#/u/${u.username}" class="flex flex-col items-center gap-1 flex-shrink-0 w-16">
        ${avatar(u, 60)}<span class="text-[11px] text-muted truncate w-full text-center">${esc(u.name.split(' ')[0])}</span></a>`).join('');
    const content = `
      <div class="flex items-center justify-between mb-4">
        <h1 class="font-brand text-2xl font-bold">Seu feed</h1>
        <a href="#/create" class="btn btn-primary btn-sm">${icon('plus','w-4 h-4')} Publicar</a>
      </div>
      <div class="card p-4 mb-5"><div class="flex gap-4 overflow-x-auto pb-1">${stories}</div></div>
      <div class="flex flex-col gap-5 max-w-2xl">${list}</div>`;
    app().innerHTML = layout('#/feed', content, { rightAside: rightSuggestions() });
  }

  function viewExplore(params) {
    const q = (params.get('q') || '').toLowerCase();
    const tag = (params.get('tag') || '').toLowerCase();
    const cat = params.get('cat') || '';
    let posts = S.posts().slice().sort((a, b) => (b.likes.length + b.views) - (a.likes.length + a.views));
    if (q) posts = posts.filter((p) => (p.title + ' ' + p.description + ' ' + p.tags.join(' ')).toLowerCase().includes(q));
    if (tag) posts = posts.filter((p) => p.tags.map((t) => t.toLowerCase()).includes(tag));
    if (cat) posts = posts.filter((p) => p.category === cat);

    const cats = ['Todas', ...S.categories()];
    const chips = cats.map((c) => {
      const active = (c === 'Todas' && !cat) || c === cat;
      const href = c === 'Todas' ? '#/explore' : '#/explore?cat=' + encodeURIComponent(c);
      return `<a href="${href}" class="chip ${active ? 'active' : ''}">${esc(c)}</a>`;
    }).join(' ');

    const grid = posts.length ? posts.map((p) => `
      <a href="#/post/${p.id}" class="card overflow-hidden group fade-in">
        <div class="relative aspect-square surface-2 grid place-items-center overflow-hidden">
          ${p.media ? `<img src="${esc(p.media)}" class="w-full h-full object-cover group-hover:scale-105 transition">` : `<div class="p-4 text-center font-brand font-bold">${esc(p.title)}</div>`}
          ${p.productId ? `<span class="chip absolute top-2 right-2">${icon('cart','w-3 h-3')} produto</span>` : ''}
        </div>
        <div class="p-3">
          <div class="text-xs text-muted">${esc(p.category)}</div>
          <div class="font-semibold text-sm line-clamp-2">${esc(p.title)}</div>
          <div class="flex items-center gap-3 text-xs text-muted mt-2">
            <span class="flex items-center gap-1">${icon('heart','w-3.5 h-3.5')}${fmt(p.likes.length)}</span>
            <span class="flex items-center gap-1">${icon('eye','w-3.5 h-3.5')}${fmt(p.views)}</span>
          </div>
        </div>
      </a>`).join('') : emptyState('Nada encontrado', 'Tente outra busca ou categoria.');

    const content = `
      <h1 class="font-brand text-2xl font-bold mb-4">Explorar</h1>
      <form data-form="search" class="relative mb-4 max-w-xl">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted">${icon('search')}</span>
        <input class="input pl-11" name="q" value="${esc(params.get('q') || '')}" placeholder="Buscar conteúdos, criadores, temas...">
      </form>
      <div class="flex flex-wrap gap-2 mb-5">${chips}</div>
      ${tag ? `<div class="mb-3 text-sm text-muted">Resultados para <span class="chip">#${esc(tag)}</span></div>` : ''}
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">${grid}</div>`;
    app().innerHTML = layout('#/explore', content);
  }

  function viewFree(params) {
    const cat = params.get('cat') || '';
    let items = S.freeContent();
    if (cat) items = items.filter((f) => f.category === cat);
    const cats = ['Todas', ...S.categories()];
    const chips = cats.map((c) => {
      const active = (c === 'Todas' && !cat) || c === cat;
      const href = c === 'Todas' ? '#/free' : '#/free?cat=' + encodeURIComponent(c);
      return `<a href="${href}" class="chip ${active ? 'active' : ''}">${esc(c)}</a>`;
    }).join(' ');
    const me = S.currentUser();
    const content = `
      <div class="card p-6 mb-5 brand-gradient text-white">
        <h1 class="font-brand text-2xl font-bold">Conteúdos Gratuitos</h1>
        <p class="opacity-90 mt-1 max-w-lg">Cursos, aulas, PDFs e materiais para você aprender de graça e crescer no digital.</p>
      </div>
      <div class="flex items-center justify-between mb-4">
        <div class="flex flex-wrap gap-2">${chips}</div>
        ${me && me.isCreator ? `<button class="btn btn-accent btn-sm flex-shrink-0" data-action="new-free">${icon('plus','w-4 h-4')} Publicar conteúdo</button>` : ''}
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${items.length ? items.map(freeCard).join('') : emptyState('Sem conteúdos nesta categoria.')}
      </div>`;
    app().innerHTML = layout('#/free', content);
  }

  function viewCreate() {
    const me = requireAuth(); if (!me) return;
    const cats = S.categories().map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    const myProducts = S.productsBy(me.id);
    const prodOptions = myProducts.map((p) => `<option value="${p.id}">${esc(p.name)} — ${money(p.price)}</option>`).join('');
    const content = `
      <h1 class="font-brand text-2xl font-bold mb-4">Criar publicação</h1>
      <div class="grid lg:grid-cols-2 gap-6 max-w-4xl">
        <form data-form="create-post" class="card p-5">
          <label class="field"><span>Título</span><input class="input" name="title" required placeholder="Ex: 5 estratégias para vender todos os dias"></label>
          <label class="field"><span>Descrição</span><textarea class="input" name="description" rows="4" placeholder="Escreva o conteúdo da publicação..."></textarea></label>
          <label class="field"><span>Tipo de mídia</span>
            <select class="input" name="type" data-bind="type">
              <option value="image">Imagem</option><option value="video">Vídeo</option><option value="text">Apenas texto</option>
            </select></label>
          <label class="field" data-media-field><span>Imagem (arquivo)</span>
            <input class="input" type="file" name="mediaFile" accept="image/*"></label>
          <label class="field" data-mediaurl-field style="display:none"><span>URL do vídeo (mp4)</span>
            <input class="input" name="mediaUrl" placeholder="https://..."></label>
          <label class="field"><span>Categoria</span><select class="input" name="category">${cats}</select></label>
          <label class="field"><span>Tags (separadas por vírgula)</span><input class="input" name="tags" placeholder="vendas, copy, trafego"></label>
          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>Texto do botão (CTA)</span><input class="input" name="ctaLabel" placeholder="Quero acessar"></label>
            <label class="field"><span>Link do CTA (opcional)</span><input class="input" name="ctaUrl" placeholder="https://..."></label>
          </div>
          <label class="field"><span>Vincular infoproduto</span>
            <select class="input" name="productId"><option value="">Nenhum</option>${prodOptions}</select>
            ${me.isCreator ? `<button type="button" class="btn btn-ghost btn-sm mt-2" data-action="new-product">${icon('plus','w-4 h-4')} Cadastrar novo produto</button>` : `<p class="text-xs text-muted mt-2">Torne-se criador no seu perfil para vender infoprodutos.</p>`}
          </label>
          <button class="btn btn-primary w-full mt-2">Publicar</button>
        </form>
        <div>
          <h3 class="font-semibold mb-2 text-muted text-sm">Pré-visualização</h3>
          <div data-preview class="max-w-md">${emptyState('Sua publicação aparecerá aqui.')}</div>
        </div>
      </div>`;
    app().innerHTML = layout('#/create', content);
  }

  function viewNotifications() {
    const me = requireAuth(); if (!me) return;
    const list = S.notifications(me.id);
    S.markAllRead(me.id);
    const content = `
      <h1 class="font-brand text-2xl font-bold mb-4">Notificações</h1>
      <div class="card divide-border max-w-2xl">
        ${list.length ? list.map((n) => `<div class="flex items-center gap-3 p-4 ${n.read ? '' : ''}">
          <span class="w-9 h-9 rounded-full grid place-items-center surface-2">${icon(n.type === 'like' ? 'heart' : n.type === 'comment' ? 'comment' : 'user', 'w-4 h-4')}</span>
          <div class="flex-1"><div class="text-sm">${esc(n.text)}</div><div class="text-xs text-muted">${timeAgo(n.ts)}</div></div>
        </div>`).join('') : emptyState('Nenhuma notificação por aqui.')}
      </div>`;
    app().innerHTML = layout('#/notifications', content);
    renderShell(); // atualiza badges
  }

  function viewProfile(username, params) {
    const me = S.currentUser();
    const user = username ? S.userByUsername(username) : me;
    if (!user) { app().innerHTML = layout('#/me', emptyState('Usuário não encontrado.')); return; }
    const isMe = me && me.id === user.id;
    const tab = params.get('tab') || 'posts';
    const posts = S.postsBy(user.id);
    const saved = isMe ? user.saved.map((id) => S.post(id)).filter(Boolean) : [];
    const following = me && S.isFollowing(me.id, user.id);

    const grid = (arr) => arr.length ? `<div class="grid grid-cols-3 gap-1.5">${arr.map((p) => `
      <a href="#/post/${p.id}" class="relative aspect-square surface-2 rounded-lg overflow-hidden group">
        ${p.media ? `<img src="${esc(p.media)}" class="w-full h-full object-cover group-hover:opacity-80">` : `<div class="p-2 text-xs font-semibold grid place-items-center h-full text-center">${esc(p.title)}</div>`}
        <span class="absolute bottom-1 right-1 text-[10px] bg-black/60 rounded px-1 flex items-center gap-1">${icon('heart','w-3 h-3')}${p.likes.length}</span>
      </a>`).join('')}</div>` : emptyState('Nada aqui ainda.');

    const tabs = [['posts', 'Publicações']];
    if (isMe) tabs.push(['saved', 'Salvos']);

    const content = `
      <div class="card p-6 mb-5">
        <div class="flex flex-col sm:flex-row sm:items-center gap-5">
          ${avatar(user, 96)}
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="font-brand text-2xl font-bold">${esc(user.name)}</h1>
              ${user.isAdmin ? `<span class="chip">admin</span>` : user.isCreator ? `<span class="chip">criador</span>` : ''}
            </div>
            <div class="text-muted">@${esc(user.username)}</div>
            <p class="mt-2 text-sm text-gray-300 max-w-lg whitespace-pre-line">${esc(user.bio) || '<span class="text-muted">Sem biografia.</span>'}</p>
            <div class="flex gap-6 mt-3 text-sm">
              <span><b>${posts.length}</b> <span class="text-muted">publicações</span></span>
              <span><b>${user.followers.length}</b> <span class="text-muted">seguidores</span></span>
              <span><b>${user.following.length}</b> <span class="text-muted">seguindo</span></span>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            ${isMe
              ? `<button class="btn btn-ghost btn-sm" data-action="edit-profile">Editar perfil</button>
                 ${user.isCreator ? `<a class="btn btn-primary btn-sm" href="#/creator">Painel do criador</a>` : `<button class="btn btn-primary btn-sm" data-action="become-creator">Quero ser criador</button>`}`
              : (me ? `<button class="btn ${following ? 'btn-ghost' : 'btn-primary'} btn-sm" data-action="follow" data-user="${user.id}">${following ? 'Seguindo' : 'Seguir'}</button>` : `<a class="btn btn-primary btn-sm" href="#/login">Entrar para seguir</a>`)}
          </div>
        </div>
      </div>
      <div class="flex gap-2 mb-4 border-b border-app">
        ${tabs.map(([k, lbl]) => `<a href="#/u/${user.username}?tab=${k}" class="px-4 py-2 font-semibold text-sm ${tab === k ? 'border-b-2 border-pink-400 text-white' : 'text-muted'}">${lbl}</a>`).join('')}
      </div>
      ${tab === 'saved' ? grid(saved) : grid(posts)}`;
    app().innerHTML = layout('#/me', content);
  }

  function viewPost(id) {
    const post = S.post(id);
    if (!post) { app().innerHTML = layout('', emptyState('Publicação não encontrada.')); return; }
    S.addView(id);
    const me = S.currentUser();
    const comments = post.comments.slice().sort((a, b) => a.ts - b.ts).map((c) => {
      const u = S.user(c.userId);
      return `<div class="flex gap-3 py-2">${avatar(u, 34)}<div class="surface-2 rounded-2xl px-3 py-2 flex-1">
        <a href="#/u/${u.username}" class="text-sm font-semibold">${esc(u.name)}</a>
        <span class="text-xs text-muted ml-1">${timeAgo(c.ts)}</span>
        <div class="text-sm mt-0.5">${esc(c.text)}</div></div></div>`;
    }).join('') || `<p class="text-muted text-sm py-3">Seja o primeiro a comentar.</p>`;
    const content = `
      <a href="#/feed" class="text-muted text-sm mb-3 inline-block">← Voltar ao feed</a>
      <div class="max-w-2xl">
        ${postCard(post)}
        <div class="card p-4 mt-4">
          <h3 class="font-semibold mb-2">Comentários</h3>
          <div class="divide-border">${comments}</div>
          ${me ? `<form data-form="comment" data-post="${post.id}" class="flex gap-2 mt-3">
            <input class="input" name="text" placeholder="Adicione um comentário..." required>
            <button class="btn btn-primary">Enviar</button></form>`
              : `<a href="#/login" class="btn btn-ghost btn-sm mt-3">Entrar para comentar</a>`}
        </div>
      </div>`;
    app().innerHTML = layout('', content);
  }

  function viewCreator() {
    const me = requireAuth(); if (!me) return;
    if (!me.isCreator) { app().innerHTML = layout('#/creator', emptyState('Área exclusiva de criadores.', 'Torne-se criador no seu perfil.')); return; }
    const st = S.creatorStats(me.id);
    const posts = S.postsBy(me.id);
    const products = S.productsBy(me.id);
    const stat = (lbl, val, ic) => `<div class="stat"><div class="text-muted text-sm flex items-center gap-2">${icon(ic,'w-4 h-4')} ${lbl}</div><div class="num brand-text mt-1">${fmt(val)}</div></div>`;
    const convRate = st.clicks ? ((st.conversions / st.clicks) * 100).toFixed(1) : '0';
    const content = `
      <div class="flex items-center justify-between mb-5">
        <h1 class="font-brand text-2xl font-bold">Painel do criador</h1>
        <button class="btn btn-primary btn-sm" data-action="new-product">${icon('plus','w-4 h-4')} Novo produto</button>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        ${stat('Visualizações', st.views, 'eye')}
        ${stat('Curtidas', st.likes, 'heart')}
        ${stat('Comentários', st.comments, 'comment')}
        ${stat('Cliques nos links', st.clicks, 'tag')}
        ${stat('Conversões', st.conversions, 'cart')}
        <div class="stat"><div class="text-muted text-sm flex items-center gap-2">${icon('chart','w-4 h-4')} Taxa de conversão</div><div class="num brand-text mt-1">${convRate}%</div></div>
      </div>
      <h3 class="font-semibold mb-3">Desempenho por publicação</h3>
      <div class="card overflow-x-auto mb-8">
        <table class="w-full text-sm">
          <thead class="text-muted text-left"><tr>
            <th class="p-3">Publicação</th><th class="p-3">Views</th><th class="p-3">Curtidas</th><th class="p-3">Cliques</th><th class="p-3">Conversões</th></tr></thead>
          <tbody class="divide-border">
            ${posts.length ? posts.map((p) => `<tr>
              <td class="p-3"><a href="#/post/${p.id}" class="font-medium hover:underline line-clamp-1">${esc(p.title)}</a></td>
              <td class="p-3">${fmt(p.views)}</td><td class="p-3">${p.likes.length}</td>
              <td class="p-3">${p.linkClicks}</td><td class="p-3">${p.conversions}</td></tr>`).join('')
              : `<tr><td class="p-4 text-muted" colspan="5">Você ainda não publicou nada.</td></tr>`}
          </tbody>
        </table>
      </div>
      <h3 class="font-semibold mb-3">Seus infoprodutos</h3>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${products.length ? products.map((p) => `<div class="card p-4 flex gap-3">
          <img src="${p.image}" class="w-16 h-16 rounded-xl object-cover">
          <div class="flex-1 min-w-0"><div class="font-semibold truncate">${esc(p.name)}</div>
          <div class="text-sm text-muted">${money(p.price)}</div>
          <button class="btn btn-ghost btn-sm mt-2 text-pink-400 border-0 px-0" data-action="del-product" data-id="${p.id}">${icon('trash','w-4 h-4')} Remover</button></div>
        </div>`).join('') : emptyState('Cadastre seu primeiro infoproduto.')}
      </div>`;
    app().innerHTML = layout('#/creator', content);
  }

  function viewAdmin(params) {
    const me = requireAuth(); if (!me) return;
    if (!me.isAdmin) { app().innerHTML = layout('#/admin', emptyState('Acesso restrito.', 'Apenas administradores.')); return; }
    const tab = params.get('tab') || 'users';
    const tabs = [['users', 'Usuários'], ['posts', 'Conteúdos'], ['categories', 'Categorias'], ['creators', 'Criadores']];
    let body = '';
    if (tab === 'users') {
      body = `<div class="card divide-border">${S.users().map((u) => `<div class="flex items-center justify-between gap-3 p-3">
        ${userTag(u)}
        <div class="flex items-center gap-2">
          ${u.isCreator ? '<span class="chip">criador</span>' : ''}${u.isAdmin ? '<span class="chip">admin</span>' : ''}
          ${u.id !== me.id ? `<button class="btn btn-ghost btn-sm text-pink-400 border-0" data-action="admin-del-user" data-id="${u.id}">${icon('trash','w-4 h-4')}</button>` : '<span class="text-xs text-muted">você</span>'}
        </div></div>`).join('')}</div>`;
    } else if (tab === 'posts') {
      body = `<div class="card divide-border">${S.posts().map((p) => { const a = S.user(p.authorId); return `<div class="flex items-center justify-between gap-3 p-3">
        <a href="#/post/${p.id}" class="min-w-0"><div class="font-medium truncate">${esc(p.title)}</div><div class="text-xs text-muted">por ${esc(a ? a.name : '—')} · ${esc(p.category)}</div></a>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button class="btn btn-ghost btn-sm" data-action="admin-feature" data-id="${p.id}">${icon('star','w-4 h-4', p.featured ? 0 : 2)} ${p.featured ? 'Remover destaque' : 'Destacar'}</button>
          <button class="btn btn-ghost btn-sm text-pink-400 border-0" data-action="admin-del-post" data-id="${p.id}">${icon('trash','w-4 h-4')}</button>
        </div></div>`; }).join('')}</div>`;
    } else if (tab === 'categories') {
      body = `<form data-form="add-category" class="flex gap-2 mb-4 max-w-md"><input class="input" name="name" placeholder="Nova categoria" required><button class="btn btn-primary">Adicionar</button></form>
        <div class="flex flex-wrap gap-2">${S.categories().map((c) => `<span class="chip">${esc(c)}<button data-action="admin-del-cat" data-name="${esc(c)}" class="ml-1">✕</button></span>`).join('')}</div>`;
    } else if (tab === 'creators') {
      const creators = S.users().filter((u) => u.isCreator);
      body = `<div class="grid sm:grid-cols-2 gap-3">${creators.map((c) => { const st = S.creatorStats(c.id); return `<div class="card p-4">
        ${userTag(c)}<div class="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
        <div><div class="font-bold">${fmt(st.views)}</div><div class="text-xs text-muted">views</div></div>
        <div><div class="font-bold">${st.posts}</div><div class="text-xs text-muted">posts</div></div>
        <div><div class="font-bold">${st.conversions}</div><div class="text-xs text-muted">vendas</div></div></div>
        ${!c.isAdmin ? `<button class="btn btn-ghost btn-sm mt-3 w-full" data-action="admin-revoke-creator" data-id="${c.id}">Remover status de criador</button>` : ''}
      </div>`; }).join('')}</div>`;
    }
    const content = `
      <div class="flex items-center gap-2 mb-4"><span class="w-9 h-9 rounded-xl brand-gradient grid place-items-center">${icon('shield','w-5 h-5')}</span>
        <h1 class="font-brand text-2xl font-bold">Administração</h1></div>
      <div class="flex gap-2 mb-5 border-b border-app overflow-x-auto">
        ${tabs.map(([k, l]) => `<a href="#/admin?tab=${k}" class="px-4 py-2 font-semibold text-sm whitespace-nowrap ${tab === k ? 'border-b-2 border-pink-400 text-white' : 'text-muted'}">${l}</a>`).join('')}
      </div>
      ${body}`;
    app().innerHTML = layout('#/admin', content);
  }

  /* --------------------------- Tela de login ----------------------------- */
  function viewAuth(mode) {
    const isLogin = mode !== 'register';
    document.body.innerHTML = `<div id="app"></div>`;
    $('#app').innerHTML = `
      <div class="min-h-screen grid lg:grid-cols-2">
        <div class="hidden lg:flex flex-col justify-between p-10 brand-gradient text-white">
          <div class="font-brand text-3xl font-extrabold">Impulsa</div>
          <div>
            <h2 class="font-brand text-4xl font-extrabold leading-tight">Aprenda.<br>Crie.<br>Venda.</h2>
            <p class="mt-4 max-w-sm opacity-90">A rede social do conhecimento que vira marketplace. Consuma conteúdo gratuito, siga criadores e compre infoprodutos direto nas publicações.</p>
            <ul class="mt-6 space-y-2 text-sm opacity-90">
              <li>${icon('check','w-4 h-4 inline')} Feed com curtidas, comentários e produtos</li>
              <li>${icon('check','w-4 h-4 inline')} Área de cursos e materiais gratuitos</li>
              <li>${icon('check','w-4 h-4 inline')} Painel de métricas para criadores</li>
            </ul>
          </div>
          <div class="text-sm opacity-75">© 2026 Impulsa · MVP</div>
        </div>
        <div class="flex items-center justify-center p-6">
          <div class="w-full max-w-sm">
            <div class="lg:hidden font-brand text-3xl font-extrabold brand-text mb-6 text-center">Impulsa</div>
            <h1 class="font-brand text-2xl font-bold mb-1">${isLogin ? 'Entrar' : 'Criar conta'}</h1>
            <p class="text-muted text-sm mb-5">${isLogin ? 'Bem-vindo de volta!' : 'Junte-se à comunidade.'}</p>
            <form data-form="${isLogin ? 'login' : 'register'}">
              ${isLogin ? '' : `
                <label class="field"><span>Nome completo</span><input class="input" name="name" required placeholder="Seu nome"></label>
                <label class="field"><span>Nome de usuário</span><input class="input" name="username" required placeholder="seuusuario"></label>`}
              <label class="field"><span>${isLogin ? 'E-mail ou usuário' : 'E-mail'}</span><input class="input" name="email" required placeholder="voce@email.com"></label>
              <label class="field"><span>Senha</span><input class="input" type="password" name="password" required placeholder="••••••"></label>
              <button class="btn btn-primary w-full mt-2">${isLogin ? 'Entrar' : 'Criar conta'}</button>
            </form>
            <p class="text-sm text-muted mt-4 text-center">
              ${isLogin ? `Não tem conta? <a href="#/register" class="brand-text font-semibold">Cadastre-se</a>` : `Já tem conta? <a href="#/login" class="brand-text font-semibold">Entrar</a>`}
            </p>
            ${isLogin ? `<div class="mt-6 surface-2 rounded-xl p-3 text-xs text-muted">
              <div class="font-semibold text-gray-300 mb-1">Contas de teste</div>
              <button class="block hover:text-white" data-action="demo-login" data-email="ana@impulsa.app">👩‍💼 Criadora: ana@impulsa.app / 123456</button>
              <button class="block hover:text-white" data-action="demo-login" data-email="admin@impulsa.app" data-pass="admin">🛡️ Admin: admin@impulsa.app / admin</button>
              <button class="block hover:text-white" data-action="demo-login" data-email="demo@impulsa.app" data-pass="demo">👤 Visitante: demo@impulsa.app / demo</button>
            </div>` : ''}
          </div>
        </div>
      </div>`;
  }

  function requireAuth() {
    const me = S.currentUser();
    if (!me) { location.hash = '#/login'; return null; }
    return me;
  }

  /* ----------------------------- Modais ---------------------------------- */
  function modalEditProfile() {
    const me = S.currentUser();
    openModal(`<h2 class="font-brand text-xl font-bold mb-4">Editar perfil</h2>
      <form data-form="edit-profile">
        <label class="field"><span>Nome</span><input class="input" name="name" value="${esc(me.name)}" required></label>
        <label class="field"><span>Biografia</span><textarea class="input" name="bio" rows="3">${esc(me.bio)}</textarea></label>
        <label class="field"><span>Foto de perfil (arquivo)</span><input class="input" type="file" name="avatar" accept="image/*"></label>
        <div class="flex gap-2 justify-end mt-2"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancelar</button><button class="btn btn-primary">Salvar</button></div>
      </form>`);
  }
  function modalNewProduct() {
    openModal(`<h2 class="font-brand text-xl font-bold mb-4">Novo infoproduto</h2>
      <form data-form="new-product">
        <label class="field"><span>Nome do produto</span><input class="input" name="name" required></label>
        <label class="field"><span>Descrição</span><textarea class="input" name="description" rows="2"></textarea></label>
        <div class="grid grid-cols-2 gap-3">
          <label class="field"><span>Preço (R$)</span><input class="input" type="number" step="0.01" name="price" value="0"></label>
          <label class="field"><span>Imagem (arquivo)</span><input class="input" type="file" name="image" accept="image/*"></label>
        </div>
        <label class="field"><span>Link de venda / checkout</span><input class="input" name="saleUrl" placeholder="https://..." required></label>
        <div class="flex gap-2 justify-end"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancelar</button><button class="btn btn-primary">Salvar produto</button></div>
      </form>`);
  }
  function modalNewFree() {
    const cats = S.categories().map((c) => `<option>${esc(c)}</option>`).join('');
    openModal(`<h2 class="font-brand text-xl font-bold mb-4">Publicar conteúdo gratuito</h2>
      <form data-form="new-free">
        <label class="field"><span>Título</span><input class="input" name="title" required></label>
        <label class="field"><span>Descrição</span><textarea class="input" name="description" rows="2"></textarea></label>
        <div class="grid grid-cols-2 gap-3">
          <label class="field"><span>Tipo</span><select class="input" name="type"><option>Curso</option><option>Aula</option><option>PDF</option><option>Material</option></select></label>
          <label class="field"><span>Categoria</span><select class="input" name="category">${cats}</select></label>
        </div>
        <label class="field"><span>Capa (arquivo)</span><input class="input" type="file" name="cover" accept="image/*"></label>
        <label class="field"><span>Link de acesso</span><input class="input" name="url" placeholder="https://..." required></label>
        <div class="flex gap-2 justify-end"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancelar</button><button class="btn btn-accent">Publicar</button></div>
      </form>`);
  }

  /* ------------------------ Leitura de arquivo --------------------------- */
  function readFile(input) {
    return new Promise((resolve) => {
      const f = input && input.files && input.files[0];
      if (!f) return resolve(null);
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(f);
    });
  }

  /* --------------------------- Delegação: clicks ------------------------- */
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const action = t.dataset.action;
    const me = S.currentUser();

    const needAuth = ['like', 'save', 'follow', 'comment'];
    if (needAuth.includes(action) && !me) { location.hash = '#/login'; return; }

    switch (action) {
      case 'logout': S.logout(); location.hash = '#/login'; toast('Você saiu da conta.'); break;
      case 'demo-login': {
        e.preventDefault();
        S.login(t.dataset.email, t.dataset.pass || '123456');
        location.hash = '#/feed'; render(); break;
      }
      case 'like': S.toggleLike(t.dataset.post, me.id); softRender(); break;
      case 'save': S.toggleSave(t.dataset.post, me.id); toast(S.isSaved(t.dataset.post, me.id) ? 'Salvo!' : 'Removido dos salvos'); softRender(); break;
      case 'share': {
        S.share(t.dataset.post);
        const url = location.origin + location.pathname + '#/post/' + t.dataset.post;
        if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
        toast('Link copiado para compartilhar!'); softRender(); break;
      }
      case 'open-post': location.hash = '#/post/' + t.dataset.post; break;
      case 'buy': case 'cta': if (t.dataset.post) S.trackClick(t.dataset.post); break; // segue o link normalmente
      case 'follow': S.follow(me.id, t.dataset.user); softRender(); break;
      case 'become-creator': S.becomeCreator(me.id); toast('Agora você é um criador! 🎉'); render(); break;
      case 'edit-profile': modalEditProfile(); break;
      case 'new-product': modalNewProduct(); break;
      case 'new-free': modalNewFree(); break;
      case 'close-modal': closeModal(); break;
      case 'del-product': S.deleteProduct(t.dataset.id); toast('Produto removido.'); render(); break;
      case 'admin-del-user': if (confirm('Remover este usuário e seus posts?')) { S.deleteUser(t.dataset.id); render(); } break;
      case 'admin-del-post': if (confirm('Remover esta publicação?')) { S.deletePost(t.dataset.id); render(); } break;
      case 'admin-feature': { const p = S.post(t.dataset.id); S.setFeatured(p.id, !p.featured); render(); break; }
      case 'admin-del-cat': S.removeCategory(t.dataset.name); render(); break;
      case 'admin-revoke-creator': S.updateUser(t.dataset.id, { isCreator: false }); render(); break;
    }
  });

  /* --------------------------- Delegação: forms -------------------------- */
  document.addEventListener('submit', async (e) => {
    const f = e.target.closest('[data-form]');
    if (!f) return;
    e.preventDefault();
    const data = Object.fromEntries(new FormData(f).entries());
    const type = f.dataset.form;
    const me = S.currentUser();

    try {
      switch (type) {
        case 'login': {
          const u = S.login(data.email, data.password);
          if (!u) return toast('Credenciais inválidas.');
          location.hash = '#/feed'; render(); break;
        }
        case 'register': {
          S.register(data); location.hash = '#/feed'; render(); toast('Conta criada! Bem-vindo 🎉'); break;
        }
        case 'search': location.hash = '#/explore?q=' + encodeURIComponent(data.q || ''); break;
        case 'create-post': {
          let media = '';
          if (data.type === 'video') media = data.mediaUrl || '';
          else if (data.type === 'image') media = await readFile(f.mediaFile) || '';
          const tags = (data.tags || '').split(',').map((s) => s.trim()).filter(Boolean);
          S.createPost({
            authorId: me.id, type: data.type, title: data.title, description: data.description,
            media, category: data.category, tags,
            cta: { label: data.ctaLabel || 'Quero acessar', url: data.ctaUrl || '' },
            productId: data.productId || null,
          });
          toast('Publicação criada! 🚀'); location.hash = '#/feed'; render(); break;
        }
        case 'comment': S.addComment(f.dataset.post, me.id, data.text); viewPost(f.dataset.post); break;
        case 'edit-profile': {
          const avatar = await readFile(f.avatar);
          S.updateUser(me.id, { name: data.name, bio: data.bio, ...(avatar ? { avatar } : {}) });
          closeModal(); toast('Perfil atualizado.'); render(); break;
        }
        case 'new-product': {
          const image = await readFile(f.image) || S.cover('#7c3aed', '#db2777', data.name.slice(0, 14));
          S.createProduct({ creatorId: me.id, name: data.name, description: data.description, price: parseFloat(data.price) || 0, image, saleUrl: data.saleUrl });
          closeModal(); toast('Produto cadastrado.'); render(); break;
        }
        case 'new-free': {
          const cover = await readFile(f.cover) || S.cover('#10b981', '#0ea5e9', data.type);
          S.createFreeContent({ authorId: me.id, title: data.title, description: data.description, type: data.type, category: data.category, cover, url: data.url });
          closeModal(); toast('Conteúdo publicado!'); render(); break;
        }
        case 'add-category': S.addCategory(data.name); render(); break;
      }
    } catch (err) { toast(err.message || 'Algo deu errado.'); }
  });

  /* ---------------- Live preview na criação de post ---------------------- */
  document.addEventListener('input', async (e) => {
    const form = e.target.closest('[data-form="create-post"]');
    if (!form) return;
    // alterna campo de mídia conforme o tipo
    if (e.target.name === 'type') {
      const isVideo = e.target.value === 'video';
      const mf = form.querySelector('[data-media-field]');
      const uf = form.querySelector('[data-mediaurl-field]');
      if (mf) mf.style.display = e.target.value === 'image' ? '' : 'none';
      if (uf) uf.style.display = isVideo ? '' : 'none';
    }
    updatePreview(form);
  });
  document.addEventListener('change', (e) => {
    const form = e.target.closest('[data-form="create-post"]');
    if (form && e.target.name === 'mediaFile') updatePreview(form);
  });
  async function updatePreview(form) {
    const me = S.currentUser(); if (!me) return;
    const d = Object.fromEntries(new FormData(form).entries());
    const box = document.querySelector('[data-preview]');
    if (!box) return;
    if (!d.title && !d.description) { box.innerHTML = emptyState('Sua publicação aparecerá aqui.'); return; }
    let media = '';
    if (d.type === 'video') media = d.mediaUrl || '';
    else if (d.type === 'image') media = await readFile(form.mediaFile) || '';
    const fake = {
      id: 'preview', authorId: me.id, type: d.type || 'image', title: d.title || 'Título da publicação',
      description: d.description || '', media, category: d.category || S.categories()[0],
      tags: (d.tags || '').split(',').map((s) => s.trim()).filter(Boolean),
      cta: { label: d.ctaLabel || 'Quero acessar', url: d.ctaUrl || '' }, productId: d.productId || null,
      likes: [], comments: [], shares: 0, views: 0, featured: false, createdAt: Date.now(),
    };
    box.innerHTML = postCard(fake);
  }

  /* ------------------------------- Router -------------------------------- */
  function parse() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query] = raw.split('?');
    return { parts: path.split('/').filter(Boolean), params: new URLSearchParams(query || '') };
  }

  // re-render leve (mantém scroll) reaproveitando a rota atual
  function softRender() { render(true); }

  function renderShell() { /* placeholder para futura atualização parcial de badges */ }

  function render(keepScroll) {
    const y = keepScroll ? window.scrollY : 0;
    const me = S.currentUser();
    const { parts, params } = parse();
    const route = parts[0] || (me ? 'feed' : 'login');

    // rotas de autenticação
    if (route === 'login' || route === 'register') {
      if (me) { location.hash = '#/feed'; return; }
      viewAuth(route); return;
    }
    if (!me) { viewAuth('login'); return; }

    // garante shell #app
    if (!$('#app')) document.body.innerHTML = '<div id="app"></div>';

    switch (route) {
      case 'feed': viewFeed(); break;
      case 'explore': viewExplore(params); break;
      case 'free': viewFree(params); break;
      case 'create': viewCreate(); break;
      case 'notifications': viewNotifications(); break;
      case 'me': viewProfile(null, params); break;
      case 'u': viewProfile(parts[1], params); break;
      case 'post': viewPost(parts[1]); break;
      case 'creator': viewCreator(); break;
      case 'admin': viewAdmin(params); break;
      default: location.hash = '#/feed'; return;
    }
    window.scrollTo(0, y);
  }

  window.addEventListener('hashchange', () => render());
  window.addEventListener('DOMContentLoaded', () => render());
  if (document.readyState !== 'loading') render();
})();
