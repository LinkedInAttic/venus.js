
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-contrib-clean');

  var src = ['lib/**/*.js'];

  grunt.initConfig({
    clean : {
      doc : 'doc',
      unit : 'coverage/unit'
    },
    eslint: {
      options: {
        config: '.eslintrc'
      },
      target: src
    },
    mocha_istanbul: {
      unit: {
        src: 'test/unit', // the folder, not the files,
        options: {
          mask: '**/*.spec.js',
          root: 'lib',
          reportFormats: ['html'],
          reporter : 'spec',
          coverageFolder : 'coverage/unit'
        }
      }
    },
    mochaTest: {
      options: {
        reporter: 'spec'
      },
      unit : {
        src: ['test/unit/**/*.spec.js']
      },
      integration : {
        src: ['test/integration/**/*.spec.js']
      }
    },
    jsdoc : {
      dist : {
        src: ['lib/**/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },
    watch : {
      src : {
        files : src,
        tasks : ['test:fast']
      }
    }
  });

  grunt.registerTask('default', ['test', 'build']);
  grunt.registerTask('build', ['clean:doc','jsdoc']);
  grunt.registerTask('test', ['eslint', 'clean:unit', 'mocha_istanbul']);
  grunt.registerTask('test:integration', ['mochaTest']);
  grunt.registerTask('test:unit', ['mochaTest']);
};
