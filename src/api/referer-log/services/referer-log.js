'use strict';

/**
 * referer-log service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::referer-log.referer-log');
