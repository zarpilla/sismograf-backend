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
            populate:  ['indicators', 'indicators.pattern', 'indicators.indicator_options', 'labels', 'labels.label_category', 'label_categories'],
            locale: ctx.locale
        });

        if (!template) {
            return this.transformResponse({});
        }

        const domains = await strapi.service('api::domain.domain').find({            
            populate:  ['principles', 'principles.patterns', 'principles.principle_levels'],
            locale: template.locale
        });

        const levels = await strapi.service('api::resilience-level.resilience-level').find({            
            populate:  ['*'],
            locale: template.locale
        });
        
        domains.results.forEach(d => {
            let principlesToRemove = []
            d.principles.forEach(pr => {
                // let patternHasIndicators = false
                let patternsToRemove = []
                pr.patterns.forEach(p => {
                    const indicators = template.indicators.filter(i => i.pattern && i.pattern.id === p.id)
                    p.indicators = indicators
                    p.indicators.forEach(i => { 
                        delete i.pattern
                        i.indicator_options = shuffle(i.indicator_options)
                    })
                    if (p.indicators.length === 0) {
                        p.remove = true
                    }
                })
                pr.patterns = pr.patterns.filter(p => p.remove !== true)
                if (pr.patterns.length === 0) {
                    pr.remove = true
                }
            })
            d.principles = d.principles.filter(pr => pr.remove !== true)
            if (d.principles.length === 0) {
                d.remove = true
            }
        })
        domains.results = domains.results.filter(d => d.remove !== true)

        template.domains = domains.results
        template.levels = levels.results
        delete template.indicators

        const sanitizedEntity = await this.sanitizeOutput(template, ctx);

        return this.transformResponse(sanitizedEntity);
        
      },
}));

