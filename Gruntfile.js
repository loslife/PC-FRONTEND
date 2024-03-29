module.exports = function (grunt) {

    var sourceDir = "src";// 源码目录
    var buildDir = ".build";// transport任务临时目录
    var seaDir = "sea_modules";// concat和uglify任务临时目录
    var frontDir = "frontend";// 前端目录
    var serverDir = "webapps";// 后端目录
    var distDir = "YAE";// 最终交付目录

    var transport = require('grunt-cmd-transport');
    var style = transport.style.init(grunt);
    var script = transport.script.init(grunt);

    var nailPortalPath = sourceDir + "/portal/static/nail/css";
    var thirdJsPath = sourceDir + "/3rd-lib";
    var cssFile = {}, jsFile = {};

    cssFile[nailPortalPath + "/nailportal-min.css"] = [
        nailPortalPath + "/animations.css",
        nailPortalPath + "/build.css",
        nailPortalPath + "/columnal.css",
        nailPortalPath + "/custom.css",
        nailPortalPath + "/normalize.css",
        nailPortalPath + "/zino.core.css",
        nailPortalPath + "/zino.slideshow.css"
    ];

    jsFile["src/portal/static/nail/js/nailportal-min.js"] = [
        thirdJsPath + "/jquery-1.8.3.min.js",
        thirdJsPath + "/jquery.easing.1.3.js",
        thirdJsPath + "/jquery.easing.compatibility.js",
        thirdJsPath + "/zino.slideshow.min.js"
    ];

    jsFile[thirdJsPath+"/phonegap/cordova.yilos-min.js"] = [
        thirdJsPath + "/phonegap/cordova.js",
        thirdJsPath + "/phonegap/yilos-extend.js"
    ];


    grunt.initConfig({
        cssmin: {
            nailPortal: {
                files: cssFile
            }
        },
        transport: {
            options: {
                parsers: {
                    '.js': [script.jsParser],
                    '.css': [style.css2jsParser]
                },
                alias: {
                    "admin/package": "admin/static/package",
                    "employee/package": "employee/static/package",
                    "hair/package": "hair/static/package",
                    "member/package": "member/static/package",
                    "pos/package": "pos/static/package",
                    "product/package": "product/static/package",
                    "sysmgr/package": "sysmgr/static/package",
                    "uiframework/package": "uiframework/static/package",
                    "warehousing/package": "warehousing/static/package",
                    "widgets/package": "widgets/static/package",
                    "portal/nail/package": "portal/static/nail/package"
                }
            },
            build: {
                files: [
                    {
                        expand: true,
                        cwd: sourceDir,
                        src: ['**/static/**/*.js', '**/static/**/*.css', '!3rd-lib/*'],
                        dest: buildDir
                    }
                ]
            }
        },
        concat: {
            options: {
                include: 'relative'
            },
            build: {
                files: [
                    {
                        expand: true,
                        cwd: buildDir,
                        src: ['**/package.js', '**/package-debug.js', '**/main.js', '**/main-debug.js'],
                        dest: seaDir
                    }
                ]
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            build: {
                files: [
                    {
                        expand: true,
                        cwd: seaDir,
                        src: ['**/*.js', '!**/*-debug.js'],
                        dest: seaDir
                    }
                ]
            },
            thirdjs: {
                files: jsFile
            }
        },
        copy: {
            frontend: {
                files: [
                    {
                        expand: true,
                        flatten: false,
                        cwd: sourceDir,
                        src: ['**/static/**/*', '!**/static/**/*.js', '**/static/**/index.js', '**/static/**/globalext.js'],
                        filter: 'isFile',
                        dest: frontDir,
                        rename: function (dest, src) {
                            var arr = src.split("/");
                            arr.splice(1, 1);// 去掉中间的static
                            var splicePath = arr.join("/");
                            return dest + "/" + splicePath;
                        }
                    },
                    {
                        expand: true,
                        flatten: false,
                        cwd: sourceDir,
                        src: [ '3rd-lib/**/*'],
                        filter: 'isFile',
                        dest: frontDir
                    },
                    {
                        expand: true,
                        flatten: false,
                        src: [seaDir + '/**/*'],
                        filter: 'isFile',
                        dest: frontDir
                    }
                ]
            },
            server: {
                files: [
                    {
                        expand: true,
                        flatten: false,
                        cwd: sourceDir,
                        src: ['**/*', '!**/test/**/*', '!**/static/**/*', "!3rd-lib/**/*"],
                        filter: 'isFile',
                        dest: serverDir
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        flatten: false,
                        src: ['bin/**/*', 'conf/**/*', frontDir + '/**/*', 'lib/**/*', serverDir + '/**/*', 'package.json'],
                        dest: distDir
                    }
                ]
            }
        },
        mkdir: {
            build: {
                options: {
                    mode: 0777,
                    create: [distDir + '/logs', distDir + '/var/uploads', distDir + '/public/mobile/backup', distDir + '/apk']
                }
            }
        },
        clean: {
            build: [buildDir, seaDir, frontDir, serverDir]
        },
        yilosi18n:{
            production:{
                files:[{
                    src:["src/*/static/*-min.html"]
                }] ,
                options:{
                    locales:["src/*/static/locales/*/*.json"],
                    output:"YAE/frontend",
                    base:"src"
                }
            },
            dev:{
                files:[{
                    src:["src/*/static/*.html","!src/*/static/*-min.html","!src/*/static/*_US.html","!src/*/static/*CN.html"]
                }] ,
                options:{
                    locales:["src/*/static/locales/*/*.json"],
                    output:"src",
                    base:"src"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadTasks('grunt_task');


    grunt.registerTask('default', ['transport', 'concat', 'uglify', 'copy', 'mkdir', 'clean']);

};