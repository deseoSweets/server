'use strict';

/**
 * tort service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::tort.tort');
