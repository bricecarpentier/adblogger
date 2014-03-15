
var util = require('util'),
    events = require('events');

var adb = require('adbkit'),
    async = require('async');

var module = angular.module('services.adb', []);


/*****************************************************************************
 *                                  DEVICES                                  *
 *****************************************************************************/

function Devices() {
    var self = this;

    this.client = adb.createClient();
    this.devices = [];

    this.client
        .listDevices()
        .then(function(devices) {
            self.devices = devices;
            async.each(devices, self._fetchModel.bind(self), function() {
                self.emit('change');
            })
        });

    this.client
        .trackDevices()
        .then(function(tracker) {
            tracker.on('add', function(device) {
                if (!device) return;

                for (var i=0, l=self.devices.length ; i<l ; i++) {
                    var current = self.devices[i];
                    if (!current) continue;
                    if (current.id == device.id) break;
                }

                if (i>=l) {
                    self._fetchModel(device, function() {
                        self.devices.push(device);
                        self.emit('change');
                    });
                }
            });
            tracker.on('remove', function(device) {
                if (!device) return;

                for (var i=0, l=self.devices.length ; i<l ; i++) {
                    var current = self.devices[i];
                    if (!current) continue;
                    if (current.id == device.id) break;
                }

                if (i<l) {
                    self.devices.splice(i, 1);
                    self.emit('change');
                }
            });
            tracker.on('end', function() {
                self.devices = [];
                self.emit('change');
            });
        })
        .catch(function(err) {
            console.log(err);
        });
};

util.inherits(Devices, events.EventEmitter);

Devices.prototype._fetchModel = function fetchModel(device, callback) {
    this.client.getProperties(device.id, function(err, properties) {
        if (!err)
            device.model = properties['ro.product.model'];

        callback();
    });
}

Devices.prototype.list = function listDevices() {
    return this.devices;
};

module.factory('services::Devices', function() {
	return new Devices();
});

/*****************************************************************************
 *                                  LOGCAT                                   *
 *****************************************************************************/

function Logcat() {
    var self = this;

    self.logcats = {};
    self.devicesService = new Devices();
    self.client = adb.createClient();

    self.devicesService.on('change', function() {
        var devices = self.devicesService.list();

        for (var i=0, l=devices.length ; i<l ; i++) {
            var device = devices[i];
            if (!self.logcats.hasOwnProperty(device.id)) {
                self.logcats[device.id] = null;
                self.client.openLogcat(device.id)
                           .then(function(logcat) {
                    logcat.on('entry', function(entry) {
                        entry.device = device.id;
                        self.emit('entry', entry);
                    });
                    self.logcats[device.id] = logcat;
                });
            }
        }
    })
};

util.inherits(Logcat, events.EventEmitter);

module.factory('services::Logcat', function() {
    return new Logcat();
});