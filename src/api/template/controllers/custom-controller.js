'use strict';

/**
 *  template controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::template.template', ({ strapi }) =>  ({
    async findOneWithIndicators(ctx) {
        const { id } = ctx.params;
        const { query } = ctx;

        const entity = await strapi.service('api::template.template').findOne(id, query);
        const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

        return this.transformResponse(sanitizedEntity);
        
      },
}));

