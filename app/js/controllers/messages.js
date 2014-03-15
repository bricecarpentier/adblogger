var module = angular.module('controllers.messages', []);

const MAX_MESSAGES = 100;

module.controller('controllers::Messages', ['$scope', 'services::Logcat', 'services::Filters', function(scope, messages, filters) {
    var messageList = [];
    scope.messages = [];

    var newMessages = [];
    messages.on('entry', function(message) {
        newMessages.push(message);
    });

    filters.on('change', function() {
        update(messageList);
    });

    function update(messageList) {
        scope.messages = messageList.filter(function(item) {
            if (!filters.current) return true;

            return item.message.indexOf(filters.current) != -1;
        });

        if (scope.messages.length > MAX_MESSAGES)
            scope.messages.length = MAX_MESSAGES;
    };

    setInterval(function() {
        if (newMessages.length) {
            scope.$apply(function() {
                messageList = newMessages.reverse()
                                         .concat(messageList)
                newMessages = [];

                update(messageList);
            })
        }
    }, 100);

}]);