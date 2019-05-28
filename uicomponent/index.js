//when using x4-app:uicomponent trigger a uicomponent creation
const path = require('path');
const Generator = require('yeoman-generator');
const glob = require('glob');
const slugify = require('underscore.string/slugify');
const mkdirp = require('mkdirp');

module.exports = class extends Generator {

//Initializing
constructor(args, opts) {
    super(args, opts);
  
    // add option to skip install
    // this.option('skip-install');
  
    this.slugify = slugify;
    this.subappname = path.basename(path.resolve('./'));
    let arrPath = path.resolve('./').split(path.sep);
    this.appname = arrPath[arrPath.length-3];
    this.rootnamespace = 'http://sap.com/x4';
  }

//Prompting
//create UI component
uicomponent(){
    if (this.options.createUicomponent !== undefined) {
      return true;
    }
  
    const prompt = [{
      type: 'confirm',
      name: 'createUicomponent',
      message: 'Would you like to create uicomponent(s)?',
    }];
  
    return this.prompt(prompt).then((response) => {
      this.options.createUicomponent = response.createUicomponent;
    });
  }
  uicomponenttype(){
    if (this.options.uicomponenttype || !this.options.createUicomponent) {
      return true;
    }
  
    const prompt = [{
      type: 'list',
      name: 'uicomponenttype',
      message: 'Please select a uicomponent type:',
      choices: [
        'OWL',
        'QA',
      ],
      store: false,
    }];
  
    return this.prompt(prompt).then((response) => {
      this.options.uicomponenttype = response.uicomponenttype.toLowerCase();
    });
  }
  
  uicomponentname(){
    if (this.options.uicomponentname || !this.options.uicomponenttype) {
      return true;
    }
  
    const prompt = [{
      type: 'input',
      name: 'uicomponentname',
      message: 'Enter your uicomponent name IN THE PACKAGE DIR(default:test)',
    }];
  
    return this.prompt(prompt).then((response) => {
      if(response.uicomponentname){
        this.options.uicomponentname = response.uicomponentname;
      }else{
        this.options.uicomponentname = 'test';
      }
  
      this.log(this.options.uicomponentname);
      
    });
  }

  //writing
  writing(){
    this.destinationRoot('./');
    if(this.options.createUicomponent){
        this.sourceRoot(path.join(__dirname, 'templates'));
        //create uicomponent 
        console.log(this.options.uicomponenttype);
        if(this.options.uicomponenttype === 'qa'){
          this.fs.write(this.destinationPath(`ui/${this.options.uicomponentname}.QA.uicomponent`),this.fs.read(this.templatePath('./template.QA.uicomponent'),'utf8'))
          this.options.viewpath = `ui/${this.options.uicomponentname}.QA.uicomponent`;
        }else if(this.options.uicomponenttype === 'owl'){
          this.fs.write(this.destinationPath(`ui/${this.options.uicomponentname}.OWL.uicomponent`),this.fs.read(this.templatePath('./template.OWL.uicomponent'),'utf8'))
          this.options.viewpath = `ui/${this.options.uicomponentname}.OWL.uicomponent`;
        }else{
          // this.sourceRoot(path.join(__dirname, 'templates', 'submodule','ui'));
          this.fs.copyTpl(this.templatePath('.'), this.destinationPath('ui'), this);
        }
        //refresh x4-app-package.json in view node
        this.options.view = {
          "id": this.options.uicomponentname,
          "targetPath": this.options.viewpath,
          "subTypeCode": "APPL",
          "title": "",
          "parentTitle": "",
          "devices": "*",
          "commonTasks": [],
          "assignedObjects": []
        }

        this.options.Jsonx4apppackage = this.fs.readJSON(this.destinationPath('x4-app-package.json'))
        this.options.Jsonx4apppackage.workCenters[0].views.push(this.options.view);

        this.fs.extendJSON(this.destinationPath('x4-app-package.json'),this.options.Jsonx4apppackage);
      }
  }
}