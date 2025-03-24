'use strict';

/**
 * catalog router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::catalog.catalog');
