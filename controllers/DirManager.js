var randomstring = require("randomstring");
var fs = require('fs');
var rmdir = require('rmdir');
module.exports = function(){
  console.log("DirManager");
  var root = "tmp";

  this.init = function(){
    console.log('init: '+root+" -"+fs.existsSync(root));
    if (fs.existsSync(root)){
      rmdir(root, function (err, dirs, files) {
          console.log('folder removed: '+root);
          console.log("Creating dir:"+root);
          fs.mkdirSync(root);
      });
    } else{
        console.log("Creating dir:"+root);
        fs.mkdirSync(root);
    }
  }

  this.createDir = function(client){
    var dir = "";
    do{
      dir = root +"/"+ randomstring.generate();
      console.log("test: "+dir);
    }while(fs.existsSync(dir));
    try {
      console.log("createDir: "+dir);
      fs.mkdirSync(dir);
      client.emit("test_msg",{mes:"Folder created: "+dir});
    } catch(e) {
      console.error(e);
      client.emit("err_msg",{mes:e});
      return;
    }

    setTimeout(function () {
        console.log('delete dir: '+dir);
        rmdir(dir, function (err, dirs, files) {
            console.log('folder removed: '+dir);
            client.emit("test_msg",{mes:"Folder removed"});
          });
    }, 60 * 1000 * 15) // 15 min
    return dir;
  }
}
