(function () {
    'use strict';

    angular.module('NarrowItDownApp', [])
    .controller('NarrowItDownController', NarrowItDownController)
    .service('MenuSearchService', MenuSearchService)
    .directive('foundItems', FoundItemsDirective);

    NarrowItDownController.$inject = ['MenuSearchService'];
    function NarrowItDownController(MenuSearchService) {
        var narrowCtrl = this;
        narrowCtrl.searchTerm = '';
        narrowCtrl.found = [];

        narrowCtrl.narrowItDown = function () {
            if (narrowCtrl.searchTerm.trim() === '') {
                narrowCtrl.found = [];
                return;
            }

            MenuSearchService.getMatchedMenuItems(narrowCtrl.searchTerm)
            .then(function (foundItems) {
                narrowCtrl.found = foundItems;
            })
            .catch(function (error) {
                console.error('Error:', error);
            });
        };

        narrowCtrl.removeItem = function (index) {
            narrowCtrl.found.splice(index, 1);
        };
    }

    MenuSearchService.$inject = ['$http'];
    function MenuSearchService($http) {
        var service = this;

        service.getMatchedMenuItems = function (searchTerm) {
            return $http({
                method: 'GET',
                url: 'https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json'
            }).then(function (response) {
                var foundItems = [];
                var items = response.data;

                console.log("Response data:", items);

                // Handle different response structures
                if (items && items.menu_items && Array.isArray(items.menu_items)) {
                    items = items.menu_items;
                } else if (items && Array.isArray(items)) {
                    // items is already the array
                } else {
                    console.error('Unexpected response structure:', items);
                    return [];
                }

                for (var i = 0; i < items.length; i++) {
                    var description = items[i].description;
                    if (description && description.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
                        foundItems.push(items[i]);
                    }
                }

                return foundItems;
            }).catch(function (error) {
                console.error('Error in fetching menu items:', error);
                return [];
            });
        };
    }

    function FoundItemsDirective() {
        var ddo = {
            templateUrl: 'found-items.html',
            scope: {
                items: '<',
                onRemove: '&'
            },
            controller: FoundItemsDirectiveController,
            controllerAs: 'ctrl',
            bindToController: true
        };
        return ddo;
    }

    function FoundItemsDirectiveController() {
        var ctrl = this;
    }
})();
