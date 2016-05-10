var Jobs = require(__dirname + '/../models/Jobs');
var TextController = require(__dirname + '/TextController');

module.exports = function() {
    console.log("JobsController");


    this.init = function() {
        console.log("JobsController::init");
        Jobs.find({}, (err, jobs) => {
            if (err) {
                // Send the error to the client if there is one
                console.error(err);
                throw err;
                return;
            }
            if (jobs.length == 0) {
                console.log("JobsController::create document");
                var newJobs = new Jobs({
                    jobs: 0,
                    total_jobs: 0
                });
                newJobs.save(function(err) {
                    if (err) {
                        return err;
                    } else {
                        console.log("JobsController:: jobssaved");
                    }
                });
            } else {
              var job = jobs[0];
              job.jobs = 0;
              job.save(function(err){
                if(err){
                  throw err;
                }
              });
              console.log("JobsController::current jobs: ", jobs);
            }
        });
    }

    this.getAllJobs = function(callback) {
        console.log("JobsController::getAllJobs");
        getAllJobs(callback);
    }

    this.textJob = function(domain,client, socket, input_text) {
        console.log("######## JobsController::textJob "+client.id);
        jobStarted(socket);
        new TextController(domain, client, input_text, function() {
            jobEnd(socket);
        });
    }

    function getAllJobs(callback) {
        Jobs.find({}, (err, jobs) => {
            if (err) {
                // Send the error to the client if there is one
                console.error(err);
                throw err;
                return;
            }
            console.log("JobsController::getAllJobs ", jobs[0]);
            // Send users in JSON format
            callback(jobs[0]);
        });
    }

    function jobStarted(socket) {
        console.log("JobsController::new Job started ");

        getAllJobs(function(jobs) {
              jobs.jobs += 1;
              jobs.total_jobs += 1;
              jobs.save(function(err) {
                  if (err) {
                      throw err;
                  }
                  console.log("JobsController::model updated");
                  socket.emit("total_jobs", {
                      mes: jobs.total_jobs
                  });
                  socket.emit("jobs", {
                      mes: jobs.jobs
                  });
              });
        });
        /*socket.broadcast.emit('message',
                              'Message to all units. I repeat, message to all units.');*/
    }

    function jobEnd(socket) {
        console.log("JobsController::Job finished");
        getAllJobs(function(jobs) {
            jobs.jobs = (jobs.jobs - 1 < 0) ? 0 : jobs.jobs - 1;
            jobs.save(function(err) {
                if (err) {
                    throw err;
                }
                console.log("JobsController::model updated");
                socket.emit("jobs", {
                    mes: jobs.jobs
                });
            });
        });
    }
}
