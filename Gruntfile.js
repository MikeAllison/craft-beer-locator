module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      scripts: {
        files: ['js/dev/**/*.js'],
        tasks: ['concat', 'uglify']
      },
      css: {
        files: ['css/dev/*.css'],
        tasks: ['cssmin']
      }
    },

    concat: {
      dist: {
        src: [
          'js/dev/config.js',
          'js/dev/**/*.js',
          'js/dev/init.js'
        ],
        dest: 'js/dist/app.js'
      }
    },

    uglify: {
      my_target: {
        files: {
          'js/dist/app.min.js': ['js/dist/app.js']
        }
      }
    },

    cssmin: {
      target: {
        files: [{
          src: 'css/dev/custom.css',
          dest: 'css/custom.min.css'
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
