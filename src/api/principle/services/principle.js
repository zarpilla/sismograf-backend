'use strict';

/**
 * principle service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::principle.principle');
