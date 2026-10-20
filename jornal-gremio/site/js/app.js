(() => {
  const config = window.JORNAL_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const esc = (value = "") => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const fmtDate = (value) => {
    if (!value) return "";
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR", {day:"2-digit", month:"long", year:"numeric"});
  };
  const coverMarkup = (issue, className = "cover") => issue.capa
    ? `<img class="${className}" src="${esc(issue.capa)}" alt="Capa da ${esc(issue.titulo)}" loading="lazy">`
    : `<div class="${className}-placeholder"><span>${esc(issue.numero || "EDIÇÃO")}</span><span>${esc(issue.titulo || "Jornal do Grêmio")}</span></div>`;
  const newsCard = (item) => `<article class="news-card">${item.imagem ? `<a href="noticia.html?id=${encodeURIComponent(item.id)}"><img src="${esc(item.imagem)}" alt="" loading="lazy"></a>` : ""}<span class="category">${esc(item.categoria || "Notícia")}</span><a href="noticia.html?id=${encodeURIComponent(item.id)}"><h3>${esc(item.titulo)}</h3></a><p>${esc(item.resumo || "")}</p><div class="card-meta">${esc(item.autor || "Redação")} · ${esc(fmtDate(item.data))}</div></article>`;
  const issueCard = (issue) => `<article class="issue-card"><a href="noticia.html?edicao=${encodeURIComponent(issue.id)}">${coverMarkup(issue)}</a><span class="issue-number">Edição ${esc(issue.numero || "")} · ${esc(fmtDate(issue.data))}</span><a href="noticia.html?edicao=${encodeURIComponent(issue.id)}"><h3>${esc(issue.titulo)}</h3></a><p>${esc(issue.descricao || "")}</p><a class="text-link" href="noticia.html?edicao=${encodeURIComponent(issue.id)}">Abrir edição ↗</a></article>`;
  async function getCatalog() {
    const response = await fetch("data/catalogo.json");
    if (!response.ok) throw new Error("O catálogo ainda não foi publicado.");
    return response.json();
  }
  function setBrand() {
    document.querySelectorAll("#site-name").forEach(el => el.textContent = config.nome || "Jornal do Grêmio");
    document.querySelectorAll("#footer-name").forEach(el => el.textContent = config.nome || "Jornal do Grêmio");
    const desc = $("#site-description");
    if (desc && config.descricao) desc.textContent = config.descricao;
    document.title = document.title.replace("Jornal do Grêmio", config.nome || "Jornal do Grêmio");
  }
  async function home() {
    try {
      const data = await getCatalog();
      const issue = data.edicoes[0];
      const feature = $("#featured-issue");
      if (feature) feature.innerHTML = issue ? `${coverMarkup(issue)}<div><span class="issue-number">EDIÇÃO ${esc(issue.numero || "")} · ${esc(fmtDate(issue.data))}</span><h3>${esc(issue.titulo)}</h3><p>${esc(issue.descricao || "")}</p><a class="button" href="noticia.html?edicao=${encodeURIComponent(issue.id)}">Explorar edição <span>↗</span></a></div>` : `<div class="empty-state">Ainda não há edições publicadas. Adicione uma pasta em <code>edicoes/</code> para começar.</div>`;
      const latest = $("#latest-news");
      if (latest) latest.innerHTML = data.noticias.length ? data.noticias.slice(0, 6).map(newsCard).join("") : `<div class="empty-state">Ainda não há notícias publicadas. Adicione um arquivo Markdown em <code>conteudo/noticias/</code>.</div>`;
    } catch (error) { showError(error); }
  }
  async function issuesPage() {
    try {
      const data = await getCatalog();
      const grid = $("#issues-grid");
      if (grid) grid.innerHTML = data.edicoes.length ? data.edicoes.map(issueCard).join("") : `<div class="empty-state">Nenhuma edição publicada ainda.</div>`;
    } catch (error) { showError(error); }
  }
  function renderMarkdown(text) {
    if (window.marked) { marked.setOptions({gfm:true, breaks:false}); return marked.parse(text || ""); }
    return `<p>${esc(text || "").replace(/\n/g, "<br>")}</p>`;
  }
  async function articlePage() {
    const target = $("#article-content");
    if (!target) return;
    try {
      const data = await getCatalog();
      const params = new URLSearchParams(location.search);
      const editionId = params.get("edicao");
      const id = params.get("id");
      if (editionId) {
        const issue = data.edicoes.find(item => item.id === editionId);
        if (!issue) throw new Error("Edição não encontrada.");
        $("#article-back").href = "edicoes.html";
        $("#article-back").textContent = "← Voltar para as edições";
        target.innerHTML = `<header class="article-header"><p class="eyebrow">REVISTA DIGITAL · EDIÇÃO ${esc(issue.numero || "")}</p><h1>${esc(issue.titulo)}</h1><p class="article-summary">${esc(issue.descricao || "")}</p><div class="card-meta">${esc(fmtDate(issue.data))}</div></header>${issue.capa ? `<img class="article-hero" src="${esc(issue.capa)}" alt="Capa da edição">` : ""}<div class="article-body"><h2>Índice da edição</h2><ol>${issue.materias.map(m => `<li><a href="noticia.html?id=${encodeURIComponent(m.id)}">${esc(m.titulo)}</a>${m.resumo ? ` — ${esc(m.resumo)}` : ""}</li>`).join("")}</ol></div>`;
        return;
      }
      const item = data.noticias.find(n => n.id === id) || data.materias.find(n => n.id === id);
      if (!item) throw new Error("Matéria não encontrada. Confira o link ou volte à página inicial.");
      $("#article-back").href = item.edicaoId ? `noticia.html?edicao=${encodeURIComponent(item.edicaoId)}` : "./";
      $("#article-back").textContent = item.edicaoId ? "← Voltar à edição" : "← Voltar ao jornal";
      target.innerHTML = `<header class="article-header"><p class="eyebrow">${esc(item.categoria || "MATÉRIA")}</p><h1>${esc(item.titulo)}</h1><p class="article-summary">${esc(item.resumo || "")}</p><div class="card-meta">${esc(item.autor || "Redação")} · ${esc(fmtDate(item.data))}${item.edicaoTitulo ? ` · ${esc(item.edicaoTitulo)}` : ""}</div></header>${item.imagem ? `<img class="article-hero" src="${esc(item.imagem)}" alt="">` : ""}<div class="article-body">${renderMarkdown(item.corpo || "")}</div>`;
      document.title = `${item.titulo} — ${config.nome || "Jornal do Grêmio"}`;
    } catch (error) { showError(error); }
  }
  function showError(error) {
    document.querySelectorAll("#featured-issue, #latest-news, #issues-grid, #article-content").forEach(el => {
      if (el) el.innerHTML = `<div class="error-box"><strong>Não foi possível carregar o conteúdo.</strong><br>${esc(error.message || "Tente novamente mais tarde.")}</div>`;
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    setBrand();
    if ($("#featured-issue")) home();
    if ($("#issues-grid")) issuesPage();
    if ($("#article-content")) articlePage();
  });
})();
