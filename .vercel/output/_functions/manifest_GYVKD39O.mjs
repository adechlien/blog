import 'piccolore';
import { k as decodeKey } from './chunks/astro/server__KwETd4v.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_BtWpe_5B.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/Dell/Documents/blog/","cacheDir":"file:///C:/Users/Dell/Documents/blog/node_modules/.astro/","outDir":"file:///C:/Users/Dell/Documents/blog/dist/","srcDir":"file:///C:/Users/Dell/Documents/blog/src/","publicDir":"file:///C:/Users/Dell/Documents/blog/public/","buildClientDir":"file:///C:/Users/Dell/Documents/blog/dist/client/","buildServerDir":"file:///C:/Users/Dell/Documents/blog/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"404.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"rss.xml","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml\\/?$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.js","pathname":"/rss.xml","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/likes","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/likes\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"likes","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/likes.ts","pathname":"/api/likes","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://adechlien.blog","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/Dell/Documents/blog/src/pages/404.astro",{"propagation":"none","containsHead":true}],["C:/Users/Dell/Documents/blog/src/pages/[type]/[entry].astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/Dell/Documents/blog/src/pages/[type]/index.astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/Dell/Documents/blog/src/pages/[year].astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/Dell/Documents/blog/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/Dell/Documents/blog/src/pages/writers/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["C:/Users/Dell/Documents/blog/src/components/Collections.astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["C:/Users/Dell/Documents/blog/src/components/Destacados.astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/Dell/Documents/blog/src/components/History.astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/Dell/Documents/blog/src/components/Recent.astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/[type]/[entry]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/[type]/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/[year]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/Dell/Documents/blog/src/pages/rss.xml.js",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/rss.xml@_@js",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/writers/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/404@_@astro":"pages/404.astro.mjs","\u0000@astro-page:src/pages/api/likes@_@ts":"pages/api/likes.astro.mjs","\u0000@astro-page:src/pages/rss.xml@_@js":"pages/rss.xml.astro.mjs","\u0000@astro-page:src/pages/writers/[...slug]@_@astro":"pages/writers/_---slug_.astro.mjs","\u0000@astro-page:src/pages/[type]/[entry]@_@astro":"pages/_type_/_entry_.astro.mjs","\u0000@astro-page:src/pages/[type]/index@_@astro":"pages/_type_.astro.mjs","\u0000@astro-page:src/pages/[year]@_@astro":"pages/_year_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_GYVKD39O.mjs","C:/Users/Dell/Documents/blog/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_BKF8Kx-E.mjs","C:\\Users\\Dell\\Documents\\blog\\.astro\\content-assets.mjs":"chunks/content-assets_DleWbedO.mjs","C:\\Users\\Dell\\Documents\\blog\\.astro\\content-modules.mjs":"chunks/content-modules_Dz-S_Wwv.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_BoexByBr.mjs","C:/Users/Dell/Documents/blog/src/components/Collections.astro?astro&type=script&index=0&lang.ts":"_astro/Collections.astro_astro_type_script_index_0_lang.Bt9yYK8Q.js","C:/Users/Dell/Documents/blog/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts":"_astro/ClientRouter.astro_astro_type_script_index_0_lang.CDGfc0hd.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["C:/Users/Dell/Documents/blog/src/components/Collections.astro?astro&type=script&index=0&lang.ts","const l=document.querySelector(\"#collections-carousel\");if(l){const e=l.querySelector(\"[data-track]\"),t=l.querySelector(\"[data-list]\"),c=l.querySelector(\"[data-prev]\"),n=l.querySelector(\"[data-next]\");if(e&&t&&c&&n){const s=Array.from(t.children);s.forEach(r=>{const d=r.cloneNode(!0),f=r.cloneNode(!0);t.appendChild(d),t.insertBefore(f,t.firstChild)});const o=t.scrollWidth/3;e.scrollLeft=o;const i=()=>{const r=t.children[s.length];return r?r.getBoundingClientRect().width+40:200},a=()=>{e.scrollLeft<=o*.5?e.scrollLeft+=o:e.scrollLeft>=o*1.5&&(e.scrollLeft-=o)};c.addEventListener(\"click\",()=>{e.scrollBy({left:-i(),behavior:\"smooth\"})}),n.addEventListener(\"click\",()=>{e.scrollBy({left:i(),behavior:\"smooth\"})}),e.addEventListener(\"scroll\",()=>{window.requestAnimationFrame(a)})}}"]],"assets":["/_astro/_entry_.DqWBfpRG.css","/avatar.webp","/banner.svg","/favicon.svg","/_redirects","/admin/config.yml","/admin/index.html","/albums/blanco.png","/albums/cracker.png","/albums/data.png","/albums/donkbron.png","/albums/estopa.png","/albums/muerte.png","/albums/novena.png","/albums/psane.png","/albums/qnept.png","/albums/retro.png","/albums/wearenotyourkind.png","/albums/wings.png","/videos/GRIS.png","/videos/GRIS2.png","/icons/bee.svg","/icons/bee22.svg","/icons/cloud.svg","/icons/flower.svg","/icons/heart.svg","/icons/moon.svg","/icons/world.svg","/portrait/anya.webp","/portrait/buho.jpeg","/portrait/buho.webp","/portrait/buses.webp","/portrait/campesina.svg","/portrait/carta.webp","/portrait/cielo.webp","/portrait/comunidad.jpeg","/portrait/comunidad.webp","/portrait/contiendas.webp","/portrait/curitas.webp","/portrait/desarraigo.webp","/portrait/despertar.webp","/portrait/despues.webp","/portrait/dormir.webp","/portrait/duquesa.webp","/portrait/durmiendo.webp","/portrait/ella.webp","/portrait/envejecer.webp","/portrait/escribo.webp","/portrait/gozo.webp","/portrait/huellas.webp","/portrait/humano.webp","/portrait/IMG_2370.JPEG","/portrait/IMG_6032.JPEG","/portrait/IMG_7144.JPEG","/portrait/IMG_7460.JPEG","/portrait/IMG_7697.JPEG","/portrait/indeciso.webp","/portrait/inexactitud.webp","/portrait/inexpresivo.JPEG","/portrait/ir.webp","/portrait/lenguaje.jpeg","/portrait/lenguaje.webp","/portrait/liberando.webp","/portrait/llorar.webp","/portrait/marco.webp","/portrait/memorias.webp","/portrait/mono.webp","/portrait/mostacillas.webp","/portrait/partes.jpeg","/portrait/partes.webp","/portrait/pensar.webp","/portrait/placeholder.svg","/portrait/pulseras.webp","/portrait/rendicion.webp","/portrait/respirar.webp","/portrait/rocas.webp","/portrait/senora.webp","/portrait/sin-titulo.svg","/portrait/soledad-2.webp","/portrait/soledad.webp","/portrait/tarta.webp","/portrait/teatro.webp","/portrait/ter.webp","/portrait/untitled-iv.svg","/portrait/vueltas.webp","/portrait/yo.webp","/writers/bukowski.jpg","/writers/bukowski.png","/writers/bukowski2.jpg","/writers/pizarnik.png","/writers/pizarnik.webp","/_astro/ClientRouter.astro_astro_type_script_index_0_lang.CDGfc0hd.js","/404.html","/rss.xml","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"TlRj06jkb5glRsD7m5XiQd1rwnhNMbY7PsMbiPxVBbg="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
