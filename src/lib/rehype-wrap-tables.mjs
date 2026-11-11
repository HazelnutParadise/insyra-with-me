// Wrap each <table> in <div class="table-scroll"> so wide tables
// scroll horizontally without blowing out the page width.
export default function rehypeWrapTables() {
  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.map((c) => {
      if (c.type === 'element' && c.tagName === 'table') {
        return {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-scroll'] },
          children: [c],
        };
      }
      walk(c);
      return c;
    });
  };
  return (tree) => walk(tree);
}
