const fs = require("fs");
const { parse } = require("csv-parse");

const csvOptions = {
    delimiter: ",",
    columns: true,
};

const readCSV = async (filename, csvOptions) => {
    return new Promise(async (resolve, reject) => {
        try {
            const rootDir = process.cwd();
            const content = await fs.readFileSync(rootDir + "/public" + filename);
            parse(content, csvOptions, (err, records) => {
                if (err) {
                    console.error("Error importing file (2)", err);
                    reject(err);
                }
                resolve(records);
            });
        } catch (e) {
            console.error("Error importing file (3)", e);
            reject(e);
        }
    });
};




const levels = {
    'es': ['Resistencia', 'Determinación', 'Orden', 'Progreso', 'Sostenibilidad', 'Restauración', 'Reconciliación', 'Regeneración'],
    'ca': ['Resistència', 'Determinació', 'Ordre', 'Progrés', 'Sostenibilitat', 'Restauració', 'Reconciliació', 'Regeneració'],
    'en': ['Resistence', 'Determination', 'Order', 'Progress', 'Sustainability', 'Restoration', 'Reconcilliaton', 'Regeneration'],
}

const principleTypes = {
    'es': ['SER', 'FUNCIÓN', 'VOLUNTAD'],
    'ca': ['SER', 'FUNCIÓ', 'VOLUNTAT'],
    'en': ['BEING', 'FUNCTION', 'WILL'],
}

const createTemplate = async (templateName, templateSlug, locale) => {
    const templateData = { data: { locale: locale, publishedAt: new Date(), name: templateName, slug: templateSlug } }
    const templateEntry = await strapi.query('api::template.template').create(templateData);
    return templateEntry;
}

const importRecords = async (templateEntry, records, locale) => {

    const imported = []
    let domainName = ''
    let domainId = 0
    let principleName = ''
    let principleId = 0
    let patternName = ''
    let patternId = 0
    let patternOrder = 0

    for (var i in levels[locale]) {
        await strapi.query('api::resilience-level.resilience-level').create({ data: { locale: locale, publishedAt: new Date(), name: levels[locale][i], value: i + 1, principle: null, code: parseInt(i) + 1 } });
    }

    const principleType = await strapi.query('api::principle-type.principle-type').create({ data: { locale: locale, publishedAt: new Date(), name: principleTypes[locale][0], code: '1' } });
    await strapi.query('api::principle-type.principle-type').create({ data: { locale: locale, publishedAt: new Date(), name: principleTypes[locale][1], code: '2' } });
    await strapi.query('api::principle-type.principle-type').create({ data: { locale: locale, publishedAt: new Date(), name: principleTypes[locale][2], code: '3' } });

    for (var i = 0; i < records.length; i++) {

        const record = records[i]
        if (record.domain !== domainName && record.domain !== '') {
            const domainData = { data: { locale: locale, publishedAt: new Date(), name: record.domain, code: record.domain_code, description: record.domain_desc } }
            const domainEntry = await strapi.query('api::domain.domain').create(domainData);
            domainId = domainEntry.id
            domainName = record.domain
        }

        if (record.principle !== principleName && record.principle !== '') {
            const resilience_levels = []
            let level = await strapi.query('components.principle-level').create({ data: { name: record.r1, value: 1 } })
            resilience_levels.push(level.id)
            level = await strapi.query('components.principle-level').create({ data: { name: record.r2, value: 2 } })
            resilience_levels.push(level.id)
            level = await strapi.query('components.principle-level').create({ data: { name: record.r3, value: 3 } })
            resilience_levels.push(level.id)
            level = await strapi.query('components.principle-level').create({ data: { name: record.r4, value: 4 } })
            resilience_levels.push(level.id)
            level = await strapi.query('components.principle-level').create({ data: { name: record.r5, value: 5 } })
            resilience_levels.push(level.id)
            level = await strapi.query('components.principle-level').create({ data: { name: record.r6, value: 6 } })
            resilience_levels.push(level.id)
            level = await strapi.query('components.principle-level').create({ data: { name: record.r7, value: 7 } })
            resilience_levels.push(level.id)
            level = await strapi.query('components.principle-level').create({ data: { name: record.r8, value: 8 } })
            resilience_levels.push(level.id)
            const principleData = { data: { locale: locale, publishedAt: new Date(), name: record.principle, code: record.principle_code, description: record.principle_desc, principle_levels: resilience_levels, domain: domainId, principle_type: principleType.id + parseInt(record.principle_type) - 1 } }
            const principleEntry = await strapi.query('api::principle.principle').create(principleData);
            principleId = principleEntry.id
            principleName = record.principle

        }
        if (record.pattern !== patternName && record.pattern !== '') {
            patternOrder == 1
            const patternData = { data: { locale: locale, publishedAt: new Date(), name: record.pattern, code: record.pattern_code, order: patternOrder, principle: principleId } }
            const patternEntry = await strapi.query('api::pattern.pattern').create(patternData);
            patternOrder++
            patternId = patternEntry.id
            patternName = record.pattern
        }

        if (record.indicator) {
            const options = []
            let option = await strapi.query('components.indicator-option').create({ data: { name: record.o1, value: 1 } })
            options.push(option.id)
            option = await strapi.query('components.indicator-option').create({ data: { name: record.o2, value: 2 } })
            options.push(option.id)
            option = await strapi.query('components.indicator-option').create({ data: { name: record.o3, value: 3 } })
            options.push(option.id)
            option = await strapi.query('components.indicator-option').create({ data: { name: record.o4, value: 4 } })
            options.push(option.id)
            option = await strapi.query('components.indicator-option').create({ data: { name: record.o5, value: 5 } })
            options.push(option.id)
            option = await strapi.query('components.indicator-option').create({ data: { name: record.o6, value: 6 } })
            options.push(option.id)
            option = await strapi.query('components.indicator-option').create({ data: { name: record.o7, value: 7 } })
            options.push(option.id)
            option = await strapi.query('components.indicator-option').create({ data: { name: record.o8, value: 8 } })
            options.push(option.id)

            // console.log('options', options)

            const indicatorData = { data: { locale: locale, publishedAt: new Date(), question: record.indicator, pattern: patternId, templates: [templateEntry.id], max: record.max, indicator_options: options } }
            const indicatorEntry = await strapi.query('api::indicator.indicator').create(indicatorData);
        }
    }

    return imported
}



const tryToImport = async (event) => {
    const { result, params } = event;

    const importId = result.id;

    const importInfo = await strapi.db.query("api::import.import").findOne({
        where: {
            id: importId,
        }
    });

    console.log('importInfo', result)

    if (!result.template || !result.lang || !result.file) {
        return;
    }

    if (params.data._internal) {
        return;
    }

    if (result.status === "Imported") {
        return;
    }

    try {
        console.log('records 0')
        const records = await readCSV(result.file.url, csvOptions);
        console.log('records 1', records)
        const template = await createTemplate(result.template, result.template, result.lang)
        console.log('template 1', template)
        const imported = await importRecords(template, records, result.lang)
        console.log('imported 1', imported)

        await strapi.query("api::import.import").update({
            where: { id: id },
            data: { status: "Imported", _internal: true },
        });
    }
    catch {

    }

}

module.exports = {
    beforeCreate(event) {
        event.params.data.status = "initial";
    },

    async afterCreate(event) {
        await tryToImport(event);
    },

    async afterUpdate(event) {
        await tryToImport(event);
    },
}