var navApp = angular.module('navApp',['ngRoute','navController']);
navApp.config(function($routeProvider){
	$routeProvider.
	when('/',{templateUrl:"index.html",controller:'navlist'}).
	otherwise({redirectTo:'/'})
})