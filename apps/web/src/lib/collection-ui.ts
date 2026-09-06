const independentCollectionSlugs = new Set(["rastros"]);

const collectionIcons: Record<string, string> = {
  consciencia: "ti-hexagons",
  world: "ti-world",
  pintas: "ti-palette",
  lagrimas: "ti-cloud",
  still: "ti-heart",
  placebo: "ti-moon",
  colores: "ti-flower",
  sismogamia: "ti-butterfly",
};

export function isMainCollection(slug?: string) {
  return Boolean(slug) && !independentCollectionSlugs.has(slug ?? "");
}

export function getCollectionIcon(slug?: string) {
  return collectionIcons[slug ?? ""] ?? "ti-book";
}
