'use strict';

/**
 *  template controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const shuffle = (array) => {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

module.exports = createCoreController('api::template.template', ({ strapi }) =>  ({
    async findOneWithIndicators(ctx) {
        const { id } = ctx.params;
        const { query } = ctx;

        const template = await strapi.service('api::template.template').findOne(id, {
            populate:  ['indicators', 'indicators.pattern', 'indicators.indicator_options', 'labels']
        });

        if (!template) {
            return this.transformResponse({});
        }

        const domains = await strapi.service('api::domain.domain').find({            
            populate:  ['principles', 'principles.patterns', 'principles.principle_levels']
        });
        
        domains.results.forEach(d => {
            d.principles.forEach(pr => {
                pr.patterns.forEach(p => {
                    const indicators = template.indicators.filter(i => i.pattern && i.pattern.id === p.id)
                    p.indicators = indicators
                    p.indicators.forEach(i => { 
                        delete i.pattern
                        i.indicator_options = shuffle(i.indicator_options)
                    })
                })
            })
        })

        template.domains = domains.results
        delete template.indicators

        const sanitizedEntity = await this.sanitizeOutput(template, ctx);

        return this.transformResponse(sanitizedEntity);
        
      },
}));

