var JobsController = require(__dirname + '/JobsController');
module.exports = function(socket, home) {
  var m_home = home;
  console.log("SOCKET::m_home: "+m_home);

  // Add a connect listener
  socket.on('connection', function(client) {
      console.log('Connection to client established '+client.id);

      var jbsCnt = new JobsController();
      jbsCnt.getAllJobs(function(jobs){
        client.emit("total_jobs", {
            mes: jobs.total_jobs
        });
        client.emit("jobs", {
            mes: jobs.jobs
        });
      });


      client.on('test_msg', function(msg) {
          console.log('test_msg1: ' + msg);
      });


      client.on('method_text', function(msg) {
          console.log('method_text: ' + msg+" "+client.id+" m_home:"+m_home);
          var jbsCnt = new JobsController();
          jbsCnt.textJob(m_home, client, socket, msg);
      });

      // Success!  Now listen to messages to be received
      client.on('message', function(event) {
          console.log('Received message from client!', event);
      });

      client.on('disconnect', function() {
          //clearInterval(interval);
          console.log('Server has disconnected');
      });
  });
};
