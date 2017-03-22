var formApp = angular.module('formApp',['ngRoute','validation','validation.rule']);
formApp.controller('formCtrl',function($scope,$http){
	$http.get('data/form.php').success(function(data){
		$scope.formlist = data;
	});
	$scope.formData = {};
});
formApp.directive('ueditor', function() {
    return {
        require : '?ngModel',
        link : function(scope, element, attrs, ngModel) {
        	var id = element.attr('id');
            var ueditor = UM.getEditor(id);
            if (!ngModel) {
                return;
            }
           
        }
    };
});
angular.module('fileApp.directives',[]).directive('fileDirective', function() {
    return {
		restrict:'A',
		scope:{
			done:'&',
			progress:'&'
		},
		link:function(scope,element,attrs){
			var optiosObj = {
				dataType:'json'
			};
			if(scope.done){
				optionsObj.done = function(){
					$scope.$apply(function(){
						scope.done({e:e,data:data});
					});
				};
			}
			if(scope.progress){
				optionsObj.progress = function(e,data){
					scope.$apply(function(){
						scope.progress({e:e,data:data});
					});
				}
			}
			
			element.fileupload(optionsObj);
		}
	};
});
var fileApp = angular.module('fileApp',['fileApp.directives']);
fileApp.controller('fileCtrl',function($scope){
	$scope.uploadFinished = function(e,data){
		console.log('we just finished uploading this pic...');
	}
});
 





