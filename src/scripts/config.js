'use strict';
angular.module("newsFeedApp")
  .config(function($stateProvider, $urlRouterProvider, $locationProvider){
    let homeState = {
        name: 'news',
        url: '/news',
        templateUrl : 'views/main.html',
        controller: 'MainController as mc'
      };
    
    $urlRouterProvider.otherwise(function($injector){
        $injector.get('$state').go('news');
    });
    $stateProvider.state(homeState);
    $locationProvider.html5Mode(true);
  });