var exec = require('child_process').exec;
var util = require('util');
var spawn = require('child_process').spawn;
var archiver = require('archiver');
var path = require('path');
var file_system = require('fs');
var getSize = require('get-folder-size');

// http://stackoverflow.com/questions/10232192/exec-display-stdout-live
module.exports = function(domain) {
    console.log("NpmInstaller "+domain);

    var m_domain = domain;

    this.install = function(client, dir, callback) {
       console.log("############# NpmInstaller: install id: "+client.id);
        client.emit("test_msg", {
            mes: "Installation started"
        });

        var file = dir + "/package.json";
        console.log("Install: " + dir);
        dir = __dirname + "/../" + dir;
        console.log("npm " + " --prefix " + dir + " install " + dir + " --save");

        client.emit("test_msg", {
            mes: "Exectuing command: npm install --save"
        });

        var cmd = spawn("npm", ["--prefix", dir, "install", dir, "--save"]);
        var interval = setInterval(function(){
          var lastSize = 0;
          getSize(dir, function(err, size) {
            if (err) { return; }
            if(lastSize == size){
              return
            }
            console.log(lastSize+" "+size);
            lastSize = size;
            var text = (size / 1024 ).toFixed(4) + ' Kb';
            console.log(text);
            client.emit("test_msg", {
                mes: "Current project size: "+text
            });
          });
        },3000);
        cmd.stdout.on('data', function(data) {
            console.log('stdout: ' , data.toString());
            client.emit("test_msg", {
                mes: data.toString()
            });
        });

        cmd.stderr.on('data', function(data) {
            console.error('stderr: ' , data.toString());
            client.emit("test_msg", {
                mes: data.toString()
            });
        });

        cmd.on('exit', function(code) {
            console.log('child process exited with code ' + code);
            clearInterval(interval);

            if (code == 0) {
                client.emit("test_msg", {
                    mes: "npm install succeeded"
                });
                client.emit("test_msg", {
                    mes: "Compressing project"
                });
                var dirname = path.basename(dir);
                var zipFile = dir + '/../' + dirname + '.zip';
                var output = file_system.createWriteStream(zipFile);
                var archive = archiver('zip');
                console.log('dirname: ' + dirname);
                output.on('close', function() {
                    var kb = archive.pointer() / 1024;
                    console.log(kb + ' kbytes');
                    console.log('archiver has been finalized and the output file descriptor has closed.');
                    client.emit("test_msg", {
                        mes: "Project compressed, total KB: " + kb.toFixed(2)
                    });
                    client.emit("test_msg", {
                        mes: "Project ready to be donwloaded"
                    });
                    client.emit("download_link", {
                        link: dirname + '.zip',
                        name: dirname + '.zip',
                        size: kb.toFixed(2)+" KB"
                    });
                    client.emit("job_end", "");


                    setTimeout(function () {
                        console.log('delete file: '+zipFile);
                        fs.unlink(zipFile);
                    }, 60 * 1000 * 15) // 15 min60 * 1000 * 15
                    callback();
                });

                archive.on('error', function(err) {
                    client.emit("err_msg", {
                        mes: "Compress job failed"
                    });
                    callback();
                    throw err;
                });

                archive.pipe(output);
                archive.bulk([{
                    expand: true,
                    cwd: dir,
                    src: ["**/*"],
                    dot: true
                }]);
                archive.finalize();
            } else {
                client.emit("err_msg", {
                    mes: "npm install FAILED!!!!!!!!"
                });
                callback();
            }
        });
    }
}
