const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const each = require('async/each');
const mkdir = require('mkdirp');

Handlebars.registerHelper('reduce', number => number * (2 / 3));
Handlebars.registerHelper('toJSON', obj => JSON.stringify(obj));

class TemplateBuilder {
  constructor(svgList) {
    this.svgList = svgList;
    this.build = this.build.bind(this);
    this.compileTemplate = this.compileTemplate.bind(this);
  }

  buildAll(templateList) {
    each(templateList, (templateItem) => {
      this.build(templateItem);
    });
  }

  build(templateItem) {
    if (!templateItem) {
      return;
    }
    const srcPath = templateItem.template;
    const destPathList = templateItem.dest;
    const filename = TemplateBuilder.makeFileName(templateItem, srcPath);
    const extraData = templateItem.etc;

    const compiledResult = this.compileTemplate(srcPath, extraData);

    each(destPathList, (destPath) => {
      mkdir.sync(destPath);
      fs.writeFileSync(path.join(destPath, filename), compiledResult, { flags: 'w+' });
    });
  }

  compileTemplate(srcPath, extraData) {
    const template = fs.readFileSync(srcPath, { encoding: 'utf8' });
    const compile = Handlebars.compile(template);
    const compileData = Object.assign({ svgList: this.svgList }, extraData);
    return compile(compileData);
  }

  static makeFileName(templateItem, srcPath) {
    const basename = templateItem.name || path.basename(srcPath, path.extname(srcPath));
    const extname = templateItem.type;
    return path.format({
      name: basename,
      ext: `.${extname}`,
    });
  }
}

module.exports = TemplateBuilder;
