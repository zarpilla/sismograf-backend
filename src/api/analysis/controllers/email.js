const fs = require("fs");
const { cwd } = require("process");

const textValue = (texts, locale, key) => {
  const t = texts.find((t) => t.key === key);
  if (t) {
    return t[`text_${locale}`];
  }
  return key;
};

module.exports = {
  async email(strapi) {
    const analyses = await strapi.service("api::analysis.analysis").find({
      filters: {
        $and: [
          { sentByEmail: false },
          { email: { $not: "" } },
          { email: { $notContains: "empty@email" } },
        ],
      },
      populate: ["template", "questionnaire"],
      // locale: ctx.locale || ctx.query.locale,
    });

    const results = analyses.results;

    if (results.length === 0) {
      return;
    }

    const texts = await strapi.db
      .query("api::text.text")
      .findMany({ limit: 999 });

    const template = fs.readFileSync(
      `${cwd()}/src/api/analysis/controllers/email.html`,
      { encoding: "utf-8" }
    );

    const emailFrom = strapi.config.get(
      "plugins.email.settings.defaultFrom",
      ""
    );

    for (let i = 0; i < results.length; i++) {
      const analysis = results[i];

      let url1 = "sismograf";
      let url2 = "resultats";
      switch (analysis.language) {
        case "es":
          url1 = "sismografo";
          url2 = "resultados";
          break;
        case "en":
          url1 = "seismograph";
          url2 = "results";
          break;
        default:
          break;
      }

      const url = `${process.env.FRONT_URL}/${url1}/${url2}/${analysis.template.slug}/${analysis.questionnaire.slug}/${analysis.uid}`;
      const subject = `${textValue(texts, analysis.language, "el-sismograf")}`;

      const html = template
        .replace(
          /{el-sismograf}/gi,
          textValue(texts, analysis.language, "el-sismograf")
        )
        .replace(
          /{els-vostres-resultats}/gi,
          textValue(texts, analysis.language, "els-vostres-resultats")
        )
        .replace(
          /{veure-els-resultats}/gi,
          textValue(texts, analysis.language, "veure-els-resultats")
        )
        .replace(/{url}/gi, url)
        .replace(/{FRONT_URL}/gi, process.env.FRONT_URL);

      await strapi.plugins["email"].services.email.send({
        to: "jordi@resilience.earth", //analysis.email,
        from: emailFrom,
        subject: subject,
        html: html,
      });

      const analysisToUpdate = { data: { sentByEmail: true } };
      await strapi.entityService.update(
        "api::analysis.analysis",
        analysis.id,
        analysisToUpdate
      );

      // console.log("analysis sent");
    }
  },
};
