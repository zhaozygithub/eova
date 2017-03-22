var themes = "data"
angular.module("navFactory",[])
		.factory("navlist",function($http){
			return {
				list:function(callback){
					$http({
						method:"get",
						url:"navlist.json",
						cache:true
					}).success(callback);
				}
			}
		})