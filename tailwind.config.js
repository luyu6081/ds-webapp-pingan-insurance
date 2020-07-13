const {set} = require('lodash')

const baseConfig = require('@ej/ui/tailwind.config')

set(baseConfig, 'theme.extend.width.page', '1100px')

module.exports = baseConfig
