const path = require('path');
const Generator = require('yeoman-generator');
const glob = require('glob');
const slugify = require('underscore.string/slugify');
const mkdirp = require('mkdirp');
const os = require('os');

module.exports = class extends Generator {
//    Initializing
constructor(args, opts) {
  super(args, opts);

  // add option to skip install
  // this.option('skip-install');

  this.slugify = slugify;
  this.appname = path.basename(path.resolve('./'));
  this.rootnamespace = 'http://sap.com/x4';
}

//prompting to handle user input
//app subdirectory selection
dir() {
  if (this.options.createDirectory !== undefined) {
    return true;
  }

  const prompt = [{
    type: 'confirm',
    name: 'createDirectory',
    message: 'Would you like to create a submodule for your project?',
  }];

  return this.prompt(prompt).then((response) => {
    this.options.createDirectory = response.createDirectory;
  });
}

dirname() {
  if (!this.options.createDirectory || this.options.dirname) {
    return true;
  }

  const prompt = [{
    type: 'input',
    name: 'dirname',
    message: 'Enter submodule name default:subapp(Please make sure you are in the project folder!):',
  }];

  return this.prompt(prompt).then((response) => {
    console.log(this.appname);
    if(response.dirname){
    this.options.dirname = 'packages'+'/'+response.dirname;
    this.subappname = response.dirname;
    }else{
    this.options.dirname = 'packages'+'/'+'subapp';
    this.subappname = 'subapp';
    }
    console.log(this.options.dirname);
   
  });

}

//create bo model
bomodel(){
  if (this.options.createBomodel !== undefined || !this.options.createDirectory) {
    return true;
  }

  const prompt = [{
    type: 'confirm',
    name: 'createBomodel',
    message: 'Would you like to create a Bo model?',
  }];

  return this.prompt(prompt).then((response) => {
    this.options.createBomodel = response.createBomodel;
  });
}
bomodelname(){
  if (this.options.boname || !this.options.createBomodel) {
    return true;
  }

  const prompt = [{
    type: 'input',
    name: 'boname',
    message: 'Please enter your bo name(default:bo)',
  }];

  return this.prompt(prompt).then((response) => {
    if(response.boname){
      this.options.boname = response.boname;
    }else{
      this.options.boname = 'bo';
    }

    this.log(this.options.boname);
    
  });
}

//create UI component
uicomponent(){
  if (this.options.createUicomponent !== undefined || !this.options.createDirectory) {
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
      'QA'
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
    message: 'Please enter your uicomponent name(default:test)',
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

writing(){
  // create directory
  if (this.options.createDirectory) {


    this.destinationRoot('./')
            //modify the x4-app.json to add new namespace
            this.options.namespace = {
              "namespace": `${this.rootnamespace}/${this.appname}/${this.subappname}`,
              "type": "path",
              "value": `${this.appname}/${this.subappname}`
             }
    
              this.options.Jsonx4app = this.fs.readJSON(this.destinationPath('x4-app.json'))
              this.options.Jsonx4app.applicationAreas.push(this.options.namespace);
    
              this.fs.writeJSON(this.destinationPath('x4-app.json'),this.options.Jsonx4app);

    this.destinationRoot(this.options.dirname);

   // shared across all generators
    this.sourceRoot(path.join(__dirname, 'templates', 'shared'));
    glob.sync('**', { cwd: this.sourceRoot() }).forEach((file) => {
    this.fs.copyTpl(this.templatePath(file), this.destinationPath(file.replace(/^_/, '')), this);
    });

    if(this.options.createBomodel){

     //create bo ts 
       this.fs.write(this.destinationPath(`models/${this.options.boname}.ts`),'');
     //refresh x4-app-package.json in action node
      this.options.actionstep =  {
          "type": "genDb",
          "bo": this.options.boname,
          "namespace": `${this.rootnamespace}/${this.appname}/${this.subappname}`
        };
        this.options.Jsonx4apppackage = this.fs.readJSON(this.destinationPath('x4-app-package.json'))
        this.options.Jsonx4apppackage.setupActions.actions[0].steps.push(this.options.actionstep);

        this.fs.extendJSON(this.destinationPath('x4-app-package.json'),this.options.Jsonx4apppackage);

     }
  
     if(this.options.createUicomponent){

     // mkdirp.sync('ui');
      this.sourceRoot(path.join(__dirname, 'templates','ui'));
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
    // //shared folders
    // mkdirp.sync('models');
    // mkdirp.sync('ui');
  
    // this.sourceRoot(path.join(__dirname, 'templates', 'ui'));
    // this.fs.copyTpl(this.templatePath('.'), this.destinationPath('ui'), this);

    }



}
    
};