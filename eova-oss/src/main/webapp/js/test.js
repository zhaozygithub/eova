var testApp = angular.module('testApp',['ngRoute','testController']);
testApp.config(function($routeProvider){
	$routeProvider.
	when('/',{templateUrl:'a.html',controller:'test'}).
	otherwise({redirectTo:'/'})
})