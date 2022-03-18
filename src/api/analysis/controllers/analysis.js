'use strict';

/**
 *  analysis controller
 */
var _ = require('lodash');


 const { createCoreController } = require('@strapi/strapi').factories;
 
 module.exports = createCoreController('api::analysis.analysis', ({ strapi }) =>  ({
     async findOneWithResults(ctx) {
         const { id } = ctx.params;
         const { query } = ctx;
 
         const analysis = await strapi.service('api::analysis.analysis').findOne(id, {
             populate:  ['template', 'results', 'results.indicator', 'results.indicator.indicator_options', 'results.indicator.pattern', 'results.indicator.pattern.principle', 'results.indicator.pattern.principle.domain'],
             locale: ctx.locale
         });

         
         analysis.results.forEach(r => {
             r.domainId = r.indicator.pattern.principle.domain.id
             r.domainName = r.indicator.pattern.principle.domain.name
             r.principleId = r.indicator.pattern.principle.id
             r.principleName = r.indicator.pattern.principle.name
             r.patternId = r.indicator.pattern.id
             r.patternName = r.indicator.pattern.name
             r.indicatorId = r.indicator.id
             r.indicatorName = r.indicator.question
             r.responseValue = r.indicator.indicator_options.find(o => o.value === r.value).name
            delete r.indicator
         });
         const domains = []
        //  for (var i = 0; i < analysis.results.length; i ++) {
        //      const r = analysis.results[i]
         // }
        analysis.results.forEach(r => {
            
            if (!domains.find(d => d.id === r.domainId)) {
                domains.push({ id: r.domainId, name: r.domainName, principles: []})
            }
            const domain = domains.find(d => d.id === r.domainId)
            if (!domain.principles.find(p => p.id === r.principleId)) {
                domain.principles.push({ id: r.principleId, name: r.principleName, patterns: []})
            }
            const principle = domain.principles.find(p => p.id === r.principleId)
            if (!principle.patterns.find(p => p.id === r.patternId)) {
                principle.patterns.push({ id: r.patternId, name: r.patternName, indicators: []})
            }
            const pattern = principle.patterns.find(i => i.id === r.patternId)
            if (!pattern.indicators.find(p => p.id === r.indicatorId)) {
                pattern.indicators.push({ id: r.indicatorId, name: r.indicatorName, responseValue: r.responseValue, value: r.value })
            }
            pattern.value = _.meanBy(pattern.indicators,(p) => p.value);
            principle.value = _.meanBy(principle.patterns,(p) => p.value);
            domain.value = _.meanBy(domain.principles,(p) => p.value);
         })
         analysis.domainResults = domains
 
         // if (!template) {
         //     return this.transformResponse({});
         // }
 
         // const domains = await strapi.service('api::domain.domain').find({            
         //     populate:  ['principles', 'principles.patterns', 'principles.principle_levels'],
         //     locale: template.locale
         // });
 
         // const levels = await strapi.service('api::resilience-level.resilience-level').find({            
         //     populate:  ['*'],
         //     locale: template.locale
         // });
         
         // domains.results.forEach(d => {
         //     let principlesToRemove = []
         //     d.principles.forEach(pr => {
         //         // let patternHasIndicators = false
         //         let patternsToRemove = []
         //         pr.patterns.forEach(p => {
         //             const indicators = template.indicators.filter(i => i.pattern && i.pattern.id === p.id)
         //             p.indicators = indicators
         //             p.indicators.forEach(i => { 
         //                 delete i.pattern
         //                 i.indicator_options = shuffle(i.indicator_options)
         //             })
         //             if (p.indicators.length === 0) {
         //                 p.remove = true
         //             }
         //         })
         //         pr.patterns = pr.patterns.filter(p => p.remove !== true)
         //         if (pr.patterns.length === 0) {
         //             pr.remove = true
         //         }
         //     })
         //     d.principles = d.principles.filter(pr => pr.remove !== true)
         //     if (d.principles.length === 0) {
         //         d.remove = true
         //     }
         // })
         // domains.results = domains.results.filter(d => d.remove !== true)
 
         // template.domains = domains.results
         // template.levels = levels.results
         // delete template.indicators
 
         const sanitizedEntity = await this.sanitizeOutput(analysis, ctx);
         return sanitizedEntity;
         // return this.transformResponse(sanitizedEntity);
         
       },
 
       async findWithResults(ctx) {
         // const { id } = ctx.params;
         // const { query } = ctx;
         // const template = await strapi.db.query('api::template.template').findMany({
         //     populate:  ['users'],
         //     locale: ctx.locale
         // });
         // let filteredTemplates = template.filter(t => t.users && t.users.filter(u => u.id.toString() === id.toString()).length > 0)
         // filteredTemplates = filteredTemplates.map(({users, ...keepAttrs}) => keepAttrs)
         // const sanitizedEntity = await this.sanitizeOutput(filteredTemplates, ctx);
         // return this.transformResponse(sanitizedEntity);
         return this.transformResponse([{ id: 3 }]);
     }
 
 }));
 
 