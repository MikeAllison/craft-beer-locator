module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      scripts: {
        files: ['js/src/**/*.js'],
        tasks: ['concat', 'uglify']
      },
      css: {
        files: ['css/src/*.css'],
        tasks: ['concat', 'cssmin']
      }
    },

    concat: {
      js: {
        src: [
          'js/src/config.js',
          'js/src/**/*.js',
          'js/src/init.js'
        ],
        dest: 'js/build/app.js'
      },
      css: {
        src: [
          'css/src/bootstrap.css',
          'css/src/icomoon.css',
          'css/src/custom.css'
        ],
        dest: 'css/build/app.css'
      }
    },

    uglify: {
      my_target: {
        files: {
          'js/build/app.min.js': ['js/build/app.js']
        }
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'css/build',
          src: ['*.css', '!*.min.css'],
          dest: 'css/build',
          ext: '.min.css'
        }]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);

};
