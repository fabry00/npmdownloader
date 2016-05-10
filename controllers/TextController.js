
var fs = require('fs');
var DirManager = require(__dirname+'/DirManager');
var Installer = require(__dirname + "/NpmInstaller");

module.exports = function TextController(domain,client, input_text, callback){

  var dirManager = new DirManager();
  var installer = new Installer(domain);

  if(!input_text || input_text == ''){
    console.error('empty content provided');
    res.status(500).send('empty content provided');
    callback();
    return;
  }
  var dir = dirManager.createDir(client);
  var file = dir + "/package.json";
  fs.writeFile(file, input_text, function(err) {
    if(err) {
      console.error("WriteFile", err);
      res.status(500).send(err);
      callback();
      return;
    }
    console.log("The file was saved! "+file);
    installer.install(client,dir,function(){
      callback();
    });
  });
}
