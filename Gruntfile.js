module.exports = function(grunt) {
	"use strict";

	grunt.initConfig({
		watch: {
			files: [
				'public/css/main.css',
				'public/js/main.js'
			],
			tasks: ['build']
		},
		uglify: {
			my_target: {
			  files: {
			    'public/js/main.min.js': ['public/js/main.js']
			  }
			}
		},
		cssmin: {
			compress: {
			    files: {
			      'public/css/main.min.css': [
			      	'public/css/normalize.css',
			      	'public/css/main.css'
			      ]
			    }
			  }
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.registerTask('build', [
		'uglify',
		'cssmin'
	]);
	grunt.event.on('watch', function(action, filepath) {
	  grunt.log.writeln(filepath + ' has ' + action);
	});
}
