/* ============================================================================
 * Impulsa — Store (estado + persistência local)
 * MVP sem backend: tudo é salvo em localStorage. Arquitetura preparada para,
 * no futuro, trocar esta camada por chamadas a uma API real.
 * ==========================================================================*/
(function (global) {
  'use strict';

  const KEY = 'impulsa.db.v1';
  const SESSION_KEY = 'impulsa.session.v1';

  const CATEGORIES = [
    'Marketing Digital',
    'Vendas',
    'Tráfego Pago',
    'Produtividade',
    'Desenvolvimento Pessoal',
  ];

  /* ---------- utilidades ---------- */
  const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const now = () => Date.now();
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ---------- seed inicial ---------- */
  function seed() {
    const u = {
      ana:   { id: 'u_ana',   name: 'Ana Marketing',   username: 'anamkt',     email: 'ana@impulsa.app',   password: '123456', avatar: avatarFor('Ana Marketing', '#7c3aed'),   bio: 'Especialista em marketing digital • +10 anos ajudando criadores a venderem todo dia 🚀', isCreator: true,  isAdmin: false, followers: [], following: [], saved: [] },
      bruno: { id: 'u_bruno', name: 'Bruno Tráfego',   username: 'brunoads',   email: 'bruno@impulsa.app', password: '123456', avatar: avatarFor('Bruno Trafego', '#db2777'),    bio: 'Gestor de tráfego pago • Escalando negócios com Meta e Google Ads 📈', isCreator: true,  isAdmin: false, followers: [], following: [], saved: [] },
      clara: { id: 'u_clara', name: 'Clara Vendas',    username: 'claravendas', email: 'clara@impulsa.app', password: '123456', avatar: avatarFor('Clara Vendas', '#0ea5e9'),    bio: 'Copywriter & especialista em conversão. Transformo palavras em vendas ✍️', isCreator: true, isAdmin: false, followers: [], following: [], saved: [] },
      admin: { id: 'u_admin', name: 'Admin Impulsa',   username: 'admin',      email: 'admin@impulsa.app', password: 'admin',  avatar: avatarFor('Admin', '#0f172a'),            bio: 'Equipe Impulsa', isCreator: true, isAdmin: true, followers: [], following: [], saved: [] },
      voce:  { id: 'u_voce',  name: 'Visitante',       username: 'visitante',  email: 'demo@impulsa.app',  password: 'demo',   avatar: avatarFor('Visitante', '#475569'),         bio: 'Aprendendo e crescendo na Impulsa.', isCreator: false, isAdmin: false, followers: [], following: [], saved: [] },
    };

    const products = [
      { id: 'p1', creatorId: u.ana.id,   name: 'Método Venda Todo Dia',        price: 297, image: cover('#7c3aed', '#db2777', 'Venda Todo Dia'),  description: 'Curso completo com o passo a passo para fazer vendas digitais consistentes, todos os dias.', saleUrl: 'https://exemplo.com/checkout/venda-todo-dia' },
      { id: 'p2', creatorId: u.bruno.id, name: 'Tráfego Pago do Zero ao Pro',  price: 497, image: cover('#db2777', '#f59e0b', 'Tráfego Pro'),    description: 'Aprenda a criar campanhas lucrativas no Meta Ads e Google Ads, do básico ao avançado.', saleUrl: 'https://exemplo.com/checkout/trafego-pro' },
      { id: 'p3', creatorId: u.clara.id, name: 'Copywriting que Converte',     price: 197, image: cover('#0ea5e9', '#7c3aed', 'Copy que Vende'),  description: 'Modelos e gatilhos de copy prontos para aumentar a conversão das suas páginas e anúncios.', saleUrl: 'https://exemplo.com/checkout/copy-converte' },
    ];

    const posts = [
      {
        id: uid('post'), authorId: u.ana.id, type: 'image',
        title: '5 estratégias para vender todos os dias',
        description: 'Constância é o segredo. Nesse post eu compartilho as 5 alavancas que uso para gerar vendas diárias sem depender de sorte. Salve para aplicar! 👇',
        media: cover('#7c3aed', '#db2777', '5 Estratégias'),
        category: 'Vendas', tags: ['vendas', 'estrategia', 'consistencia'],
        cta: { label: 'Quero acessar', url: '' }, productId: 'p1',
        likes: [u.bruno.id, u.clara.id], comments: [{ id: uid('c'), userId: u.clara.id, text: 'Conteúdo certeiro! 🔥', ts: now() - 3600e3 }],
        shares: 12, views: 1840, linkClicks: 73, conversions: 6, featured: true, createdAt: now() - 3600e3 * 5,
      },
      {
        id: uid('post'), authorId: u.bruno.id, type: 'image',
        title: 'Como reduzir o custo por lead em 40%',
        description: 'Otimizei uma campanha essa semana e baixei o CPL de R$12 para R$7. O segredo está na segmentação e no criativo. Detalhei tudo no produto. 📉',
        media: cover('#db2777', '#f59e0b', 'CPL -40%'),
        category: 'Tráfego Pago', tags: ['trafego', 'metaads', 'cpl'],
        cta: { label: 'Ver treinamento', url: '' }, productId: 'p2',
        likes: [u.ana.id], comments: [],
        shares: 5, views: 920, linkClicks: 41, conversions: 3, featured: false, createdAt: now() - 3600e3 * 20,
      },
      {
        id: uid('post'), authorId: u.clara.id, type: 'text',
        title: 'O gatilho mental que mais converte',
        description: 'Prova social. Sempre. As pessoas compram o que outras pessoas já aprovaram. Mostre resultados, depoimentos e números reais. Simples e poderoso.',
        media: '',
        category: 'Marketing Digital', tags: ['copywriting', 'gatilhos', 'conversao'],
        cta: { label: 'Quero a aula', url: '' }, productId: 'p3',
        likes: [u.ana.id, u.bruno.id, u.voce.id], comments: [{ id: uid('c'), userId: u.bruno.id, text: 'Prova social é tudo!', ts: now() - 1800e3 }],
        shares: 8, views: 1320, linkClicks: 55, conversions: 4, featured: true, createdAt: now() - 3600e3 * 30,
      },
      {
        id: uid('post'), authorId: u.ana.id, type: 'image',
        title: 'Sua bio do perfil está perdendo vendas',
        description: 'A bio é seu outdoor. Em 1 linha diga: o que você faz + para quem + qual transformação. Coloque 1 CTA claro. Pronto. ✨',
        media: cover('#0ea5e9', '#10b981', 'Bio que Vende'),
        category: 'Marketing Digital', tags: ['perfil', 'bio', 'branding'],
        cta: { label: 'Saiba mais', url: 'https://exemplo.com' }, productId: null,
        likes: [u.clara.id], comments: [],
        shares: 3, views: 610, linkClicks: 18, conversions: 0, featured: false, createdAt: now() - 3600e3 * 50,
      },
    ];

    const freeContent = [
      { id: uid('fc'), authorId: u.ana.id,   title: 'Mini-curso: Primeiros passos no Marketing Digital', type: 'Curso',    category: 'Marketing Digital',        description: '4 aulas para quem está começando do absoluto zero.', cover: cover('#7c3aed', '#0ea5e9', 'Curso Grátis'), url: 'https://exemplo.com/curso-gratis' },
      { id: uid('fc'), authorId: u.bruno.id, title: 'Aula: Estrutura de campanha lucrativa',             type: 'Aula',     category: 'Tráfego Pago',             description: 'Como montar uma campanha do zero passo a passo.',    cover: cover('#db2777', '#7c3aed', 'Aula Tráfego'), url: 'https://exemplo.com/aula-trafego' },
      { id: uid('fc'), authorId: u.clara.id, title: 'PDF: 30 headlines que vendem',                      type: 'PDF',      category: 'Vendas',                    description: 'Banco de headlines prontas para usar hoje.',          cover: cover('#f59e0b', '#db2777', '30 Headlines'), url: 'https://exemplo.com/headlines.pdf' },
      { id: uid('fc'), authorId: u.ana.id,   title: 'Material: Planner de produtividade do criador',     type: 'Material', category: 'Produtividade',             description: 'Organize sua semana de conteúdo e vendas.',           cover: cover('#10b981', '#0ea5e9', 'Planner'), url: 'https://exemplo.com/planner' },
      { id: uid('fc'), authorId: u.clara.id, title: 'Aula: Mentalidade de quem vende todo dia',          type: 'Aula',     category: 'Desenvolvimento Pessoal',   description: 'O lado mental do jogo dos negócios digitais.',        cover: cover('#6366f1', '#db2777', 'Mentalidade'), url: 'https://exemplo.com/mentalidade' },
    ];

    // relacionamentos de exemplo
    u.voce.following = [u.ana.id, u.clara.id];
    u.ana.followers = [u.voce.id, u.bruno.id];
    u.clara.followers = [u.voce.id];
    u.bruno.following = [u.ana.id];
    u.ana.following = [u.bruno.id];

    const notifications = [
      { id: uid('n'), userId: u.ana.id, type: 'like', text: 'Bruno Tráfego curtiu seu post.', ts: now() - 600e3, read: false },
    ];

    return {
      users: Object.values(u),
      posts,
      products,
      freeContent,
      notifications,
      categories: CATEGORIES.slice(),
    };
  }

  /* ---------- geradores de imagem (SVG inline, sem dependências externas) ---------- */
  function avatarFor(name, color) {
    const initials = name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='160' height='160' fill='${color}'/><text x='50%' y='52%' font-family='Inter,Arial' font-size='64' fill='white' font-weight='700' text-anchor='middle' dominant-baseline='middle'>${initials}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  function cover(c1, c2, label) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs><rect width='800' height='600' fill='url(%23g)'/><text x='50%' y='52%' font-family='Inter,Arial' font-size='52' fill='white' font-weight='800' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /* ---------- camada de persistência ---------- */
  let db;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { db = JSON.parse(raw); return; }
    } catch (e) { /* ignore */ }
    db = seed();
    save();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { console.warn('Falha ao salvar', e); }
  }

  /* ---------- API pública do Store ---------- */
  const Store = {
    CATEGORIES,
    avatarFor, cover, uid, now,

    reset() { localStorage.removeItem(KEY); localStorage.removeItem(SESSION_KEY); load(); },

    /* sessão / auth */
    session() { return localStorage.getItem(SESSION_KEY); },
    currentUser() { const id = this.session(); return id ? this.user(id) : null; },
    login(emailOrUser, password) {
      const e = (emailOrUser || '').trim().toLowerCase();
      const found = db.users.find((u) => (u.email.toLowerCase() === e || u.username.toLowerCase() === e) && u.password === password);
      if (!found) return null;
      localStorage.setItem(SESSION_KEY, found.id);
      return found;
    },
    register({ name, username, email, password }) {
      email = (email || '').trim();
      username = (username || '').trim().replace(/\s+/g, '').toLowerCase();
      if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error('E-mail já cadastrado.');
      if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) throw new Error('Nome de usuário já existe.');
      const user = { id: uid('u'), name, username, email, password, avatar: avatarFor(name, '#7c3aed'), bio: '', isCreator: false, isAdmin: false, followers: [], following: [], saved: [] };
      db.users.push(user); save();
      localStorage.setItem(SESSION_KEY, user.id);
      return user;
    },
    logout() { localStorage.removeItem(SESSION_KEY); },

    /* usuários */
    users() { return db.users; },
    user(id) { return db.users.find((u) => u.id === id); },
    userByUsername(un) { return db.users.find((u) => u.username.toLowerCase() === (un || '').toLowerCase()); },
    updateUser(id, patch) { const u = this.user(id); if (u) { Object.assign(u, patch); save(); } return u; },
    deleteUser(id) { db.users = db.users.filter((u) => u.id !== id); db.posts = db.posts.filter((p) => p.authorId !== id); save(); },
    becomeCreator(id) { return this.updateUser(id, { isCreator: true }); },

    follow(meId, targetId) {
      if (meId === targetId) return;
      const me = this.user(meId), t = this.user(targetId);
      if (!me || !t) return;
      if (me.following.includes(targetId)) {
        me.following = me.following.filter((x) => x !== targetId);
        t.followers = t.followers.filter((x) => x !== meId);
      } else {
        me.following.push(targetId); t.followers.push(meId);
        this.notify(targetId, 'follow', `${me.name} começou a seguir você.`);
      }
      save();
    },
    isFollowing(meId, targetId) { const me = this.user(meId); return !!me && me.following.includes(targetId); },

    /* posts */
    posts() { return db.posts; },
    post(id) { return db.posts.find((p) => p.id === id); },
    postsBy(userId) { return db.posts.filter((p) => p.authorId === userId).sort((a, b) => b.createdAt - a.createdAt); },
    createPost(data) {
      const post = Object.assign({
        id: uid('post'), likes: [], comments: [], shares: 0, views: 0,
        linkClicks: 0, conversions: 0, featured: false, createdAt: now(),
      }, data);
      db.posts.unshift(post); save();
      return post;
    },
    deletePost(id) { db.posts = db.posts.filter((p) => p.id !== id); db.users.forEach((u) => { u.saved = u.saved.filter((s) => s !== id); }); save(); },
    toggleLike(postId, userId) {
      const p = this.post(postId); if (!p) return;
      if (p.likes.includes(userId)) p.likes = p.likes.filter((x) => x !== userId);
      else { p.likes.push(userId); if (p.authorId !== userId) this.notify(p.authorId, 'like', `${this.user(userId).name} curtiu seu post "${p.title}".`); }
      save();
    },
    addComment(postId, userId, text) {
      const p = this.post(postId); if (!p || !text.trim()) return;
      p.comments.push({ id: uid('c'), userId, text: text.trim(), ts: now() });
      if (p.authorId !== userId) this.notify(p.authorId, 'comment', `${this.user(userId).name} comentou no seu post.`);
      save();
    },
    share(postId) { const p = this.post(postId); if (p) { p.shares++; save(); } },
    addView(postId) { const p = this.post(postId); if (p) { p.views++; save(); } },
    trackClick(postId) { const p = this.post(postId); if (p) { p.linkClicks++; if (Math.random() < 0.25) p.conversions++; save(); } },
    toggleSave(postId, userId) {
      const u = this.user(userId); if (!u) return;
      if (u.saved.includes(postId)) u.saved = u.saved.filter((x) => x !== postId);
      else u.saved.push(postId);
      save();
    },
    isSaved(postId, userId) { const u = this.user(userId); return !!u && u.saved.includes(postId); },
    setFeatured(postId, val) { const p = this.post(postId); if (p) { p.featured = val; save(); } },

    /* produtos */
    products() { return db.products; },
    product(id) { return db.products.find((p) => p.id === id); },
    productsBy(creatorId) { return db.products.filter((p) => p.creatorId === creatorId); },
    createProduct(data) { const prod = Object.assign({ id: uid('prod') }, data); db.products.push(prod); save(); return prod; },
    deleteProduct(id) { db.products = db.products.filter((p) => p.id !== id); db.posts.forEach((p) => { if (p.productId === id) p.productId = null; }); save(); },

    /* conteúdo gratuito */
    freeContent() { return db.freeContent; },
    createFreeContent(data) { const fc = Object.assign({ id: uid('fc') }, data); db.freeContent.unshift(fc); save(); return fc; },
    deleteFreeContent(id) { db.freeContent = db.freeContent.filter((f) => f.id !== id); save(); },

    /* categorias */
    categories() { return db.categories; },
    addCategory(name) { name = (name || '').trim(); if (name && !db.categories.includes(name)) { db.categories.push(name); save(); } },
    removeCategory(name) { db.categories = db.categories.filter((c) => c !== name); save(); },

    /* notificações */
    notify(userId, type, text) { db.notifications.unshift({ id: uid('n'), userId, type, text, ts: now(), read: false }); save(); },
    notifications(userId) { return db.notifications.filter((n) => n.userId === userId).sort((a, b) => b.ts - a.ts); },
    unreadCount(userId) { return db.notifications.filter((n) => n.userId === userId && !n.read).length; },
    markAllRead(userId) { db.notifications.forEach((n) => { if (n.userId === userId) n.read = true; }); save(); },

    /* feed: "algoritmo" simples de relevância */
    feed(userId) {
      const me = this.user(userId);
      const following = me ? me.following : [];
      const score = (p) => {
        const ageH = (now() - p.createdAt) / 3600e3;
        const recency = Math.max(0, 48 - ageH);             // mais novo = melhor
        const engagement = p.likes.length * 3 + p.comments.length * 4 + p.shares * 2 + p.views * 0.02;
        const affinity = following.includes(p.authorId) ? 60 : 0; // quem você segue
        const boost = p.featured ? 40 : 0;                  // destacado pelo admin
        return recency + engagement + affinity + boost;
      };
      return db.posts.slice().sort((a, b) => score(b) - score(a));
    },

    /* métricas agregadas do criador */
    creatorStats(creatorId) {
      const ps = this.postsBy(creatorId);
      return ps.reduce((acc, p) => {
        acc.views += p.views; acc.likes += p.likes.length;
        acc.comments += p.comments.length; acc.clicks += p.linkClicks;
        acc.conversions += p.conversions; acc.posts++;
        return acc;
      }, { views: 0, likes: 0, comments: 0, clicks: 0, conversions: 0, posts: 0 });
    },
  };

  load();
  global.Store = Store;
})(window);
