const fs = require("fs");
const { parse } = require("csv-parse");
const axios = require("axios").default;
const csvOptions = {
    delimiter: ',',
    columns: true
};


const levels = {
    'es': ['Resistencia', 'Determinación', 'Orden', 'Progreso', 'Sostenibilidad', 'Restauración', 'Reconciliación', 'Regeneración'],
    'ca': ['Resistència', 'Determinació', 'Ordre', 'Progrés', 'Sostenibilitat', 'Restauració', 'Reconciliació', 'Regeneració'],
}

async function isFirstRun() {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: "type",
      name: "setup",
    });
    const initHasRun = await pluginStore.get({ key: "initHasRun" });
    await pluginStore.set({ key: "initHasRun", value: true });
    return !initHasRun;
  }

async function importData() {

    try {

        const shouldImportSeedData = await isFirstRun();
        if (!shouldImportSeedData) {
            return
        }
/*
        await strapi.db.query('plugin::i18n.locale').deleteMany({ where: { id: { $gt: 1 } } })        
        await strapi.db.query('plugin::i18n.locale').create({ data: { code: 'ca', isDefault: false, name: 'Català (ca)' } })
        await strapi.db.query('plugin::i18n.locale').create({ data: { code: 'es', isDefault: true, name: 'Spanish (es)' } })

        await strapi.db.query('api::template.template').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::domain.domain').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::principle.principle').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::principle-type.principle-type').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::pattern.pattern').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::indicator.indicator').deleteMany({ where: { id: { $gt: 0 } } })
        // await strapi.db.query('api::indicator-option.indicator-option').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::resilience-level.resilience-level').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.query('components.principle-level').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.query('components.indicator-option').deleteMany({ where: { id: { $gt: 0 } } })

        
        const records1 = await readCSV('impsismo.csv');
        const template1 = await createTemplate('IMPSISMO', 'impsismo', 'es')
        const imported1 = await importRecords(template1, records1, 'es')
        console.log('x 0')
        const records2 = await readCSV('larural.csv');
        const template2 = await createTemplate('La Rural Collserola (ORGANITZACIÓ)', 'la-rural-collserola-org', 'ca')
        console.log('x 1')
        const imported2 = await importRecords(template2, records2, 'ca')
        console.log('x 2')
        const template3 = await createTemplate('La Rural Collserola (INDIVIDUAL)', 'la-rural-collserola-ind', 'ca')
        console.log('x 3')

        // const template3 = await createTemplate('La Rural Collserola (INDIVIDUAL)', 'la-rural-collserola-ind', 'ca')

        const template2WithInd = await strapi.query('api::template.template').findOne({
            where: { id: template2.id },
            limit: -1,
            populate: ['indicators', 'indicators.pattern']
        })

        template2WithInd.indicators.forEach(async ind => {
            // console.log('ind', ind.pattern.code)
            if (parseInt(ind.pattern.code) < 16) {
                await strapi.query('api::indicator.indicator').update({ where: { id: ind.id }, data: { templates: [template2.id, template3.id]} })
            }
        })
    */        
        
        return {
            success: true,
            // records
        }
    }
    catch (e) {
        console.error('Error importing file (1)', e)
        return {
            messsage: 'Error importing file',
            success: false,
            e
        }
    }
}




async function createTemplate(templateName, templateSlug, locale) {
    const templateData = { data: { locale: locale, publishedAt: new Date(), name: templateName, slug: templateSlug } }
    const templateEntry = await strapi.query('api::template.template').create(templateData);
    return templateEntry;
}

async function importRecords(templateEntry, records, locale) {

    const imported = []
    let domainName = ''
    let domainId = 0
    let principleName = ''
    let principleId = 0
    let patternName = ''
    let patternId = 0
    let patternOrder = 0

    // const templateData = { data: { locale: locale, publishedAt: new Date(), name: templateName, slug: templateSlug } }
    // const templateEntry = await strapi.query('api::template.template').create(templateData);
    
    // const templateDataLoc = { ...templateData }
    // templateDataLoc.data.locale = locale2
    // templateDataLoc.data.localizations = [{ id: templateEntry.id, locale: locale }]
    // const templateEntryLoc = await strapi.query('api::template.template').create(templateDataLoc);
    // await strapi.query('api::template.template').update({ where: { id: templateEntry.id }, data: { localizations: [{ id: templateEntryLoc.id, locale: locale2 }]} } );

    // const levels = ['Resistencia', 'Determinación', 'Orden', 'Progreso', 'Sostenibilidad', 'Restauración', 'Reconciliación', 'Regeneración']
    for (var i in levels[locale]) {
        await strapi.query('api::resilience-level.resilience-level').create( { data: { locale: locale, publishedAt: new Date(), name: levels[locale][i], value: i + 1, principle: null, code: parseInt(i) + 1 } });
    }
    
    const principleType = await strapi.query('api::principle-type.principle-type').create( { data: { locale: locale, publishedAt: new Date(), name: 'SER', code: '1' } });
    await strapi.query('api::principle-type.principle-type').create( { data: { locale: locale, publishedAt: new Date(), name: 'FUNCIÓN', code: '2' } });
    await strapi.query('api::principle-type.principle-type').create( { data: { locale: locale, publishedAt: new Date(), name: 'VOLUNTAD', code: '3' } });
    
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

async function readCSV(filename) {
    return new Promise(async (resolve, reject) => {
        try {
            const content = await fs.readFileSync(__dirname + '/' + filename);
            parse(content, csvOptions, (err, records) => {
                if (err) {
                    console.error('Error importing file (2)', e)
                    reject(err)
                }
                resolve(records)
            })
        }
        catch (e) {
            console.error('Error importing file (3)', e)
            reject(e);
        }
    });
}



module.exports = async () => {
    try {
      await importData();
    } catch (error) {
      console.log("Could not import seed data");
      console.error(error);
    }
  };