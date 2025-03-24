'use strict';

/**
 * catalog service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::catalog.catalog');
