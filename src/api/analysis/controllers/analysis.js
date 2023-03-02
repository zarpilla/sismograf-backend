"use strict";

/**
 *  analysis controller
 */
var _ = require("lodash");

const { createCoreController } = require("@strapi/strapi").factories;

const { getWheelImage, getWheelImageWithDescription } = require("./wheel");

const transformAnalysisResults = async (analyses) => {
  analyses.forEach((analysis) => {
    if (analysis.results) {
      analysis.results.forEach((r) => {
        if (r.indicator) {
          r.analysisId = analysis.uid;
          r.templateId = analysis.template?.id;
          r.templateName = analysis.template?.name;
          r.questionnaireId = analysis.questionnaire?.id;
          r.questionnaireName = analysis.questionnaire?.name;
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
          r.responseValue = r.indicator.indicator_options.find(
            (o) => o.value === r.value
          ).name;
          r.comments = analysis.comments?.find(
            (c) => c.indicator && c.indicator.id === r.indicator.id
          )?.comment;
          r.resilienceLevel = r.value
        }
        delete r.indicator;
      });
      const domains = [];

      const patterns = [];

      analysis.results.forEach((r) => {
        if (!domains.find((d) => d.id === r.domainId)) {
          domains.push({ id: r.domainId, name: r.domainName, principles: [] });
        }
        const domain = domains.find((d) => d.id === r.domainId);
        if (!domain.principles.find((p) => p.id === r.principleId)) {
          domain.principles.push({
            id: r.principleId,
            name: r.principleName,
            patterns: [],
          });
        }
        const principle = domain.principles.find((p) => p.id === r.principleId);
        if (!principle.patterns.find((p) => p.id === r.patternId)) {
          principle.patterns.push({
            id: r.patternId,
            name: r.patternName,
            indicators: [],
          });
        }
        const pattern = principle.patterns.find((i) => i.id === r.patternId);
        if (!pattern.indicators.find((p) => p.id === r.indicatorId)) {
          pattern.indicators.push({
            id: r.indicatorId,
            name: r.indicatorName,
            responseValue: r.responseValue,
            resilienceLevel: r.resilienceLevel,
          });
        }
        pattern.resilienceLevel = _.meanBy(pattern.indicators, (p) => p.resilienceLevel);
        principle.resilienceLevel = _.meanBy(principle.patterns, (p) => p.resilienceLevel);
        domain.resilienceLevel = _.meanBy(domain.principles, (p) => p.resilienceLevel);

        patterns.push(pattern);
      });
      analysis.domainResults = domains;

      analysis.patternResults = patterns.map(({ indicators, ...item }) => {
        return { ...item };
      });
    }
  });

  return analyses;
};

const calculateAnalysisGroups = (analyses) => {
    return _.meanBy(analyses, (p) => p.resilienceLevel);
}

const populate = [
  "template",
  "questionnaire",
  "questionnaire.organization",
  "results",
  "comments",
  "labels",
  "comments.indicator",
  "results.indicator",
  "results.indicator.indicator_options",
  "results.indicator.pattern",
  "results.indicator.pattern.principle",
  "results.indicator.pattern.localizations",
  "results.indicator.pattern.principle.domain",
];

