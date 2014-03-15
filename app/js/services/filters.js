var events = require('events'),
    util   = require('util');

var module = angular.module('services.filters', []);

function Filters() {
    var self = this;

    var o = localStorage.filters ? JSON.parse(localStorage.filters) :  {filters: [], current: undefined};


    self.filters = o.filters || [];
    self.current = o.current || undefined;
};

util.inherits(Filters, events.EventEmitter);

Filters.prototype.add = function addFilter(filter) {
    if (this.filters.indexOf(filter) == -1) {
        this.filters.push(filter);
        this.serialize();
    }
};

Filters.prototype.remove = function(filter) {
    var index = this.filters.indexOf(filter);
    if (index != -1) {
        this.filters.splice(index, 1);
        this.serialize();
    }
};

Filters.prototype.select = function(filter) {
    console.log("[filters]", filter);
    if (!filter || (filter && this.filters.indexOf(filter) != -1)) {
        this.current = filter;
        this.serialize();
        this.emit('change');
    }
};

Filters.prototype.serialize = function() {
    var o = {
        filters: this.filters,
        current: this.current
    };
    localStorage.filters = JSON.stringify(o);
};

module.factory("services::Filters", function() {
    return new Filters();
});