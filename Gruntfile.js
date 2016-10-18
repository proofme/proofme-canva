module.exports = function (grunt) {

    require('jit-grunt')(grunt, {
        express: 'grunt-express-server',
        force: "grunt-force-task"
    });
    grunt.loadNpmTasks('grunt-crx');


    grunt.initConfig({

        jpm: {
            options: {
                src: "./src/",
                xpi: "./build/"
            }
        },
        crx: {
            public: {
                src: "src/**/*",
                dest: "build/ProofMe For Canva.zip",
            },

            signed: {
                src: "src/**/*",
                dest: "build/ProofMe For Canva.crx",
                options: {
                    privateKey: "~/myPrivateExtensionKey.pem"
                }
            }
        }
    });

    grunt.registerTask('package', ['crx:public'/*,"jpm:xpi"*/]);
    grunt.registerTask('default', ['package']);
}
