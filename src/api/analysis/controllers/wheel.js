var _ = require("lodash");
const D3Node = require("d3-node");
const d3 = require("d3");
const { font } = require("./wheel-font");

const toPct = (value) => {
  return parseInt((value * 14.29 - 14.29).toFixed(0));
};

module.exports = {
  async getWheelImage(data, ctx) {
    const pivotData = [];

    const analysis = [];
    data.g1.analyses.forEach((a) => {
      analysis.push(a);
      a.results = a.results.map(
        ({
          id,
          value,
          // domainId,
          templateId,
          questionnaireId,
          principleId,
          patternId,
          indicatorId,
          ...item
        }) => item
      );
      a.results.forEach((r) => {
        r.locale = ctx.locale;
        pivotData.push(r);
      });
    });

    const summaryByDomain = _(pivotData)
      .groupBy("domainDescription")
      .map((domainRows, id) => ({
        domainDescription: id,
        domainName: domainRows[0].domainName,
        domainNameCode: domainRows[0],
        resilienceLevel: _.meanBy(domainRows, "resilienceLevel"),
        principles: _(domainRows)
          .groupBy("principleName")
          .map((principleRows, id) => ({
            principleName: id,
            resilienceLevel: _.meanBy(principleRows, "resilienceLevel"),
            patterns: _(principleRows)
              .groupBy("patternName")
              .map((patternsRows, id) => ({
                patternName: id,
                resilienceLevel: _.meanBy(patternsRows, "resilienceLevel"),
              })),
          }))
          .value(),
      }))
      .value();

    const chartSummary = {
      resilienceLevel: _.meanBy(summaryByDomain, "resilienceLevel"),
      domains: summaryByDomain,
    };

    const domainsData = () => {
      const domains = chartSummary.domains.map((d, i) => {
        return {
          i,
          name: `${d.domainName}`,
          // zname: `0${i + 1} ${d.domainName}`,
          value: toPct(d.resilienceLevel),
          hidden: false,
        };
      });
      for (let i = domains.length; i < 4; i++) {
        domains.push({ name: `d${i}`, value: null, hidden: true });
      }
      return domains;
    };
    const quartersData = () => {
      const quarters = [];
      chartSummary.domains.forEach((d, i) => {
        quarters.push({ name: `q${i}v`, value: toPct(d.resilienceLevel) });
        quarters.push({ name: `q${i}`, value: toPct(d.resilienceLevel) });
      });
      for (let i = quarters.length / 2; i < 4; i++) {
        quarters.push({ name: `q${i}v`, value: null, hidden: true });
        quarters.push({ name: `q${i}`, value: null, hidden: true });
      }
      return quarters;
    };
    const domainsValuesData = () => {
      const domainsValues = [];
      chartSummary.domains.forEach((d, i) => {
        domainsValues.push({
          name: `q${i}v`,
          value: toPct(d.resilienceLevel),
        });
        domainsValues.push({
          name: `q${i}`,
          value: 100 - toPct(d.resilienceLevel),
        });
      });
      for (let i = domainsValues.length / 2; i < 4; i++) {
        domainsValues.push({ name: `q${i}v`, value: null, hidden: true });
        domainsValues.push({ name: `q${i}`, value: null, hidden: true });
      }
      return domainsValues;
    };
    const principlesValuesData = () => {
      const principles = [];
      let c = 0;
      chartSummary.domains.forEach((d, i) => {
        d.principles.forEach((p, j) => {
          principles.push({
            label: `p${3 * i + j}v`,
            description: `${j + 1}. ${p.principleName}`,
            value: toPct(p.resilienceLevel),
          });
          principles.push({
            label: `p${3 * i + j}`,
            value: 100 - toPct(p.resilienceLevel),
          });
          c++;
        });
      });
      for (let i = principles.length / 2; i < 12; i++) {
        principles.push({
          label: `p${i}v`,
          description: "",
          value: null,
          hidden: true,
        });
        principles.push({ label: `p${i}`, value: null, hidden: true });
      }
      return principles;
    };
    // levelsDisplay() {
    //   return _.reverse(
    //     _.uniqWith(
    //       this.levels.map((l) => {
    //         return { name: l.attributes.name, code: l.attributes.code };
    //       }),
    //       _.isEqual
    //     )
    //   );
    // },

    const colors = [
      "#A71F1F",
      "#CE542E",
      "#DA8344",
      "#E1BB59",
      "#5F925F",
      "#76B3A8",
      "#508DA8",
      "#3B4174",
      "#3B4174",
    ];
    const colors01 = [
      "rgba(167, 31, 31, 1)",
      "rgba(206, 84, 46, 1)",
      "rgba(218, 131, 68, 1)",
      "rgba(225, 187, 89, 1)",
      "rgba(95, 146, 95, 1)",
      "rgba(118, 179, 168, 1)",
      "rgba(80, 141, 168, 1)",
      "rgba(59, 65, 116, 1)",
      "rgba(59, 65, 116, 1)",
    ];
    const colors06 = [
      "rgba(167, 31, 31, 0.6)",
      "rgba(206, 84, 46, 0.6)",
      "rgba(218, 131, 68, 0.6)",
      "rgba(225, 187, 89, 0.6)",
      "rgba(95, 146, 95, 0.6)",
      "rgba(118, 179, 168, 0.6)",
      "rgba(80, 141, 168, 0.6)",
      "rgba(59, 65, 116, 0.6)",
      "rgba(59, 65, 116, 0.6)",
    ];
    const colors03 = [
      "rgba(167, 31, 31, 0.3)",
      "rgba(206, 84, 46, 0.3)",
      "rgba(218, 131, 68, 0.3)",
      "rgba(225, 187, 89, 0.3)",
      "rgba(95, 146, 95, 0.3)",
      "rgba(118, 179, 168, 0.3)",
      "rgba(80, 141, 168, 0.3)",
      "rgba(59, 65, 116, 0.3)",
      "rgba(59, 65, 116, 0.3)",
    ];

    const globalLevel = () => {
      return toPct(chartSummary.resilienceLevel);
    };

    const bgrColor = (value) => {
      if (value == null || value == undefined) return colors06[3];
      const idx = parseInt(value / 12.5);
      return colors06[idx];
    };

    const barColor = (value) => {
      if (value == null) return colors06[3];
      const idx = parseInt(value / 12.5);
      return colors06[idx];
    };

    const dgrColor = (value) => {
      if (value == null) return colors01[3];
      const idx = parseInt(value / 12.5);
      return colors01[idx];
    };

    const alertColor = (value) => {
      if (value == null) return "transparent";
      if (value < 38) {
        const idx = parseInt(value / 12.5);
        return colors[idx];
      }
      return "transparent";
    };

    const dragon =
      "M0.091993 41.0106C0.00532414 40.391 0.470638 39.8246 1.12488 39.7447C7.19169 39.0093 9.25682 33.3115 9.7452 31.5826C10.1242 30.243 10.705 28.9559 11.4984 27.7036C11.204 27.516 10.8232 27.3406 10.4474 27.3352C10.0989 27.3312 9.7661 27.4841 9.42977 27.803C9.04189 28.1707 8.83907 28.5556 8.60464 29.0021C8.14751 29.8699 7.57849 30.9512 5.66539 31.5563C5.04025 31.7544 4.36499 31.4341 4.15549 30.8408C3.94734 30.2484 4.28514 29.6072 4.91029 29.4093C5.88425 29.1015 6.07993 28.7307 6.46893 27.9909C6.74102 27.4737 7.07988 26.8305 7.74196 26.2028C8.54258 25.4438 9.49802 25.0538 10.5051 25.073C11.4638 25.0922 12.2829 25.4721 12.8572 25.8425C13.4276 25.1539 14.067 24.4736 14.7785 23.7991L19.2792 19.5322C19.4067 19.4113 19.5445 19.2881 19.6884 19.1651C17.8807 16.589 16.9785 12.4292 18.0367 8.95732C16.6213 8.98763 14.4563 9.20954 12.7659 10.1582C12.199 10.4761 11.4659 10.301 11.131 9.76116C10.7953 9.22303 10.9825 8.52865 11.5497 8.21115C13.4486 7.14537 15.6999 6.80286 17.3846 6.71528C15.5261 4.95811 12.9137 4.44828 9.98545 3.87577C8.99303 3.68214 7.98461 3.48515 6.98719 3.23056C7.92987 5.20152 8.72979 7.88206 7.65212 10.0959C9.27678 11.7048 10.7821 14.051 9.63132 17.4329C10.6379 17.6131 11.9856 17.9656 13.3641 18.658C13.9449 18.9523 14.1697 19.6352 13.8607 20.1871C13.5524 20.7398 12.8295 20.9502 12.2478 20.6579C10.038 19.5483 7.93846 19.5093 7.91718 19.5089C7.50728 19.5039 7.12864 19.3002 6.91448 18.9668C6.70065 18.6351 6.68254 18.2219 6.86511 17.874C8.2689 15.1982 7.83871 13.2976 5.34275 11.1189C4.89378 10.7276 4.82949 10.0784 5.19321 9.61361C6.90562 7.42135 4.47962 3.22279 3.40051 1.78959C3.08225 1.36832 3.10782 0.794147 3.46161 0.399489C3.81609 0.00415024 4.4071 -0.112704 4.89768 0.11628C6.57744 0.900234 8.46707 1.26931 10.4676 1.66026C14.4042 2.42973 18.4755 3.22346 20.8073 7.34556C20.992 7.67152 20.997 8.06148 20.8211 8.39082C19.3301 11.1878 19.9747 15.3501 21.5642 17.7504C21.9951 17.4534 22.3037 17.2557 22.3357 17.2358C22.8824 16.8873 23.6297 17.028 23.9909 17.5426C24.3596 18.0608 24.2147 18.764 23.6684 19.1132C23.6503 19.124 21.9113 20.2383 20.9675 21.1331L16.4668 25.4C14.1669 27.5804 12.7226 29.7946 12.051 32.169C11.466 34.2417 8.96926 41.0803 1.42755 41.9906C0.77647 42.0691 0.181528 41.6481 0.0923246 41.0114L0.091993 41.0106ZM12.2231 37.7734C12.8649 35.9604 14.0009 35.4202 14.9169 34.9862C15.3879 34.7639 15.7939 34.5716 16.1817 34.2039C16.5206 33.8826 16.6819 33.5644 16.6744 33.2314C16.6602 32.5865 16.0645 31.9272 15.8969 31.7922C15.6255 31.5628 15.488 31.2193 15.5161 30.8739C15.5431 30.5284 15.7363 30.2138 16.0397 30.0212C18.7921 28.2109 20.7897 25.5559 23.2178 23.2661C24.6489 21.9164 25.3409 20.4711 26.0775 18.9453C26.7726 17.5036 27.4926 16.0129 28.8434 14.7322C29.3095 14.2904 30.0654 14.2904 30.5313 14.7322C30.9972 15.1741 30.9973 15.8903 30.5313 16.3324C29.4841 17.3252 28.9109 18.5122 28.2478 19.8871C27.493 21.4519 26.6369 23.225 24.9057 24.8663C24.1491 25.5835 23.4053 26.3618 22.6839 27.1184C26.1602 29.2911 27.3132 32.599 27.6975 34.5542C31.2623 33.4655 33.7352 34.8923 35.4317 36.4319C37.7668 35.4099 40.5941 36.1682 42.6731 37.0623C42.4046 36.117 42.1968 35.1606 41.9925 34.2197C41.3894 31.4452 40.8509 28.9692 39 27.2069C38.9084 28.8106 38.545 30.9334 37.4205 32.736C37.0848 33.2742 36.3524 33.4516 35.7855 33.1341C35.2158 32.8158 35.0311 32.1208 35.3657 31.5841C36.3702 29.9754 36.6053 27.9347 36.6348 26.5826C34.6794 27.1134 32.3912 27.1534 30.1159 26.6729C29.4726 26.5358 29.0681 25.9317 29.2105 25.3218C29.355 24.712 29.9923 24.3274 30.6355 24.4635C33.0683 24.978 35.472 24.7901 37.2312 23.9476C37.5786 23.7806 37.9903 23.7853 38.3337 23.9607C42.6781 26.1705 43.5193 30.0309 44.3305 33.7634C44.7429 35.6603 45.1322 37.4518 45.9591 39.0439C46.2003 39.509 46.0774 40.0696 45.6604 40.4054C45.2441 40.7408 44.6385 40.7647 44.1941 40.4633C42.682 39.4403 38.2538 37.1399 35.9414 38.7637C35.452 39.1079 34.7547 39.0399 34.3537 38.622C32.0488 36.2442 30.0501 35.8482 27.2284 37.1787C26.8608 37.3521 26.4239 37.3339 26.0741 37.1302C25.7242 36.9275 25.5082 36.5675 25.5036 36.1768C25.4997 35.9741 25.3612 31.2863 21.0473 28.8142C20.2051 29.6584 19.3324 30.471 18.4025 31.1789C18.7392 31.7035 19.0454 32.3935 19.0624 33.1849C19.0827 34.1396 18.6714 35.0454 17.8708 35.8045C17.2087 36.4322 16.5303 36.7535 15.9847 37.0114C15.205 37.3808 14.8132 37.5657 14.4893 38.4897C14.2805 39.0824 13.6045 39.4053 12.9794 39.2053C12.2719 38.979 12.0467 38.2762 12.2246 37.7738L12.2231 37.7734ZM27.6704 12.0163C27.2374 11.5459 27.2775 10.8343 27.7706 10.4195C29.9181 8.61088 35.3743 7.82795 35.9895 7.74476C36.7326 7.64339 37.4448 8.31824 37.3403 9.02477C37.1897 10.0218 36.3468 15.0869 34.4706 16.8656C34.0046 17.3074 33.2487 17.3074 32.7828 16.8656C32.3168 16.4238 32.3167 15.7075 32.7828 15.2654C33.5415 14.5461 34.2565 12.2616 34.688 10.2617C32.6943 10.6557 30.2911 11.3258 29.3558 12.1104C28.8272 12.5539 28.0632 12.4424 27.6707 12.0161L27.6704 12.0163Z";

    const d3n = new D3Node();

    var width = 875,
      height = 875,
      radius = Math.min(width, height) / 2 - 10;

    var svg = d3n.createSVG(width, height).attr("x", "0").attr("y", "0").attr("viewBox", `0 0 ${width} ${height}`).append("g");

    // var svg = d3.select("#" + this.elementId).append("svg").append("g");

    svg.append("defs").append("style").attr("type", "text/css"); // .insert("style", font)

    svg.append("g").attr("class", "slices");

    svg.append("g").attr("class", "slices2");

    svg.append("g").attr("class", "slices3");

    svg.append("g").attr("class", "slices-principles");

    svg.append("g").attr("class", "slices-principles-values");
    svg.append("g").attr("class", "slices-principles-border");

    svg.append("g").attr("class", "slices-alert");

    svg.append("g").attr("class", "global");

    svg.append("g").attr("class", "global-pct");

    svg.append("g").attr("class", "global-dragon");

    svg.append("g").attr("class", "labels");

    svg.append("g").attr("class", "labels-pct");

    svg.append("g").attr("class", "labels-principles");

    svg.append("g").attr("class", "labels-principles-values");

    svg.append("g").attr("class", "dragons");

    svg.append("g").attr("class", "lines");

    svg
      .append("path")
      .attr("d", dragon)
      .attr("fill", dgrColor(globalLevel()))
      .attr("transform", "rotate(45) translate(-20 -45)");

    var pie = d3.layout
      .pie()
      .sort(null)
      .value(function (d) {
        return d.value;
      });

    var arc = d3.svg
      .arc()
      .outerRadius(radius * 0.52)
      .innerRadius(radius * 0.2);

    var arc2 = d3.svg
      .arc()
      .innerRadius(radius * 0.2)
      .outerRadius(radius * 0.25);

    var arc3 = d3.svg
      .arc()
      .innerRadius(radius * 0.52)
      .outerRadius(radius * 0.85);

    var arc4 = d3.svg
      .arc()
      .innerRadius(radius * 0.52)
      .outerRadius(radius * 0.57);

    var arc5 = d3.svg
      .arc()
      .innerRadius(radius * 0.85)
      .outerRadius(radius * 0.9);

    var arc6 = d3.svg
      .arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.96);

    svg.attr(
      "transform",
      "translate(" + width / 2 + "," + height / 2 + ") rotate(-45)"
    );

    var key = function (d) {
      return d.data.label;
    };

    var colorQuarters = d3.scale
      .ordinal()
      .domain(domainsData().map((d) => d.name))
      .range(domainsData().map((d) => bgrColor(d.value)));

    const domains = () => {
      var labels = colorQuarters.domain();
      return labels.map((label, i) => {
        return {
          label: label,
          value: 90,
          i,
          hidden: domainsData()[i].hidden,
        };
      });
    };

    var colorDomains = d3.scale
      .ordinal()
      .domain(quartersData().map((d) => d.name))
      .range(
        quartersData().map((d, i) =>
          i % 2 === 0 ? barColor(d.value) : "transparent"
        )
      );

    const domainsValues = () => {
      return domainsValuesData().map((q) => {
        return { label: q.name, value: q.value };
      });
    };

    const splitTextInLines = (text, maxLine) => {
      if (!text) return ["", ""];
      let j = 0;
      let newText = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (j >= maxLine && c === " ") {
          j = 1;
          newText += "^";
        } else {
          newText += c;
        }
        j++;
      }
      return newText.split("^");
    };

    const principlesValues = () => {
      return principlesValuesData();
    };

    var colorPrinciples = d3.scale
      .ordinal()
      .domain(
        principlesValues()
          .filter((pv, i) => i % 2 === 0)
          .map((pv) => pv.label)
      )
      .range(
        principlesValues()
          .filter((pv, i) => i % 2 === 0)
          .map((pv) => bgrColor(pv.value))
      );

    const principles = () => {
      var labels = colorPrinciples.domain();
      return labels.map((label, i) => {
        return {
          label: label,
          value: 60,
          i,
          description: principlesValues()[i * 2].description,
          hidden: principlesValues()[i * 2].hidden,
        };
      });
    };

    const globalValue = () => {
      return [
        {
          label: "Global",
          value: 100,
          description: "Global",
        },
      ];
    };

    var colorPrinciplesValues = d3.scale
      .ordinal()
      .domain([
        "p0v",
        "p0",
        "p1v",
        "p1",
        "p2v",
        "p2",
        "p3v",
        "p3",
        "p4v",
        "p4",
        "p5v",
        "p5",
        "p6v",
        "p6",
        "p7v",
        "p7",
        "p8v",
        "p8",
        "p9v",
        "p9",
        "p10v",
        "p10",
        "p11v",
        "p11",
      ])
      .range(
        principlesValues().map((pv, i) =>
          i % 2 === 0 ? barColor(pv.value) : "transparent"
        )
      );

    var colorPrinciplesAlert = d3.scale
      .ordinal()
      .domain(
        principlesValues()
          .filter((pv, i) => i % 2 === 0)
          .map((pv) => pv.label)
      )
      .range(
        principlesValues()
          .filter((pv, i) => i % 2 === 0)
          .map((pv) => alertColor(pv.value))
      );

    var style = svg.select("style");

    style.text(font);

    var slice = svg
      .select(".slices")
      .selectAll("path.slice")
      .data(pie(domains()), key);

    slice
      .enter()
      .insert("path")
      .style("fill", function (d) {
        return colorQuarters(d.data.label);
      })
      .style("stroke-width", 3)
      .style("stroke", "#fff")
      .attr("class", "slice")
      .attr("d", function (d) {
        return arc(d);
      });

    slice.exit().remove();

    /* ------- GAUGE SLICES -------*/
    var slice2 = svg
      .select(".slices2")
      .selectAll("path.slice")
      .data(pie(domainsValues()), key);

    slice2
      .enter()
      .insert("path")
      .style("fill", function (d) {
        return colorDomains(d.data.label);
      })
      .attr("class", "slice2")
      .attr("d", function (d) {
        return arc2(d);
      });

    /* WHITE BORDERS */
    var slice3 = svg
      .select(".slices3")
      .selectAll("path.slice")
      .data(pie(domains()), key);

    slice3
      .enter()
      .insert("path")
      .style("fill", "transparent")
      .style("stroke-width", 3)
      .style("stroke", "#fff")
      .attr("class", "slice3")
      .attr("d", function (d) {
        return arc(d);
      });

    /* PRINCIPLES */
    var slice4 = svg
      .select(".slices-principles")
      .selectAll("path.slice")
      .data(pie(principles()), key);

    slice4
      .enter()
      .insert("path")
      .style("fill", function (d) {
        return colorPrinciples(d.data.label);
      })
      .style("stroke-width", 3)
      .style("stroke", "#fff")
      .style("opacity", "0.6")
      .attr("class", "slice")
      .attr("d", function (d) {
        return arc3(d);
      });

    slice4.exit().remove();

    /* PRINCIPLES VALUES */

    var slice5 = svg
      .select(".slices-principles-values")
      .selectAll("path.slice")
      .data(pie(principlesValues()), key);

    slice5
      .enter()
      .insert("path")
      .style("fill", function (d) {
        return colorPrinciplesValues(d.data.label);
      })
      .attr("class", "slice")
      .attr("d", function (d) {
        return arc4(d);
      });

    slice5.exit().remove();

    /* PRINCIPLES BORDERS */
    var slice6 = svg
      .select(".slices-principles-border")
      .selectAll("path.slice")
      .data(pie(principles()), key);

    slice6
      .enter()
      .insert("path")
      .style("fill", "transparent")
      .style("stroke-width", 3)
      .style("stroke", "#fff")
      .attr("class", "slice")
      .attr("d", function (d) {
        return arc3(d);
      });

    slice6.exit().remove();

    /* ALERTS */
    var slice7 = svg
      .select(".slices-alert")
      .selectAll("path.slice")
      .data(pie(principles()), key);

    slice7
      .enter()
      .insert("path")
      .style("fill", function (d) {
        return colorPrinciplesAlert(d.data.label);
      })
      .style("stroke-width", 3)
      .style("stroke", "#FBF7EB")
      .attr("class", "slice")
      .attr("d", function (d) {
        return arc5(d);
      });

    slice7.exit().remove();

    /* ------- TEXT LABELS -------*/
    const midAngle = (d) => {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    };

    var text = svg
      .select(".labels")
      .selectAll("text")
      .data(pie(domains()), key);

    text
      .enter()
      .append("text")
      .selectAll("tspan")
      .data(function (d) {
        return !d.data.hidden
          ? splitTextInLines(`0${d.data.i + 1} ${d.data.label}`, 1)
          : [""];
      })
      // .attr("text-anchor", "middle")

      .enter()
      .append("tspan")
      .text(function (d) {
        return d;
      })

      .attr("dy", "1.05em")
      .attr("x", "0")
      .style("font-family", "Athletics")
      .style("font-size", "18px")
      .style("font-weight", function (d, i) {
        return i === 0 ? "800" : "500";
      });

    var text2 = svg
      .select(".labels")
      .selectAll("text")
      .data(pie(domains()), key);

    text2
      .attr("transform", function (d) {
        var pos = arc.centroid(d);
        pos[0] = pos[0] * 1.38;
        pos[1] = pos[1] * 1.38;
        return (
          "translate(" + pos + ") rotate(" + (90 * (d.data.i + 1) - 45) + ")"
        );
      })
      .attr("text-anchor", "middle");

    // text
    //   .enter()
    //   .append("text")

    //   .selectAll("tspan")

    //   .data(function (d) {
    //     return !d.data.hidden
    //       ? splitTextInLines(d.data.label || "", 1)
    //       : [""];
    //   })
    //   // .attr("text-anchor", "middle")

    //   .enter()
    //   .append("tspan")
    //   .text(function (d) {
    //     return d;
    //   })

    //   .attr("dy", "1.05em")
    //   .attr("x", "0")

    //   // .text(function (d) {
    //   //   return !d.data.hidden ? d.data.label : "";
    //   // })
    //   // .attr("transform", function (d) {
    //   //   var pos = arc.centroid(d);
    //   //   pos[0] = pos[0] * 1.1;
    //   //   pos[1] = pos[1] * 1.1;
    //   //   return (
    //   //     "translate(" + pos + ") rotate(" + (90 * (d.data.i + 1) - 45) + ")"
    //   //   );
    //   // })
    //   .style("font-family", "Athletics")
    //   .style("font-size", "20px")
    //   .style("font-weight", "500")
    //   .attr("text-anchor", "middle")
    //   .append("tspan")
    //   .text(function (d, i) {
    //     const d2 = domains()[i];
    //     return !d2.hidden ? `0${d2.i + 1}` : "";
    //   })
    //   .attr("dy", "-1.05em")
    //   .attr("x", "0")
    //   .style("font-family", "Athletics")
    //   .style("font-size", "18px")
    //   .style("font-weight", "500");

    text.exit().remove();

    /* PCT LABELS */

    var pctValues = domainsValues().filter((v, i) => i % 2 === 0);

    var pct = svg
      .select(".labels-pct")
      .selectAll("text")
      .data(pie(domains()), key);

    pct
      .enter()
      .append("text")
      // .attr("dy", "-2.5em")
      .text(function (d) {
        return domainsValues()[d.data.i * 2].value
          ? `${domainsValues()[d.data.i * 2].value}%`
          : "";
      })
      .style("font-family", "Athletics")
      .style("font-size", "22px")
      .style("font-weight", "500")
      .attr("transform", function (d) {
        var pos = arc.centroid(d);
        pos[0] = pos[0] * 0.72;
        pos[1] = pos[1] * 0.72;
        return (
          "translate(" + pos + ") rotate(" + (90 * (d.data.i + 1) - 45) + ")"
        );
      })
      .attr("text-anchor", "middle");

    pct.exit().remove();

    /* PRINCIPLES LABELS */

    var textp = svg
      .select(".labels-principles")
      .selectAll("text")
      .data(pie(principles()), key);

    textp
      .enter()
      .append("text")
      .selectAll("tspan")
      .data(function (d) {
        return d.data.description
          ? splitTextInLines(d.data.description, 13)
          : !d.data.hidden
          ? splitTextInLines(d.data.label || "", 13)
          : [""];
      })
      // .attr("text-anchor", "middle")

      .enter()
      .append("tspan")
      .text(function (d) {
        return d;
      })

      .attr("dy", "1.05em")
      .attr("x", "0")
      .style("font-family", "Athletics")
      .style("font-size", "14px")
      .style("font-weight", "400");

    var textp2p = svg
      .select(".labels-principles")
      .selectAll("text")
      .data(pie(principles()), key);

    textp2p
      .attr("transform", function (d) {
        var pos = arc3.centroid(d);
        pos[0] = pos[0] * 1.18;
        pos[1] = pos[1] * 1.18;
        return (
          "translate(" + pos + ") rotate(" + (30 * (d.data.i + 1) - 15) + ")"
        );
      })
      .attr("text-anchor", "middle");

    textp.exit().remove();

    /* PRINCIPLES VALUES LABELS */

    var pvValues = principlesValues().filter((v, i) => i % 2 === 0);

    var textpv = svg
      .select(".labels-principles-values")
      .selectAll("text")
      .data(pie(principles()), key);

    textpv
      .enter()
      .append("text")
      // .attr("dy", "-2.5em")
      .text(function (d) {
        return principlesValues()[d.data.i * 2].value
          ? `${principlesValues()[d.data.i * 2].value}%`
          : "";
      })
      .style("font-family", "Athletics")
      .style("font-size", "22px")
      .style("font-weight", "500");


    var textpv2 = svg
      .select(".labels-principles-values")
      .selectAll("text")
      .data(pie(principles()), key);

    textpv2
      .attr("transform", function (d) {
        var pos = arc3.centroid(d);
        pos[0] = pos[0] * 0.86;
        pos[1] = pos[1] * 0.86;
        return (
          "translate(" + pos + ") rotate(" + (30 * (d.data.i + 1) - 15) + ")"
        );
      })
      .attr("text-anchor", "middle");

    /* ALERTS DRAGONS */

    var sliceDragons = svg
      .select(".dragons")
      .selectAll("path.slice")
      .data(pie(principles()), key);

    sliceDragons
      .enter()
      .insert("path")
      .attr("d", dragon)
      .style("fill", function (d) {
        return colorPrinciplesAlert(d.data.label);
      })
      .attr("class", "dragon")

      .attr("transform", function (d) {
        var pos = arc5.centroid(d);
        pos[0] = pos[0] * 1.14;
        pos[1] = pos[1] * 1.14;
        return (
          "translate(" +
          pos +
          ") rotate(" +
          (30 * (d.data.i + 1) - 30) +
          ") translate(-20 0) scale(0.8)"
        );
      })
      .attr("text-anchor", "middle");
    sliceDragons.exit().remove();

    /* PRINCIPLES % */

    var pvValues = principlesValues().filter((v, i) => i % 2 === 0);
    /*
    var textpv = svg
      .select(".labels-principles-values")
      .selectAll("text")
      .data(pie(principles()), key);

    textpv
      .enter()
      .append("text")
      // .attr("dy", "-2.5em")
      .text(function (d) {
        return `${principlesValues()[d.data.i * 2].value}%`;
      })
      .style("font-family", "Athletics")
      .style("font-size", "22px")
      .style("font-weight", "500");

    textpv
      .transition()
      .duration(0)
      .attrTween("transform", function (d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          var d2 = interpolate(t);
          var pos = arc3.centroid(d2);
          pos[0] = pos[0] * 0.86;
          pos[1] = pos[1] * 0.86;
          //pos[0] = 0.9 * radius * (midAngle(d2) < Math.PI ? 1 : -1);
          // return "translate("+ pos +")";
          return (
            "translate(" + pos + ") rotate(" + (30 * (d2.data.i + 1) - 15) + ")"
          );
        };
      })
      .styleTween("text-anchor", function (d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "middle" : "middle";
        };
      });

    textpv.exit().remove();

    /* GLOBAL TEXT */

    var textglobal = svg
      .select(".global")
      .selectAll("text")
      .data(pie(globalValue()), key);

    textglobal
      .enter()
      .append("text")
      .text("Global")
      .style("font-family", "Athletics")
      .style("font-size", "20px")
      .style("font-weight", "500")
      .style("text-anchor", "middle")
      .attr("transform", "rotate(45) translate(0 20)");

    var textglobalpct = svg
      .select(".global-pct")
      .selectAll("text")
      .data(pie(globalValue()), key);

    textglobal
      .enter()
      .append("text")
      .text(globalLevel() + "%")
      .style("font-family", "Athletics")
      .style("font-size", "22px")
      .style("font-weight", "500")
      .style("text-anchor", "middle")
      .attr("transform", "rotate(45) translate(0 45)");

    return d3n.svgString();
  },
};
