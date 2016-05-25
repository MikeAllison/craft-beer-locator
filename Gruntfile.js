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
