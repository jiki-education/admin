// `marked` ships as ESM-only, which Jest can't parse. The local markdown
// preview it powers isn't asserted in any test (mailshots uses a server-rendered
// preview), so a passthrough stub is sufficient.
function parse(markdown) {
  return markdown;
}

module.exports = {
  marked: { parse },
  parse
};
