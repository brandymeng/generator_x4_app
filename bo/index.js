//when using x4-app:bo trigger a bo creation
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

//prompting

//create bo model
bomodel(){
    if (this.options.createBomodel !== undefined) {
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
      message: 'Enter your bo name IN THE PACKAGE DIR(default:bo)',
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

  //writing
  writing(){

    this.destinationRoot('./');
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
  }


}