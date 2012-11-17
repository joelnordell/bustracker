var program = require('commander');
//var http = require('http');
//var _ = require('underscore');
//var qs = require('querystring');
var fs = require('fs');
var util = require('util');
//var xml2js = require('xml2js');
//var sprintf = require('sprintf').sprintf;
//var strptime = require('micro-strptime').strptime;
var BusTracker = require('./bustracker');

// Read config file
try {
    var config = JSON.parse(fs.readFileSync(__dirname + "/../etc/config.json", 'ascii'));
} catch (e) {
    console.log("Error reading config file: " + e.message);
    process.exit(1);
}

// Create main API object
var bt = new BusTracker(config.apikey);

// Parse options
program
  .version('0.0.1')
  .option('-r, --route [routeid]', 'specify bus route')
  .option('-d, --direction [direction]', 'specify route direction')
  .option('-s, --stop [stopid]', 'specify bus stop')
  .parse(process.argv);

if (!program.route) {
    bt.get_routes();
} else if (!program.direction) {
    bt.get_directions(program.route);
} else if (!program.stop) {
    bt.get_stops(program.route, program.direction.split(" ")[0]);
} else {
    bt.get_predictions(program.route, program.direction.split(" ")[0], program.stop);
}