module.exports = createCoreController(
  "api::analysis.analysis",
  ({ strapi }) => ({
    // /api/analyses/12?populate=template&populate=questionnaire&populate=results&populate=results.indicator&populate=results.indicator.indicator_options&populate=results.indicator.pattern&populate=results.indicator.pattern.principle&populate=results.indicator.pattern.localizations&populate=results.indicator.pattern.principle.domain
    // /api/analyses/results/12
    async findOneWithResults(ctx) {
      const { id } = ctx.params;
      const { query } = ctx;

      const analysis = await strapi
        .service("api::analysis.analysis")
        .findOne(id, {
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

      const analysisWithResults = await transformAnalysisResults([analysis]);

      const sanitizedEntity = await this.sanitizeOutput(
        analysisWithResults,
        ctx
      );
      return sanitizedEntity;
      // return this.transformResponse(sanitizedEntity);
    },

    // /api/analyses/compare/questionnaire/id/?g1=2&g2=18
    async findWithResults(ctx) {
      const { group1, group2 } = ctx.params;
      const identifier1 = ctx.query.g1;
      const identifier2 = ctx.query.g2;
      let g1 = [], g2 = [];

      if (group1 === "id") {
        const analysis = await strapi.service("api::analysis.analysis").find({
          filters: {
            id: {
              $eq: identifier1,
            },
          },
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

        g1 = analysis.results;
      }
      if (group2 === "id") {
        const analysis = await strapi.service("api::analysis.analysis").find({
          filters: {
            id: {
              $eq: identifier2,
            },
          },
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

        g2 = analysis.results;
      }

      if (group1 === "user") {
        if ((ctx.state && ctx.state.auth && ctx.state.auth.strategy && ctx.state.auth.strategy.name === 'users-permissions' && ctx.state.auth.credentials && ctx.state.auth.credentials.id === parseInt(identifier1)) || (
          ctx.state && ctx.state.auth && ctx.state.auth.strategy && ctx.state.auth.strategy.name === 'api-token'
        )) {
          const analysis = await strapi.service("api::analysis.analysis").find({
            filters: {
              questionnaire: {
                users: {
                  id: identifier1
                },
              },
            },
            populate: populate,
            locale: ctx.locale || ctx.query.locale,
          });
  
          g1 = analysis.results;
        }        
      }

      if (group2 === "user") {
        if ((ctx.state && ctx.state.auth && ctx.state.auth.strategy && ctx.state.auth.strategy.name === 'users-permissions' && ctx.state.auth.credentials && ctx.state.auth.credentials.id === parseInt(identifier2)) || (
          ctx.state && ctx.state.auth && ctx.state.auth.strategy && ctx.state.auth.strategy.name === 'api-token'

        )) {
          const analysis = await strapi.service("api::analysis.analysis").find({
            filters: {
              questionnaire: {
                users: {
                  id: identifier2
                },
              },
            },
            populate: populate,
            locale: ctx.locale || ctx.query.locale,
          });
  
          g2 = analysis.results;
        }        
      }

      if (group1 === "label") {
          const analysis = await strapi.service("api::analysis.analysis").find({
            filters: {
              labels: {
                id: identifier1
              },
            },
            populate: populate,
            locale: ctx.locale || ctx.query.locale,
          });
  
          g1 = analysis.results;
      }

      if (group2 === "label") {
        const analysis = await strapi.service("api::analysis.analysis").find({
          filters: {
            labels: {
              id: identifier2
            },
          },
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

        g2 = analysis.results;
      }

      if (group1 === "ruid") {
        const analysis = await strapi.service("api::analysis.analysis").find({
          filters: {
            uid: {
              $eq: identifier1,
            },
          },
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

        g1 = analysis.results;
      }
      if (group2 === "ruid") {
        const analysis = await strapi.service("api::analysis.analysis").find({
          filters: {
            uid: {
              $eq: identifier2,
            },
          },
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

        g2 = analysis.results;
      }

      if (group1 === "questionnaire") {
        const analysis = await strapi.service("api::analysis.analysis").find({
          filters: {
            questionnaire: {
              id: identifier1,
            },
          },
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

        g1 = analysis.results;
      }
      if (group2 === "questionnaire") {
        const analysis = await strapi.service("api::analysis.analysis").find({
          filters: {
            questionnaire: {
              id: identifier2,
            },
          },
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

        g2 = analysis.results;
      }

      if (group1 === "template") {
        const analysis = await strapi.service("api::analysis.analysis").find({
          filters: {
            template: {
              id: identifier1,
            },
          },
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

        g1 = analysis.results;
      }

      if (group2 === "template") {
        const analysis = await strapi.service("api::analysis.analysis").find({
          filters: {
            template: {
              id: identifier2,
            },
          },
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

        g2 = analysis.results;
      }

      if (group1 === "organization") {
        const analysis = await strapi.service("api::analysis.analysis").find({
          filters: {
            questionnaire: {
              organization: {
                id: identifier1
              },
            },
          },
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

        g1 = analysis.results;
      }

      if (group2 === "organization") {
        const analysis = await strapi.service("api::analysis.analysis").find({
          filters: {
            questionnaire: {
              organization: {
                id: identifier2
              },
            },
          },
          populate: populate,
          locale: ctx.locale || ctx.query.locale,
        });

        g2 = analysis.results;
      }

      const analysisWithResults1 = await transformAnalysisResults(g1);
      const analysisWithResults2 = await transformAnalysisResults(g2);
      
      const analysesLevels1 = await calculateAnalysisGroups(g1);
      const analysesLevels2 = await calculateAnalysisGroups(g2);
      
      const sanitizedEntity = await this.sanitizeOutput(
        {
          g1: { analyses: analysisWithResults1, resilienceLevel: analysesLevels1 },
          g2: { analyses: analysisWithResults2, resilienceLevel: analysesLevels2 },
        },
        ctx
      );

      return await this.sanitizeOutput(sanitizedEntity, ctx);
    }
    ,
    // /api/analyses/compare/questionnaire/id/?g1=2&g2=18
    async getWheel(ctx) {

      ctx.params.g2 = 'none'
      const data = await this.findWithResults(ctx)
      ctx.type = "image/svg+xml"
      if (ctx.query.description) {
        const texts = await strapi.db.query("api::text.text").findMany({ limit: 999 })
        return await getWheelImageWithDescription(data, ctx, texts)
      }
      return await getWheelImage(data, ctx)      
    },
  })  
  
);
