'use strict';

/**
 * text service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::text.text');
