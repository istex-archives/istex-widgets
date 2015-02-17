/**
 * list of URL to harvest
 * in order to build a fake API
 */

var urls = [];
urls.push({
  filename: 'document_q_eq_star.json',

  protocol: 'https',
  hostname: 'api.istex.fr',
  pathname: '/document/',
  query: { 'q': '*' }
});
urls.push({
  filename: 'document_q_eq_star_and_output_eq_star.json',

  protocol: 'https',
  hostname: 'api.istex.fr',
  pathname: '/document/',
  query: { 'q': '*', 'output': '*' }
});

module.exports = urls;