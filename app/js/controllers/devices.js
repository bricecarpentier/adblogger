var module = angular.module('controllers.devices', []);

module.controller('controllers::Devices', ['$scope', 'services::Devices', function(scope, adb) {
    scope.devices = adb.list();

    adb.on('change', function() {
        scope.$apply(function() {
            scope.devices = adb.list();
        })
    })
}]);