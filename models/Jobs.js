var mongoose = require('mongoose');
// Create a schema for the Todo object
var jobsSchema = new mongoose.Schema({
  jobs: Number,
  total_jobs: Number
});
// Expose the model so that it can be imported and used in the controller
//export default mongoose.model('jobs', jobsSchema);
module.exports = mongoose.model('jobs', jobsSchema);
