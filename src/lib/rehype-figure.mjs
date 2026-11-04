// Turns a paragraph that holds only an image with a title (![alt](src "Caption")) into <figure><img><figcaption>.
export default function rehypeFigure() {
  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.map((c) => {
      if (c.type === 'element' && c.tagName === 'p') {
        const kids = c.children.filter((k) => !(k.type === 'text' && !k.value.trim()));
        const img = kids[0];
        if (kids.length === 1 && img.type === 'element' && img.tagName === 'img' && img.properties?.title) {
          const caption = String(img.properties.title); delete img.properties.title;
          return { type: 'element', tagName: 'figure', properties: {}, children: [img,
            { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: caption }] }] };
        }
      }
      walk(c); return c;
    });
  };
  return (tree) => walk(tree);
}
