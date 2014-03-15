var module = angular.module('controllers.filters', []);

const MAX_MESSAGES = 100;

module.controller('controllers::Filters', ['$scope', 'services::Filters', function(scope, filters) {
    scope.filters = filters.filters;
    scope.current_filter = filters.current;
    scope.new_filter = "";

    scope.submit = function() {
        if (scope.new_filter != "")
            filters.add(scope.new_filter);
    };

    scope.select = function(filter) {
        filters.select(filter);
    };

    scope.remove = function(filter) {
        filters.remove(filter);
    }

    scope.newFilterKeyPressed = function(event) {
        if (event.keyCode == 13)
            scope.submit();
    }

    filters.on('change', function() {
        scope.current_filter = filters.current || "";
    })
}]);