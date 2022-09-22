var _ = require('lodash');


const calculateResilienceLevel = async (data) => {

    // console.log('calculateResilienceLevel data', data)
    if (data._internal) {
        return
    }        


    try {
        await strapi.query('api::analysis.analysis').update({ where: { id: data.id }, data: { _internal: true } })
    }
    catch (e) {
        console.error(e)
        await strapi.query('api::analysis.analysis').update({ where: { id: data.id }, data: { resilienceLevel: 0, _internal: true } })
    }
    
}


module.exports = {
      
    async afterCreate(event) {
        await calculateResilienceLevel(event.result)
    },

    async beforeUpdate(event) {
        
        const id = event?.params?.where?.id

        if (!id) {
            return
        }

        const analysis = await strapi.service('api::analysis.analysis').findOne(id, {
            populate:  ['results', 'results.indicator', 'results.indicator.pattern', 'results.indicator.pattern.principle', 'results.indicator.pattern.principle.domain']
        });

        analysis.results.forEach((r) => {
            if (r.indicator) {
              r.analysisId = analysis.uid;
              // r.templateId = analysis.template?.id;
              // r.templateName = analysis.template?.name;
              // r.questionnaireId = analysis.questionnaire?.id;
              // r.questionnaireName = analysis.questionnaire?.name;
              r.domainId = r.indicator.pattern.principle.domain.id;
              r.domainName = r.indicator.pattern.principle.domain.name;
              r.domainDescription = r.indicator.pattern.principle.domain.description;
              r.principleId = r.indicator.pattern.principle.id;
              r.principleName = r.indicator.pattern.principle.name;
              r.patternId = r.indicator.pattern.id;
              r.patternName = r.indicator.pattern.name;
              // r.pattern = r.indicator.pattern
              r.indicatorId = r.indicator.id;
              r.indicatorName = r.indicator.question;
            //   r.responseValue = r.indicator.indicator_options.find(
            //     (o) => o.value === r.value
            //   ).name;
              r.comments = analysis.comments?.find(
                (c) => c.indicator && c.indicator.id === r.indicator.id
              )?.comment;
              r.resilienceLevel = r.value
            }
            delete r.indicator;
        });


        const summaryByDomain = _(analysis.results)
        .groupBy("domainId")
        .map((domainRows, id) => ({
          domainDescription: id,
          resilienceLevel: _.meanBy(domainRows, "resilienceLevel"),
          principles: _(domainRows)
            .groupBy("principleId")
            .map((principleRows, id) => ({
              principleName: id,
              resilienceLevel: _.meanBy(principleRows, "resilienceLevel"),
              patterns: _(principleRows)
                .groupBy("patternId")
                .map((patternsRows, id) => ({
                  patternName: id,
                  resilienceLevel: _.meanBy(patternsRows, "resilienceLevel"),
                })),
            }))
            .value(),
        }))
        .value();
        const resilienceLevel = _.meanBy(summaryByDomain, "resilienceLevel")        
        event.params.data.resilienceLevel = resilienceLevel
    }    
};