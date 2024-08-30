const path = require('node:path');
const { getPackagesSync } = require('@lerna/project');

module.exports = {
  name: 'Comunica Reasoning',
  out: 'documentation',
  theme: 'default',
  'external-modulemap': '.*packages/([^/]+)/.*',
  entryPoints: getPackagesSync(__dirname).map(
    pkg => path.relative(__dirname, pkg.location),
  ),
  excludeExternals: false,
  disableOutputCheck: true,
};
