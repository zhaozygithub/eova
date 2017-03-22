var indexApp = angular.module('indexApp', ['ngRoute']);

indexApp.factory('postUrl', ['$http', function($http) {
     var doRequest = function(url, data) {
         return $http({
             method: 'post',
             url: url,
             data: data ? $.param(data) : '',
             headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
             }
         });
     }
     return {
         events: function(url, data) {
             return doRequest(url, data);
         }
     }
 }]);
indexApp.filter('judge', function() {
    return function(t, d) {
        if (d === undefined)
            d = 0;
        if (t === undefined || t === null)
            t = d;
        return t;
    }
});
indexApp.controller('navCtrl', function($scope, $http) {
	$http.get("system/menu/menulist").success(function(data) {
		if (data.status == 200) {
			$scope.navs = data.data.menus;
			$scope.admin = data.data.user;
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
			if(typeof(data.description) != "undefined")
			alert(data.description);
		}

	});

	

})
indexApp.controller('todoCtrl', ['$scope','$http', function($scope,$http){
	$http.get('/system/main/tododata').success(function(_data) {
        $scope.backlog = _data.data;
    });
}]);
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

indexApp.controller('countCtrl', function($scope, $http,postUrl) {
     $('.date').datepicker({
            autoclose: true,
            todayHighlight: true,
            language: 'zh-CN'
        });
     $scope.countData={};
      $scope.ermsg = '';
     $scope.searchForm=function(){
     	$scope.ermsg = "";
        postUrl.events('finance/count/allCount',$scope.countData).success(function(_data) {
        	if(_data.status == "200"){
        		$scope.allCount = _data.data;
        	}else{
                $scope.ermsg = _data.description;
        		//layer.msg(_data.description, 1, 2);
        	}
        });
        postUrl.events('finance/count/loanCount',$scope.countData).success(function(_data) {
            $scope.loanCount = _data.data;
        });
        postUrl.events('finance/count/tenderCount',$scope.countData).success(function(_data) {
            $scope.tenderCount = _data.data;
        });
        postUrl.events('finance/count/userCount',$scope.countData).success(function(_data) {
            $scope.userCount = _data.data;
        });
         };
         
    $http.post('finance/count/allCount').success(function(_data) {
        $scope.allCount = _data.data;
    });
    $http.post('finance/count/loanCount').success(function(_data) {
        $scope.loanCount = _data.data;
    });
    $http.post('finance/count/tenderCount').success(function(_data) {
        $scope.tenderCount = _data.data;
    });
    $http.post('finance/count/userCount').success(function(_data) {
        $scope.userCount = _data.data;
    });
    $http.post('finance/count/allYearMonthList').success(function(_data) {
        $scope.yearList = _data.yearList;
        $scope.monthList = _data.monthList;
    });
});

indexApp.controller('newCountCtrl', function($scope, $http, postUrl) {
    $scope.countData={};
   $scope.ermsg="";
   $scope.selectChange = function(name, val) {
            $scope.countData[name] = '';
            $scope.countData.type = val;
        };
	$scope.searchForm=function(){
		$scope.ermsg = "";
        postUrl.events('finance/count/newCount',$scope.countData).success(function(_data) {
             if(_data.status == "200"){
         		$scope.newCount = _data.data;
         	}else{
         		$scope.ermsg = _data.description;
         	}
         });
        
        postUrl.events('finance/count/riseRate',$scope.countData).success(function(_data) {
            if(_data.status == "200"){
        		$scope.riseRate = _data.data;
        	}else{
        		$scope.ermsg = _data.description;
        	}
        });
    };
     $http.post('finance/count/newCount').success(function(_data) {
        if(_data.status == "200"){
            $scope.newCount = _data.data;
        }else{
            layer.msg(_data.description, 1, 2);
        }
    });
    $http.post('finance/count/riseRate').success(function(_data) {
        if(_data.status == "200"){
    		$scope.riseRate = _data.data;
    	}else{
    		layer.msg(_data.description, 1, 2);
    	}
    });
    
    $http.post('finance/count/yearMonthList').success(function(_data) {
        $scope.yearList = _data.yearList;
        $scope.monthList = _data.monthList;
    });
});

indexApp.directive('navList', function($injector) {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs, ctrl) {
            var $timeout = $injector.get('$timeout');
            scope.$watch(attrs.navList, function(newValue, oleValue) {
                //scope.$eval(attrs.navStatus) == 1 (系统首页不触发)
                if (newValue && scope.$eval(attrs.navStatus) != 1) {
                    $timeout(function() {
                        $(elm).trigger('click');
                        var than = $(elm).siblings('.submenu').find('.dropdown-toggle').eq(0);
                        $(than).trigger('click');
                    })
                }
            });
        }
    };
    });
//存证统计
indexApp.controller('certificatefeeCountCtrl', function($scope, $http) { 
	$http.post('finance/certificatefee/count').success(function(_data) {
         if(_data.status == "200"){
     		$scope.countTotalMap = _data.data;
     	}else{
     		layer.msg(_data.description, 1, 2);
     	}
     });
	
	});



