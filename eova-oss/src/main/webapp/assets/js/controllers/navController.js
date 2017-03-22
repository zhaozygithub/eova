var indexApp = angular.module('indexApp', ['ngRoute']);
indexApp.controller('navCtrl', function($scope, $http) {
	$http.get("/system/menu/menulist").success(function(data) {
		if (data.status == 200) {
			$scope.navs = data.data;
			$scope.admin = $scope.navs.admin;
			$scope.selectedRow = 0;
			$scope.menus2 = $scope.navs[0]['menus2'];
			$scope.GetNavChild = function(row) {
				if(row==0){
					location.reload();
					return false;
				}
				$scope.selectedRow = row;
				$scope.menus2 = $scope.navs[row]['menus2'];
			}
			$scope.GetNavChild1 = function(row1) {
				console.log(row1);
				$scope.selectedRow1 = row1;
			}
			$scope.GetNavChild2 = function(row2) {
				$scope.selectedRow2 = row2;
			}
		} else {
			alert(data.description);
		}

	})
	$http.get('/system/index/tododata').success(function(_data) {
        $scope.backlog = _data.data;
    });
})

indexApp.directive('iframeUrl', function($injector) {
    return {
        scope: {
            iframeUrl: '=?'
        },
        restrict: 'A',
        link: function(scope, elm, attrs, ctrl) {
            elm.on('click', function() {
                $('#iframe_box').attr('src', scope.iframeUrl);
            });
        }
    }
});