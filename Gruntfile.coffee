module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    coffee:
      compile:
        options:
          bare: false
          join: true
          sourceMap: true

        files:
          "extension/javascript/app.compiled.js": [
            "extension/javascript/src/common.coffee"
            "extension/javascript/src/storage.coffee"
            "extension/javascript/src/google-analytics.coffee"
          ]

    uglify:
      antp:
        options:
          mangle: false
          banner: """
            /*!
             * Awesome New Tab Page
             * Copyright 2011-2013 Awesome HQ, LLC & Michael Hart
             * http://antp.co http://awesomehq.com
             * A non-uglified version of this file is in this folder: ./app.compiled.js
             */\n
            """

          # Note for future reference:
          # This seems to be buggy for now, so I'll use non-uglified files for now
          sourceMapRoot: "/"
          sourceMap: "app.compiled.uglified.js.map",
          sourceMapPrefix: 3
          sourceMappingURL: "app.compiled.uglified.js.map"

        files:
          "extension/javascript/app.compiled.uglified.js": [
            "extension/javascript/app.compiled.js"
          ]
      libs:
        options:
          mangle: false
          banner: """
            /*!
             * Merged and uglified files from third parties.
             * Full files and licenses can be found in ./libs folder relative to this file.
             * Possibly incomplete list of files/libraries included:
             * - raven.min.js https://github.com/getsentry/raven-js
             * - center.js http://stackoverflow.com/a/2257651/1335143
             * - quantize.js https://gist.github.com/nrabinowitz/1104622
             * - color-thief.js https://github.com/lokesh/color-thief
             */\n
             """

        files:
          "extension/javascript/libs.uglified.js": [
            "extension/javascript/libs/raven.min.js"
            "extension/javascript/libs/center.js"
            "extension/javascript/libs/quantize.js"
            "extension/javascript/libs/color-thief.js"
          ]


    watch:
      files: [ "extension/javascript/src/*.coffee" ]
      tasks: [ "coffee:compile", "uglify:libs" ]

    compress:
      main:
        options:
          archive: "antp-packaged.zip"
          pretty: true

        files: [
          src: [
            "extension/**"
            "!extension/javascript/src/**"
            "!extension/images/ui-2/src/**"
          ]
          dest: "./"
          filter: "isFile"
        ]


  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-compress"

  grunt.registerTask "default", [ "coffee:compile", "uglify:libs", "watch" ]
  grunt.registerTask "package", [ "coffee:compile", "uglify:libs", "compress" ]
