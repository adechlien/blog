
  const counts = new Map<string, number>();
  const pending = new Set<string>();
  const initialized = new WeakSet<Element>();
  const liked = new Set<string>();
  function isLiked(id: string) { try { return localStorage.getItem(`text-liked:${id}`) === "true"; } catch { return liked.has(id); } }
  function sync(id: string) {
    document.querySelectorAll<HTMLElement>('[data-text-card]').forEach(card => {
      if (card.dataset.textId !== id) return;
      const button = card.querySelector<HTMLButtonElement>('[data-card-like]')!;
      button.setAttribute('aria-pressed', String(isLiked(id)));
      button.disabled = pending.has(id);
      card.querySelector('[data-card-count]')!.textContent = counts.has(id) ? String(counts.get(id)) : '—';
    });
  }
  const observer = new IntersectionObserver(entries => entries.forEach(async entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    const id = (entry.target as HTMLElement).dataset.textId!;
    if (counts.has(id) || pending.has(id)) { sync(id); return; }
    pending.add(id);
    try {
      const response = await fetch(`/actions/likes?textId=${encodeURIComponent(id)}`);
      if (!response.ok) throw new Error();
      counts.set(id, (await response.json()).likes);
    } catch { /* Keep an unknown count when the service is unavailable. */ }
    finally { pending.delete(id); sync(id); }
  }));
  function init() {
    document.querySelectorAll<HTMLElement>('[data-text-card]').forEach(card => {
      if (initialized.has(card)) return;
      initialized.add(card);
      sync(card.dataset.textId!);
      observer.observe(card);
    });
  }
  new MutationObserver(init).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('astro:page-load', init);
  init();
  document.addEventListener('click', async event => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest<HTMLButtonElement>('[data-card-like], [data-card-share]');
    const card = button?.closest<HTMLElement>('[data-text-card]');
    if (!button || !card) return;
    const status = card.querySelector<HTMLElement>('.text-card-status')!;
    status.textContent = '';
    if (button.hasAttribute('data-card-share')) {
      const url = new URL(button.dataset.url!, location.origin).href;
      try {
        if (navigator.share) await navigator.share({ title: button.dataset.title, url });
        else { await navigator.clipboard.writeText(url); status.textContent = 'Enlace copiado'; }
      } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) status.textContent = 'No se pudo compartir el enlace. Inténtalo de nuevo.'; }
      return;
    }
    const id = card.dataset.textId!;
    if (pending.has(id)) return;
    const next = !isLiked(id);
    pending.add(id); sync(id);
    try {
      const response = await fetch('/actions/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ textId: id, action: next ? 'like' : 'unlike' }) });
      if (!response.ok) throw new Error();
      counts.set(id, (await response.json()).likes);
      if (next) liked.add(id); else liked.delete(id);
      try { localStorage.setItem(`text-liked:${id}`, String(next)); } catch {}
    } catch { status.textContent = 'No se pudo guardar el like. Inténtalo de nuevo.'; }
    finally { pending.delete(id); sync(id); }
  });
