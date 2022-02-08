'use strict';

/**
 * resilience-level router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::resilience-level.resilience-level');
