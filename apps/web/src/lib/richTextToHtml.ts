type LexicalNode = {
  type?: string;
  text?: string;
  tag?: string;
  listType?: string;
  url?: string;
  fields?: {
    url?: string;
    newTab?: boolean;
    linkType?: string;
  };
  format?: number | string;
  children?: LexicalNode[];
  [key: string]: unknown;
};

type LexicalRichText = {
  root?: LexicalNode;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderChildren(children: LexicalNode[] = []): string {
  return children.map(renderNode).join("");
}

function applyTextFormat(text: string, format?: number | string): string {
  let html = escapeHtml(text);

  // Lexical usually stores text format as a bitmask.
  // 1 = bold, 2 = italic, 4 = strikethrough, 8 = underline, 16 = code.
  if (typeof format === "number") {
    if (format & 16) html = `<code>${html}</code>`;
    if (format & 8) html = `<u>${html}</u>`;
    if (format & 4) html = `<s>${html}</s>`;
    if (format & 2) html = `<em>${html}</em>`;
    if (format & 1) html = `<strong>${html}</strong>`;
  }

  return html;
}

function renderTextNode(node: LexicalNode): string {
  return applyTextFormat(node.text ?? "", node.format);
}

function renderHeading(node: LexicalNode): string {
  const allowedTags = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const tag = typeof node.tag === "string" && allowedTags.includes(node.tag)
    ? node.tag
    : "h2";

  return `<${tag}>${renderChildren(node.children)}</${tag}>`;
}

function renderParagraph(node: LexicalNode): string {
  const content = renderChildren(node.children).trim();

  if (!content) {
    return "";
  }

  return `<p>${content}</p>`;
}

function renderQuote(node: LexicalNode): string {
  return `<blockquote>${renderChildren(node.children)}</blockquote>`;
}

function renderList(node: LexicalNode): string {
  const tag = node.listType === "number" ? "ol" : "ul";

  return `<${tag}>${renderChildren(node.children)}</${tag}>`;
}

function renderListItem(node: LexicalNode): string {
  return `<li>${renderChildren(node.children)}</li>`;
}

function renderLink(node: LexicalNode): string {
  const href = node.fields?.url ?? node.url ?? "#";
  const safeHref = escapeHtml(href);
  const content = renderChildren(node.children);
  const target = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : "";

  return `<a href="${safeHref}"${target}>${content}</a>`;
}

function renderUpload(node: LexicalNode): string {
  const value = node.value as
    | {
        url?: string;
        alt?: string;
        width?: number;
        height?: number;
      }
    | undefined;

  if (!value?.url) {
    return "";
  }

  const src = escapeHtml(value.url);
  const alt = escapeHtml(value.alt ?? "");

  return `<img src="${src}" alt="${alt}" loading="lazy" />`;
}

function renderNode(node: LexicalNode): string {
  switch (node.type) {
    case "root":
      return renderChildren(node.children);

    case "text":
      return renderTextNode(node);

    case "paragraph":
      return renderParagraph(node);

    case "heading":
      return renderHeading(node);

    case "quote":
      return renderQuote(node);

    case "list":
      return renderList(node);

    case "listitem":
      return renderListItem(node);

    case "linebreak":
      return "<br />";

    case "link":
    case "autolink":
      return renderLink(node);

    case "upload":
      return renderUpload(node);

    default:
      return renderChildren(node.children);
  }
}

export function richTextToHtml(richText: LexicalRichText | null | undefined): string {
  if (!richText?.root) {
    return "";
  }

  return renderNode(richText.root);
}
