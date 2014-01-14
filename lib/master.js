var net = require('net');
var fs = require("fs");
var cp = require('child_process');
var program = require('commander');
var _ = require('underscore');

var utils = require('./utils');


var CONFIG = {};
var PORT = 3000;
var GRACE_EXIT_TIME = 2000;//2s
var WORKER_PATH = __dirname + '/worker.js';
var WORKER_HEART_BEAT = 10 * 1000;//10s, update memory ,etc
var self = this;

function output(str) {
    console.log(str);
}
function main(fn) {
    fn();
}
var childs = [];

function startWorker(handle) {
    var debug = isDebug();
    for (var i = 0; i < self.clusterConfig.workerno; i++) {
        var c = null;
        if (debug) {
            c = cp.fork(WORKER_PATH, {execArgv: [ '--debug=' + (process.debugPort + i + 1) ]});
        } else {
            c = cp.fork(WORKER_PATH);
        }
        c.send({"server": true, "nodeId": i, "topoConfig":self.topoConfig,"clusterConfig": self.clusterConfig}, handle, { track: false, process: false });

        c.onUnexpectedExit = function (code, signal) {
            console.log("Child process terminated with code: " + code);
            process.exit(1);
        }
        c.on("exit", c.onUnexpectedExit);
        c.shutdown = function () {
            // Get rid of the exit listener since this is a planned exit.
            this.removeListener("exit", this.onUnexpectedExit);
            this.kill("SIGTERM");
        }
        childs.push(c);
    }
    /*
     setInterval(function(){
     inspect(childMng.getStatus());
     childMng.updateStatus();
     },WORKER_HEART_BEAT);
     */
    function isDebug() {
        for (var i = 0; i < process.execArgv.length; i++) {
            if (process.execArgv[i].indexOf("--debug") == 0) {
                return true;
            }
        }
        return false;
    }
}
var exitTimer = null;
function aboutExit() {
    console.log("exit");
    if (exitTimer) return;
    exitTimer = setTimeout(function () {
        output('master exit...');
        process.exit(0);
    }, GRACE_EXIT_TIME);
}
function startServer() {
    var tcpServer = net.createServer();
    tcpServer.listen(self.clusterConfig.port, self.clusterConfig.ip, function () {
        startWorker(tcpServer._handle);
        tcpServer.close();
    });
}

void main(function () {
    var sysconfig = utils.parseCommand();
    if (sysconfig.clusterConfig) {
        self.PORT = sysconfig.clusterConfig.port;
        self.WORKER_NUMBER = sysconfig.clusterConfig.workerno;
    } else {
        output('cluster :' + program.clusterName + ' not in topo config!');
        return false;
    }

    self.clusterConfig = sysconfig.clusterConfig;
    self.topoConfig = sysconfig.topoConfig;

    if (sysconfig.clusterConfig) {
        startServer();
        output('master is running...');
        process.on('SIGINT', aboutExit);
        process.on('SIGTERM', aboutExit);
        process.once("exit", function () {
            childs.forEach(function (c) {
                c.shutdown();
            })
        });
        process.once("uncaughtException", function (error) {
            // If this was the last of the listeners, then shut down the child and rethrow.
            // Our assumption here is that any other code listening for an uncaught
            // exception is going to do the sensible thing and call process.exit().
            if (process.listeners("uncaughtException").length === 0) {
                childs.forEach(function (c) {
                    c.shutdown();
                });
                throw error;
            }
        });


    } else {
        output('master start fail...');
    }
});