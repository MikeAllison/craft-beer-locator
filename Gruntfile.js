module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: [
          'js/dev/config.js',
          'js/dev/controllers/*.js',
          'js/dev/models/*.js',
          'js/dev/views/*.js',
          'js/dev/init.js'
        ],
        dest: 'js/dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      my_target: {
        files: {
          'js/dist/<%= pkg.name %>.min.js': ['js/dist/<%= pkg.name %>.js']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['concat', 'uglify']);

};
