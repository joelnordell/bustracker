var _ = require('underscore');
var qs = require('querystring');
var http = require('http');
var xml2js = require('xml2js');
var sprintf = require('sprintf').sprintf;
var strptime = require('micro-strptime').strptime;

function BusTracker(key) {
    this.options = {
        host: 'www.ctabustracker.com',
        port: 80,
        path: '/bustime/api/v1/',
        method: 'GET'
    };
    this.params = {
        key: key
    };
}
BusTracker.prototype.http_error = function(e) {
    console.log("HTTP error: " + e.message);
    process.exit(1);
};
BusTracker.prototype.xml_error = function() {
    console.log("Error parsing XML response.");
    process.exit(1);
};
BusTracker.prototype.parse_time = function(tstr) {
    return strptime(""+tstr, '%Y%m%d %H:%M:%S');
};
BusTracker.prototype.do_request = function(cmd, _params, field, cb, error) {
    var options = _.clone(this.options);
    var params = _.clone(this.params);
    _.extend(params, _params);
    options.path = options.path + cmd + "?" + qs.stringify(params);
    var result = { body: "" };
    http.request(options, function(res) {
        res.on('data', function(chunk) {
            result.body += chunk;
        }).on('end', function() {
            new xml2js.Parser().parseString(result.body, function(err, result) {
                if (err) {
                    this.xml_error();
                } else {
                    var response = result['bustime-response'];
                    if (response.error) {
                      _.each(response.error, function(e) {
                          error(e.msg[0]);
                      });
                    } else {
                      _.each(response[field], cb);
                    }
                }
            });
        });
    }).on('error', this.http_error).end();
};
BusTracker.prototype.get_time = function(cb) {
    this.do_request("gettime", {}, "tm", function(tm) {
        if (cb) {
            cb(tm);
        } else {
            console.log("Time: " + tm);
        }
    }, function(err) {
        console.log("Error: " + err);
    });
};
BusTracker.prototype.get_routes = function(cb) {
    this.do_request("getroutes", {}, "route", function(r) {
        if (cb) {
            cb(r.rt[0], r.rtnm[0], false);
        } else {
            console.log(sprintf("%6s: %s", r.rt[0], r.rtnm[0]));
        }
    }, function(err) {
        if (cb) {
            cb(null, null, err);
        } else {
            console.log("Error: " + err);
        }
    });
}
BusTracker.prototype.get_directions = function(rt, cb) {
    this.do_request("getdirections", { rt: rt }, "dir", function(dir) {
        if (cb) {
        } else {
        console.log(dir);
        }
    }, function(err) {
        if (cb) {
        } else {
        console.log("Error: " + err);
        }
    });
}
BusTracker.prototype.get_stops = function(rt, dir, cb) {
    this.do_request("getstops", { rt: rt, dir: dir + " Bound" }, "stop", function(stop) {
        if (cb) {
        } else {
            console.log(sprintf("%6s: %s", stop.stpid[0], stop.stpnm[0]));
        }
    }, function(err) {
        if (cb) {
        } else {
            console.log("Error: " + err);
        }
    });
}
BusTracker.prototype.get_predictions = function(rt, dir, stpid, cb) {
    var self = this;
    this.get_time(function(tm) {
        var now = strptime(""+tm, '%Y%m%d %H:%M');
        self.do_request("getpredictions", { rt: rt, dir: dir + " Bound", stpid: stpid }, "prd", function(prd) {
            var prdtm = strptime(""+prd.prdtm, '%Y%m%d %H:%M');
            var minutes = Math.floor( (prdtm.valueOf() - now.valueOf()) / 60000 );
            if (cb) {
                cb(minutes);
            } else {
                console.log("There will be a bus arriving in " + minutes + " minute" + (minutes==1 ? "":"s") + ".");
            }
        }, function(err) {
            if (cb) {
            } else {
                console.log("Error: " + err);
            }
        });
    });
}

module.exports = BusTracker;

