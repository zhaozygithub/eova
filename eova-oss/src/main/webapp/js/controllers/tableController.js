(function() {
	var tableApp = angular.module('tableApp', ['ngRoute', 'validation',
			'validation.rule', 'pageApp', 'dyDir', 'filters']);
	tableApp.filter('to_trusted', ['$sce', function($sce) {
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}]);
	tableApp.factory('postUrl', ['$http', function($http) {
		var doRequest = function(url, data) {
			return $http({
				method : 'post',
				url : url,
				data : data ? $.param(data) : '',
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				}
			});
		}
		return {
			events : function(url, data) {
				return doRequest(url, data);
			}
		}
	}]);
	tableApp.controller('tableCtrl', function($scope, $rootScope, $http,
			$location, postUrl) {
		$http.post(window.location.href).success(function(_data) {
			$scope.tableHlist = _data.data.TableHeader;
			$scope.tableBUrl = _data.data.TableB;
			$scope.CheckId = false;
			$scope.loading = false; // 设置加载loading值

			$scope.CheckId = _data.data.Check ? true : false;
			$scope.CheckIName = _data.data.Check ? _data.data.Check : 'id';
			$scope.parameter = $location.search() || '';
			$scope.setsSrcbox(_data); // 设置搜索框
			postUrl.events($scope.tableBUrl, $scope.parameter)
					.success(function(data) {
						$scope.loading = true; // 设置加载loading值
						if (data.status == '200') {
							$scope.tableB = data.data.items;
							$scope.Total = data.data.total_items; // 总条数
							$scope.Pages = data.data.total_pages; // 总页数
							$scope.Epage = data.data.epage; // 每页条数
							if (!$scope.Epage) {
								$scope.Epage = 10; // 默认每页条数
							}
							$scope.pageHide = true;
							$scope.setPages();
						} else {
							$.layer({
								area : ['auto', 'auto'],
								title : '提示',
								closeBtn : false,
								dialog : {
									msg : data.description,
									type : 8
								}
							});
						}
					});
		});

		// 设置全选框
		$scope.checkChange = function() {
			$scope.bec = !$scope.bec;
			if ($scope.bec) {
				$scope.Checklist.id = $scope.tableB.map(function(item) {
					return item[$scope.CheckIName];
				});
				var arrya = $scope.Checklist.id, keyLen = arrya.length;
				for (var i = 0; i < keyLen; i++) {
					$scope.Checklist.on[arrya[i]] = true;
				}
			} else {
				$scope.Checklist.id = [];
				$scope.Checklist.on = [];
			}
		}

		// 设置复选行选中
		$scope.Checklist = {
			id : [],
			on : []
		};

		$scope.checkBtn = function(val, $event) {
			$event.stopPropagation();
			if ($scope.CheckId) {
				var array = $scope.Checklist.id, key = array.indexOf(val), keyLen = array.length;
				if (key == -1) {
					$scope.Checklist.on[val] = true;
					array.push(val);
				} else {
					var keyC = [];
					for (var i = 0; i < keyLen; i++) {
						if (array[i] != val) {
							keyC.push(array[i]);
						} else {
							$scope.Checklist.on[val] = false;
						}
					}
					$scope.Checklist.id = keyC;
				}
			}
		};

		// 设置单选行选中
		$scope.radioBtn = function(val, $event) {
			$event.stopPropagation();
			if ($scope.CheckId) {
				$scope.radioList = [];
				$scope.radioList[val] = !$scope.radioList[val];
			} else {
				return false;
			}
		};

		// 设置搜索框
		$scope.setsSrcbox = function(_data) {
			// 判断是否有搜索框
			$scope.IsSearch = false;
			$scope.tableHform = _data.data.Search;
			if ($scope.tableHform && $scope.tableHform.length > 0) {
				$scope.IsSearch = true;
			}
			// 判断是否有工具栏
			$scope.IsTool = false;
			$scope.ToolList = _data.data.Tool;
			if ($scope.ToolList && $scope.ToolList.length > 0) {
				$scope.IsTool = true;
			}
			$scope.param = $location.search() || '';
			angular.forEach($scope.param, function(v, k) {
				$scope.SpageData[k] = parseInt(v) || v;
			});
		};

		// 设置总页数，并在前台显示页码
		$scope.setPages = function() {
			$scope.pageItem = [];
			var len = $scope.Pages;
			for (var i = 0; i < len; i++) {
				if (i < $scope.pageData.current_page + 5
						&& i > $scope.pageData.current_page - 7)
					$scope.pageItem.push(i);

			}
		}

		$scope.pageData = {};
		$scope.SpageData = {};
		$scope.pageData.current_page = 1;
		$scope.getPageData = function() {
			$http({
				method : 'POST',
				url : $scope.tableBUrl,
				data : $.param($scope.pageData), // pass in data as strings
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				},
				cache : true
			}).success(function(data) {
				if (data.status == '200') {
					$scope.tableB = data.data.items;
					$scope.Pages = data.data.total_pages;
					$scope.Total = data.data.total_items;
					$scope.setPages();
					$scope.pageHide = true; // 重新渲染指令
				} else {
					layer.msg(data.description, 1, 2);
				}
			});
		}
		$scope.cachePageData = {} // 搜索数据的缓存
		$scope.gotoPage = function(page) {
			if (page > 0 && page <= $scope.Pages) {
				$scope.pageData.current_page = page;
			} else {
				$scope.pageData.current_page = $scope.Pages;
			}
			$scope.getPageData();
		}
		$scope.srcData = function() {
			$scope.pageData = $scope.SpageData;
			$scope.pageHide = false;
			$scope.getPageData();
		};

		// 添加列表
		$scope.addList = function(url, title) {
			var ck = $('input[name="ck"]:checked');
			$.layer({
				type : 2,
				title : title,
				shadeClose : true,
				maxmin : true,
				fix : false,
				area : ['800px', 500],
				iframe : {
					src : url
				}
			});
		}

		// 删除列表
		$scope.delList = function(url, title, name) {
			var ck = $('input[name="ck"]:checked');
			var cklen = ck.length;
			var ckid = [];
			if (cklen < 1) {
				layer.msg('请先选择要' + name + '的选项！', 1, 5);
				return false;
			} else {
				for (var i = 0; i < cklen; i++) {
					ckid.push(ck.eq(i).attr('id'));
				}
				ckid = ckid.join(',');
			}
			var dis_status = false; //初始化按钮状态
			$.layer({
				area : ['auto', 'auto'],
				title : title,
				dialog : {
					msg : '确定是否' + name + 'id为 ' + ckid + ' 的这些选项？',
					btns : 2,
					type : 4,
					btn : ['确定', '取消'],
					yes : function() {						
						if(dis_status){   //判断是否点击过按钮(点过就退出不执行之后的)
                    		return false;
                    	}
                    	dis_status = true;   //按钮状态更改
						$.ajax({
							type : 'post',
							url : url,
							data : {
								'delid' : ckid
							},
							dataType : 'json',
							success : function(results) {
								if (results.status == 200) {
									layer.msg(results.description, 1, 1,
											function() {
												$scope.getPageData();
											});
								} else {
									layer.msg(results.description, 1, 2,
											function() {
												$scope.getPageData();
											});
								}
							}
						})
					},
					no : function() {

					}
				}
			});
		}

		// 修改列表
		$scope.editList = function(url, title, name, check) {
			var ck = $('input[name="ck"]:checked');
			var cklen = ck.length;
			if (cklen < 1) {
				layer.msg('请先选择要' + name + '的选项！', 1);
				return false;
			} else if (cklen > 1) {
				layer.msg(name + '的选项只能为1个！', 1);
				return false;
			} else {
				function editTodo(editid) {
					$.layer({
						type : 2,
						title : title,
						shadeClose : true,
						maxmin : true,
						fix : false,
						area : ['800px', 500],
						iframe : {
							src : url + '&editid=' + editid
						}
					});
				}
				var editid = ck.attr('id');
				if (check == '1') {
					$.ajax({
						type : 'post',
						data : {
							id : editid,
							check : '1'
						},
						url : url + '&editid=' + editid,
						dataType : 'json',
						success : function(data) {
							if (data.status == 200) {
								editTodo(editid);
							} else {
								layer.msg(data.description, 2, 5);
							}
						}
					});
				} else {
					editTodo(editid);
				}
			}
		}

		// 查看协议
		$scope.viewProtocol = function(url, title) {
			var ck = $('input[name="ck"]:checked');
			var cklen = ck.length;
			if (cklen < 1) {
				layer.msg('请先选择要查看的选项！', 1);
				return false;
			} else if (cklen > 1) {
				layer.msg('查看的选项只能为1个！', 1);
				return false;
			} else {
				var editid = ck.attr('id');
				$.layer({
					type : 2,
					title : title,
					shadeClose : false,
					fix : false,
					area : [600, 470],
					iframe : {
						src : url + '?editid=' + editid
					}
				});
			}
		}

		// 查看列表
		$scope.lookList = function(url, title) {
			var ck = $('input[name="ck"]:checked');
			var cklen = ck.length;
			if (cklen < 1) {
				layer.msg('请先选择要查看的选项！', 1);
				return false;
			} else if (cklen > 1) {
				layer.msg('查看的选项只能为1个！', 1);
				return false;
			} else {
				var editid = ck.attr('id');
				$.layer({
					type : 2,
					title : title,
					shadeClose : true,
					maxmin : true,
					fix : false,
					area : ['800px', 500],
					iframe : {
						src : url + '&editid=' + editid
					}
				});
			}
		}

		// 导出数据，导出全部
		$scope.exportdata = function(url, title) {
			$.layer({
				area : ['auto', 'auto'],
				title : title,
				dialog : {
					msg : '确定是否导出数据？',
					btns : 2,
					type : 4,
					btn : ['确定', '取消'],
					yes : function() {
						window.location.href = url;
						layer.closeAll();
					},
					no : function() {

					}
				}
			});
		}

		// 导出数据，导出当前
		$scope.exportCurrent = function(url, title) {
			$.layer({
				area : ['auto', 'auto'],
				title : title,
				dialog : {
					msg : '确定是否导出当前数据？',
					btns : 2,
					type : 4,
					btn : ['确定', '取消'],
					yes : function() {
						var dataResult = "?";
						$.each($scope.SpageData, function(n, v) {
							dataResult += "&" + n + "=" + v;
						});
						window.location.href = url + dataResult;
						layer.closeAll();
					},
					no : function() {

					}
				}
			});
		}

		// 撤销数据
		$scope.cancel = function(url, title, check) {
			var ck = $('input[name="ck"]:checked');
			var cklen = ck.length;
			var ckid = [];
			if (cklen < 1) {
				layer.msg('请先选择要撤销的选项！', 1, 5);
				return false;
			} else if (cklen > 1) {
				layer.msg('撤销的选项只能为1个！', 1);
				return false;
			} else {
				for (var i = 0; i < cklen; i++) {
					ckid.push(ck.eq(i).attr('id'));
				}
				ckid = ckid.join(',');
			}
			var dis_status = false;
			$.layer({
				area : ['auto', 'auto'],
				title : title,
				dialog : {
					msg : '确定是否解绑id为 ' + ckid + ' 的这些选项？',
					btns : 2,
					type : 4,
					btn : ['确定', '取消'],
					yes : function() {
						if(dis_status){
                    		return false;
                    	}
                    	dis_status = true;
						$.ajax({
							type : 'post',
							url : url,
							data : {
								'delid' : ckid,
								'check' : check == '1' ? '1' : '-1'
							},
							dataType : 'json',
							success : function(results) {
								if (results.status == 200) {
									layer.msg(results.data, 1, 1, function() {
										$scope.getPageData();
									});
								} else {
									layer.msg(results.description, 1, 2,
											function() {
												$scope.getPageData();
											});
								}
							}
						})
					},
					no : function() {

					}
				}
			});
		}

		// 发送数据
		$scope.sendSms = function(url, title) {
			var ck = $('input[name="ck"]:checked');
			var cklen = ck.length;
			var ckid = [];
			if (cklen < 1) {
				layer.msg('请先选择要发送的选项！', 1, 5);
				return false;
			} else {
				for (var i = 0; i < cklen; i++) {
					ckid.push(ck.eq(i).attr('id'));
				}
				ckid = ckid.join(',');
			}
			var dis_status = false;
			$.layer({
				area : ['auto', 'auto'],
				title : title,
				dialog : {
					msg : '确定是否发送id为 ' + ckid + ' 的这些选项？',
					btns : 2,
					type : 4,
					btn : ['确定', '取消'],
					yes : function() {
						if(dis_status){
                    		return false;
                    	}
                    	dis_status = true;
						$.ajax({
							type : 'post',
							url : url,
							data : {
								'sendid' : ckid
							},
							dataType : 'json',
							success : function(results) {
								if (results.status == 200) {
									layer.msg(results.data, 1, 1, function() {
										$scope.getPageData();
									});
								} else {
									layer.msg(results.description, 1, 2,
											function() {
												$scope.getPageData();
											});
								}
							}
						})
					},
					no : function() {

					}
				}
			});
		}

		// 图片查看
		$scope.photoView = function(url, $event) {
			$event.stopPropagation();
			$.layer({
				type : 1, // 0-4的选择,（1代表page层）
				area : ['500px', 'auto'],
				border : [8, 0.3, '#000'], // 不显示边框
				title : [0],
				bgcolor : '#eee', // 设置层背景色
				page : {
					html : '<img src="' + url + '" width="500"/>'
				},
				shift : 'top' // 从上动画弹出
			});
		}

		// 修改列表跳转
		$scope.editListSkip = function(url, title, name) {
			var ck = $('input[name="ck"]:checked');
			var cklen = ck.length;
			if (cklen < 1) {
				layer.msg('请先选择要' + name + '的选项！', 1);
				return false;
			} else if (cklen > 1) {
				layer.msg(name + '的选项只能为1个！', 1);
				return false;
			} else {
				var editid = ck.attr('id');
				window.location.href = url + '&editid=' + editid;
			}
		}

		// 查看跳转
		$scope.lookListSkip = function(url, title) {
			var ck = $('input[name="ck"]:checked');
			var cklen = ck.length;
			if (cklen < 1) {
				layer.msg('请先选择要查看的选项！', 1);
				return false;
			} else if (cklen > 1) {
				layer.msg('查看的选项只能为1个！', 1);
				return false;
			} else {
				var editid = ck.attr('id');
				window.location.href = url + '&editid=' + editid;
			}
		}

		// 查看跳转打开新标签页面
		$scope.tagSkip = function(url) {
			window.location.href = url;
		}
		// 更新微信菜单
		$scope.updateWechat = function(url, title) {
			$.layer({
				area : ['auto', 'auto'],
				title : title,
				dialog : {
					msg : '确定是否更新当前列表数据？',
					btns : 2,
					type : 4,
					btn : ['确定', '取消'],
					yes : function() {
						$.ajax({
							type : 'post',
							url : url,
							dataType : 'json',
							success : function(results) {
								if (results.status == 200) {
									layer.msg(results.description, 1, 1,
											function() {
												$scope.getPageData();
											});
								} else {
									layer.msg(results.description, 1, 2,
											function() {
												$scope.getPageData();
											});
								}
							}
						})
					},
					no : function() {

					}
				}
			});
		}
	});

	// 编辑控制器
	tableApp.controller('EditCtrl', ['$scope', '$rootScope', '$http',
			'$injector', function($scope, $rootScope, $http, $injector) {
				var url = window.location.href, urlattr = url.split('='), editid = {
					"editid" : urlattr[urlattr.length - 1]
				};
				$http({
					method : 'post',
					url : url,
					headers : {
						'Content-Type' : 'application/x-www-form-urlencoded'
					}
				}).success(function(data) {
					$scope.formlist = data.data.FormFields; // 渲染页面用的数据
					$scope.subUrl = data.data.SubUrl; // 提交地址
					$scope.testUrl = data.data.testUrl;
					$scope.jumpUrl = data.data.jumpUrl ? data.data.jumpUrl : "";
					$scope.webNotice = data.data.webNotice
							? data.data.webNotice
							: "";
					$scope.CityField = data.data.CityField
							? data.data.CityField
							: false;
					$scope.EformData = {};
					// 自定义按钮名称
					$scope.SubmitBtn = data.data.Submit
							? data.data.Submit
							: '保存';
					$scope.TestBtn = data.data.Test ? data.data.Test : '测试';
					// 控制‘保存’、‘取消’按钮的显示隐藏判断
					$scope.btnShow = data.data.view ? false : true;
					$scope.cancelShow = data.data.cancelbtn ? false : true;
					$scope.reload = data.data.reload ? true : false;
					$scope.backSkip = data.data.backSkip ? true : false;
					// Get数据URL
					if (data.data.getDataUrl) {
						urlattr = data.data.getDataUrl.split('=');
						editid = {
							"editid" : urlattr[urlattr.length - 1]
						};
					}
					$scope.loading = true; // 设置加载loading值
					$http({
						method : 'post',
						url : url,
						data : $.param(editid),
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(_data) {
						if (_data.status == 200) {
							var initformdata = _data.data.FormData;
							$scope.EformData.editid = urlattr[urlattr.length
									- 1];
							if (initformdata) {
								for (var i = 0; i < initformdata.length; i++) {
									$scope.EformData[initformdata[i].name] = initformdata[i].value;
								}
								// 地区联动
								if ($scope.CityField) {
									$scope.cityData = {};
									$http.post('/common/public/getProvince')
											.success(function(_data) {
												$scope.cityData[0] = _data;
												$scope.cityChange = function(v,
														i, ask) {
													$scope.data = {};
													$scope.data.pid = v
															? v
															: '';
													$http({
														method : 'POST',
														url : '/common/public/getAreas',
														data : $
																.param($scope.data),
														headers : {
															'Content-Type' : 'application/x-www-form-urlencoded'
														},
														cache : true
													}).success(function(data) {
														$scope.cityData[i + 1] = data;
														if (!ask) {
															angular
																	.forEach(
																			$scope.CityField,
																			function(
																					value,
																					key) {
																				if (key > i) {
																					$scope.EformData[value] = ''; // 初始化
																				}
																			});
														}
													});
												}
												// 初始化数据
												angular.forEach(
														$scope.CityField,
														function(value, key) {
															$scope
																	.cityChange(
																			$scope.EformData[value],
																			key,
																			function() {
																				return $scope.EformData[value]
																						? true
																						: false;
																			});
														});
											});
								}
							}
						} else {
							$.layer({
								area : ['auto', 'auto'],
								title : '提示',
								closeBtn : false,
								dialog : {
									msg : _data.description,
									btns : 1,
									type : 7,
									btn : ['确定'],
									yes : function() {
										var index = parent.layer
												.getFrameIndex(window.name);
										parent.layer.close(index);
									}
								}
							});
						}
					});
					// 控制表单内容显示隐藏
					var hideAndShow = {
						init : function() {
							var that = this, l = $scope.formlist.length;
							for (var i = 0; i < l; i++) {
								if ($scope.formlist[i].haschild) {
									that.hideFn(i);
								}
							}
						},
						hideFn : function(i) {
							var n = "", m = "", lm = "";
							m = $scope.formlist[i].name;

							$.each($scope.formlist[i].options, function(n, e) {
								if ($scope.formlist[i].options[n].checkstatu) {
									$scope.EformData[m] = $scope.formlist[i].options[n].value;
									lm = $scope.formlist[i].options[n].childmark;
								}
							});
							for (var j in $scope.formlist) {
								if ($scope.formlist[j].parentname == m) {
									if ($scope.formlist[j].mark == lm) {
										$scope.formlist[j].hide = false;
									};
								}
							}

							$scope.$watch("EformData." + m + "", function() {
								$.each($scope.formlist[i].options, function(n,
										e) {
									if ($scope.EformData[m] == $scope.formlist[i].options[n].value) {
										lm = $scope.formlist[i].options[n].childmark;
									}
								});
								for (var k in $scope.formlist) {
									if ($scope.formlist[k].parentname == m) {
										if ($scope.formlist[k].mark == lm) {
											$scope.formlist[k].hide = false;
										} else {
											$scope.formlist[k].hide = true;
										};

									}
								}
							});

						}
					};
					hideAndShow.init();
				});
				$scope.submit = function() {
					var submitTxt = $scope.SubmitBtn;
					$scope.SubmitBtn = $scope.SubmitBtn + '中...';
					$scope.editDisForm = true; // 控制‘保存’或者‘提交’时防止重复操作
					$http({
						method : 'post',
						url : $scope.subUrl,
						data : $.param($scope.EformData),
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						if (data.status == 200) {
							if (data.popup) {
								parent.layer.closeAll();
							} else {
								layer.msg(data.description, 1, 1, function() {
									if ($scope.jumpUrl) {
										window.location.href = $scope.jumpUrl;
									} else {
										parent.location.reload();
										parent.layer.closeAll();
									}
								});
							}
						} else {
							$scope.SubmitBtn = submitTxt;
							$scope.editDisForm = false; // 释放重复操作控制
							var msg = data.description
									? data.description
									: "操作失败！";
							layer.msg(msg, 1, 5);
						}
					});
				}

				$scope.test = function() {
					var testTxt = $scope.testUrl;
					$scope.TestBtn = $scope.TestBtn + '中...';
					$scope.EditForm.$invalid = true;
					$http({
						method : 'post',
						url : $scope.testUrl,
						data : $.param($scope.EformData),
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						$scope.TestBtn = testTxt;
						$scope.EditForm.$invalid = false;
						if (data.status == 200) {
							layer.msg(data.description, 1, 1);
						} else {
							layer.msg(data.description, 1, 5);
						}
					});
				}

				$scope.authorizeAutoRepayment = function() {
					$http({
						method : 'post',
						url : '/trust/trust/hqbAutoRepay',
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						if (data.status == 200) {
							parent.$.layer({
								type : 1,
								title : '温馨提示',
								area : ['436px', '275px'],
								page : {
									url : '/finance/merchan/merchargeDialog'
								},
								close : function(index) {
									parent.$("#easypaysubmit").remove();
								}
							});
							parent.$('body').append(data.description.form);

						} else {
							var msg = data.description
									? data.description
									: "操作失败！";
							parent.layer.msg(msg, 1, 5);
						}
					});
				}

				$scope.cancel = function() {
					if ($scope.reload) {
						parent.location.reload();
					} else if ($scope.backSkip) {
						window.location.href = $scope.jumpUrl;
					}
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);
				}

				// 删除选项
				$scope.removeList = function(i, list) {
					var oldTodos = $scope.EformData[list], remove = oldTodos[i];
					$scope.EformData[list] = [];
					angular.forEach(oldTodos, function(todo) {
						if (todo != remove)
							$scope.EformData[list].push(todo);
					});
				};
			}]);

	// 添加控制器
	tableApp.controller('AddCtrl', ['$scope', '$rootScope', '$http',
			'$injector', function($scope, $rootScope, $http, $injector) {
				var url = window.location.href;
				$scope.btnShow = true; // 控制‘保存’、‘取消’按钮默认显示
				$http({
					method : 'post',
					url : url,
					headers : {
						'Content-Type' : 'application/x-www-form-urlencoded'
					}
				}).success(function(data) {
					$scope.formlist = data.data.FormFields; // 渲染页面用的数据
					$scope.subUrl = data.data.SubUrl; // 提交地址
					$scope.testUrl = data.data.testUrl;
					$scope.jumpUrl = data.data.jumpUrl ? data.data.jumpUrl : "";
					$scope.CityField = data.data.CityField
							? data.data.CityField
							: false;
					$scope.EformData = {};
					// 自定义名称
					if (data.data.Submit) {
						$scope.SubmitBtn = data.data.Submit;
					} else {
						$scope.SubmitBtn = '保存';
					}
					$scope.TestBtn = data.data.Test ? data.data.Test : "测试";
					// 控制‘保存’、‘取消’按钮的显示隐藏判断
					if (data.data.view) {
						$scope.btnShow = false;
					}
					// $scope.initformdata = data.data.FormData; //初始化页面的数据
					$scope.loading = true; // 设置加载loading值
					// 地区联动
					if ($scope.CityField) {
						$scope.cityData = {};
						$http.post('/common/public/getProvince')
								.success(function(_data) {
									$scope.cityData[0] = _data;
									$scope.cityChange = function(v, i, ask) {
										$scope.data = {};
										$scope.data.pid = v ? v : '';
										$http({
											method : 'POST',
											url : '/common/public/getAreas',
											data : $.param($scope.data),
											headers : {
												'Content-Type' : 'application/x-www-form-urlencoded'
											},
											cache : true
										}).success(function(data) {
											$scope.cityData[i + 1] = data;
											if (!ask) {
												angular.forEach(
														$scope.CityField,
														function(value, key) {
															if (key > i) {
																$scope.EformData[value] = ''; // 初始化
															}
														});
											}
										});
									}
									// 初始化数据
									angular.forEach($scope.CityField, function(
											value, key) {
										$scope.cityChange(
												$scope.EformData[value], key,
												function() {
													return $scope.EformData[value]
															? true
															: false;
												});
									});

								});
					}
					// 控制表单内容显示隐藏
					var hideAndShow = {
						init : function() {
							var that = this, l = $scope.formlist.length;
							for (var i = 0; i < l; i++) {
								if ($scope.formlist[i].haschild) {
									that.hideFn(i);
								}
							}
						},
						hideFn : function(i) {
							var n = "", m = "", lm = "";
							m = $scope.formlist[i].name;

							$.each($scope.formlist[i].options, function(n, e) {
								if ($scope.formlist[i].options[n].checkstatu) {
									$scope.EformData[m] = $scope.formlist[i].options[n].value;
									lm = $scope.formlist[i].options[n].childmark;
								}
							});
							for (var j in $scope.formlist) {
								if ($scope.formlist[j].parentname == m) {
									if ($scope.formlist[j].mark == lm) {
										$scope.formlist[j].hide = false;
									};
								}
							}

							$scope.$watch("EformData." + m + "", function() {
								$.each($scope.formlist[i].options, function(n,
										e) {
									if ($scope.EformData[m] == $scope.formlist[i].options[n].value) {
										lm = $scope.formlist[i].options[n].childmark;
									}
								});
								for (var k in $scope.formlist) {
									if ($scope.formlist[k].parentname == m) {
										if ($scope.formlist[k].mark == lm) {
											$scope.formlist[k].hide = false;
										} else {
											$scope.formlist[k].hide = true;
										};

									}
								}
							});

						}
					};
					hideAndShow.init();
				});
				
				$scope.submit = function() {
					var mulfile = $('input[name^="mulfile"]');
					var submitTxt = $scope.SubmitBtn;
					$scope.SubmitBtn = $scope.SubmitBtn + '中...';
					$scope.AddForm.$invalid = true; // 控制‘保存’或者‘提交’时防止重复操作
					if (mulfile.length > 0) {
						$scope.EformData.duoimage = [];
						for (var i = 0; i < mulfile.length; i++) {
							$scope.EformData.duoimage.push(mulfile.eq(i).val());
						}
					}
					$http({
						method : 'post',
						url : $scope.subUrl,
						data : $.param($scope.EformData),
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						if (data.status == 200) {
							layer.msg(data.description, 1, 1, function() {
								if ($scope.jumpUrl) {
									window.location.href = $scope.jumpUrl;
								} else {
									parent.location.reload();
									parent.layer.closeAll();
								}
							});
						} else {
							$scope.SubmitBtn = submitTxt;
							$scope.AddForm.$invalid = false; // 释放重复操作控制
							var msg = data.description
									? data.description
									: "操作失败！";
							layer.msg(msg, 1, 5);
						}
					});
				}

				$scope.test = function() {
					var mulfile = $('input[name^="mulfile"]');
					var testTxt = $scope.TestBtn;
					$scope.TestBtn = $scope.TestBtn + '中...';
					$scope.AddForm.$invalid = true;
					if (mulfile.length > 0) {
						$scope.EformData.duoimage = [];
						for (var i = 0; i < mulfile.length; i++) {
							$scope.EformData.duoimage.push(mulfile.eq(i).val());
						}
					}
					$http({
						method : 'post',
						url : $scope.testUrl,
						data : $.param($scope.EformData),
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						$scope.TestBtn = testTxt;
						$scope.AddForm.$invalid = false;
						if (data.status == 200) {
							layer.msg(data.description, 1, 1);
						} else {
							layer.msg(data.description, 1, 5);
						}
					});
				}

				$scope.cancel = function() {
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);

				}

				// 删除选项
				$scope.removeList = function(i, list) {
					var oldTodos = $scope.EformData[list], remove = oldTodos[i];
					$scope.EformData[list] = [];
					angular.forEach(oldTodos, function(todo) {
						if (todo != remove)
							$scope.EformData[list].push(todo);
					});
				};
			}]);

	// 编辑控制器
	tableApp.controller('BorrowCtrl', ['$scope', '$rootScope', '$http',
			'$injector', function($scope, $rootScope, $http, $injector) {
				var url = window.location.href, urlHost = window.location.protocol
						+ '//' + window.location.host + '/finance/fee/borrow', urlattr = url
						.split('='), editid = {
					"editid" : urlattr[urlattr.length - 1]
				};
				$scope.loading = true; // 设置加载loading值
				// tab切换控制
				$scope.setTabid = function(tabidValue) {
					$scope.tabid = tabidValue;
				};

				$scope.isSetid = function(tabidName) {
					return $scope.tabid === tabidName;
				};

				$scope.cancel = function() {
					window.location.href = 'finance/loanfee/list';
				}
			}]);

	// 编辑控制器
	tableApp.controller('CertificateFeeCtrl', ['$scope', '$rootScope', '$http',
			'$injector', function($scope, $rootScope, $http, $injector) {
				var url = window.location.href, urlHost = window.location.protocol
						+ '//'
						+ window.location.host
						+ '/finance/certificatefee/certificatefee', urlattr = url
						.split('='), editid = {
					"editid" : urlattr[urlattr.length - 1]
				};
				$scope.loading = true; // 设置加载loading值
				// tab切换控制
				$scope.setTabid = function(tabidValue) {
					$scope.tabid = tabidValue;
				};

				$scope.isSetid = function(tabidName) {
					return $scope.tabid === tabidName;
				};

				$scope.cancel = function() {
					window.location.href = urlHost;
				}
			}]);
	// tab切换控制
	tableApp.controller('tabCtrl', ['$scope', '$rootScope', '$http',
			'$injector', function($scope, $rootScope, $http, $injector) {
				$scope.setTabid = function(tabidValue) {
					$scope.tabid = tabidValue;
				};

				$scope.isSetid = function(tabidName) {
					return $scope.tabid === tabidName;
				};
			}]);

	// 查看控制器
	tableApp.controller('viewCtrl', ['$scope', '$rootScope', '$http',
			function($scope, $rootScope, $http) {
				$scope.loan = loanContent.loan;
				$scope.loanInfo = loanContent.loanInfo;
				$scope.extendInfoMap = loanContent.extendInfoMap;
				$scope.loanRepay = loanContent.loanRepay;
				$scope.loanRepayList = loanContent.loanRepayList;
				$scope.tenderList = loanContent.tenderList;
				$scope.blankInfo = loanContent.blankInfo;
				if (loanContent.company) {
					$scope.company = loanContent.company.company;
					$scope.loginDate = loanContent.company.loginDate;
				}
				if (loanContent.loanRoam) {
					$scope.loanRoam = loanContent.loanRoam;
				}
				$scope.attachList = loanContent.attachList;
				$scope.assessmentList = loanContent.assessmentList;
				$scope.pageInfo = pageInfo;
			}]);

	// 查看借款标图片包
	tableApp.controller('viewLoanPicGroupCtrl', ['$scope', '$rootScope', '$http',
			function($scope, $rootScope, $http) {
				$scope.loanPicGroups = loanPicGroups.total_pic_group;
				//1.背景调查 2.抵押物评估 3.实地考察 4.债权确立 5.抵押确立 6.合同监管 7.资金监督 8.动态风控
				if($scope.loanPicGroups!=null && $scope.loanPicGroups!=undefined){
					$scope.type_1 = $scope.loanPicGroups.type_1;
					$scope.type_2 = $scope.loanPicGroups.type_2;
					$scope.type_3 = $scope.loanPicGroups.type_3;
					$scope.type_4 = $scope.loanPicGroups.type_4;
					$scope.type_5 = $scope.loanPicGroups.type_5;
					$scope.type_6 = $scope.loanPicGroups.type_6;
					$scope.type_7 = $scope.loanPicGroups.type_7;
					$scope.type_8 = $scope.loanPicGroups.type_8;					
				}

				$scope.pageInfo = pageInfo;
			}]);
	
	// 担保公司查看控制器
	tableApp.controller('viewVouchCtrl', ['$scope', '$rootScope', '$http',
			function($scope, $rootScope, $http) {
				$scope.companyInfo = data.companyInfo;
				$scope.loginDate = data.loginDate;
				$scope.address = data.address;
				$scope.list = data.list;
			}]);

	// 添加借款标
	tableApp.controller('AddLoanCtrl', ['$scope', '$rootScope', '$http',
			'$injector', function($scope, $rootScope, $http, $injector) {
				$scope.catid = {};
				$scope.amountShow = false;// 控制信用额度的显示
				$scope.EformData = {};
				$scope.loan_info = loan_info;
				$scope.catid.category_id = $scope.loan_info.category_option[0].value;
				$scope.catid.borrow_use = $scope.loan_info.borrow_option[0].value;
				$scope.catid.deposit_certificate = $scope.loan_info.deposit_certificate[1].value;
				$scope.url = 'loan/loan/getLoanConfig';
				$scope.subUrl = 'loan/loan/addSubmit';
				$scope.jumpUrl = 'loan/verify/list';
				$scope.memberGroup = -1;
				$scope.memberGroupName = '个人';
				$scope.changeUrl = 'loan/loan/viewAmount';
				$scope.changeAjax = function(data) {
					$http({
						method : 'post',
						url : $scope.url,
						data : $.param(data),
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						// 自定义按钮名称
						$scope.SubmitBtn = data.Submit ? data.Submit : '保存';
						// 控制‘保存’、‘取消’按钮的显示隐藏判断
						$scope.btnShow = data.view ? false : true;
						$scope.cancelShow = data.cancelbtn ? false : true;
						$scope.formData = data.data;
						$scope.awardStatus = $scope.formData.award_status;
						// $scope.jumpUrl = data.data.is_roam == 1 ?
						// "loan/roam/add" : "loan/verify/list";
						$scope.EformData = {
							award_status : '-1',
							period_type : $scope.formData.repay_types_month.length == ''
									? 'day'
									: 'month',
							part_status : '-1'
						};
						// 还款方式切换
						$scope.repayType = function(val) {
							if (val == 'day') {
								$scope.repay_type = $scope.formData.repay_types_day;
								$scope.period_area = $scope.formData.period_area_day;
							} else {
								$scope.period_area = $scope.formData.period_area_month;
								$scope.repay_type = $scope.formData.repay_types_month;
							}
							$scope.EformData.repay_type = $scope.repay_type[0].value;
							$scope.EformData.borrow_period = $scope.period_area[0].value;
						};
						$scope.repayType($scope.EformData.period_type);
						$scope.loading = true; // 设置加载loading值
					});
				};
				// 借款标类型选择
				$scope.changeAjax($scope.catid);
				$scope.change = function(id) {
					$scope.catid.category_id = id;
					$scope.changeAjax($scope.catid);
				};
				// 用户名判断
				$scope.changeName = function(name) {
					$http({
						method : 'post',
						url : $scope.changeUrl,
						data : "member_name=" + name,
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						$scope.amountShow = true;
						if (data.status == '200') {
							$scope.isUserExit = false;
							$scope.amountInfo = data.data;
						} else {
							$scope.userIsExit = data.description;
							$scope.isUserExit = true;
						}
					});
				}
				// 输入范围过滤 a:输入; b:范围最低; c:范围最高; $name: 变量name名; $MoM:倍数;
				$scope.chAmount = function(a, b, c, $name, $MoM) {
					var a = parseFloat(a), b = parseFloat(b), c = parseFloat(c);
					if ($MoM !== undefined) {
						if (a >= b && a <= c && a % $MoM == 0) {
							$scope.AddLoanForm[$name].$invalid = false;
						} else {
							$scope.AddLoanForm[$name].$invalid = true;
						}
					} else {
						if (a >= b && a <= c) {
							$scope.AddLoanForm[$name].$invalid = false;
						} else {
							$scope.AddLoanForm[$name].$invalid = true;
						}
					}
				};
				// 根据用户名判断个人/企业用户
				$scope.isCompany = function(memberName) {
					$http({
						method : 'post',
						url : 'loan/loan/getMemberGroup?memberName='
								+ memberName,
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						if (data.status == '200') {
							$scope.EformData.iscompany = data.data;
							$scope.memberGroupName = data.data == '1'
									? '企业'
									: '个人';
							$scope.loading = true;
						} else {
							layer.msg(data.description, 1, 5);
						}
					})
				};
				$scope.submit = function() {
					var submitTxt = $scope.SubmitBtn;
					$scope.SubmitBtn = $scope.SubmitBtn + '中...';
					$scope.AddLoanForm.$invalid = true; // 控制‘保存’或者‘提交’时防止重复操作
					$scope.EformData = $.extend({}, $scope.EformData,
							$scope.catid);
					var EformData = angular.copy($scope.EformData);
					//上传图片
					angular.forEach(EformData.attachment_ids, function(value,
							key) {
						EformData.attachment_ids[key].title = EformData.attachment_ids[key].title
								|| null;
					});
					EformData.attachment_ids = EformData.attachment_ids ? JSON
							.stringify(EformData.attachment_ids) : "";
							
					//第三方评估图片上传		
					angular.forEach(EformData.assessment_ids, function(value,
							key) {
						EformData.assessment_ids[key].title = EformData.assessment_ids[key].title
								|| null;
					});
					EformData.assessment_ids = EformData.assessment_ids ? JSON
							.stringify(EformData.assessment_ids) : "";
							
					$http({
						method : 'post',
						url : $scope.subUrl,
						data : $.param(EformData),
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						if (data.status == '200') {
							layer.msg(data.description, 1, 1, function() {
								if ($scope.jumpUrl) {
									window.location.href = $scope.jumpUrl;
								} else {
									parent.location.reload();
									parent.layer.closeAll();
								}
							});
						} else {
							$scope.SubmitBtn = submitTxt;
							$scope.AddLoanForm.$invalid = false; // 释放重复操作控制
							var msg = data.description
									? data.description
									: "操作失败！";
							layer.msg(msg, 1, 5);
						}
					});
				}

				$scope.cancel = function() {
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);

				}

				// 删除选项
				$scope.removeList = function(i, list, data) {
					var newData = [], remove = data[i];
					$scope.EformData[list] = [];
					angular.forEach(data, function(todo) {
						if (todo != remove)
							newData.push(todo);
					});
					$scope.EformData[list] = newData;
				};

			}]);

	// 修改借款标
	tableApp.controller('EditLoanCtrl', ['$scope', '$rootScope', '$http',
			'$injector', function($scope, $rootScope, $http, $injector) {
				var url = window.location.href, urlattr = url.split('='), editid = {
					"editid" : urlattr[urlattr.length - 1]
				};
				$scope.url = 'loan/loan/getLoanInfo';
				$scope.subUrl = 'loan/loan/editSubmit';
				$scope.changeAjax = function(editid) {
					$http({
						method : 'post',
						url : $scope.url,
						data : $.param(editid),
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						// 自定义按钮名称
						$scope.SubmitBtn = data.Submit ? data.Submit : '保存';
						// 控制‘保存’、‘取消’按钮的显示隐藏判断
						$scope.btnShow = data.view ? false : true;
						$scope.cancelShow = data.cancelbtn ? false : true;
						$scope.formData = data.data;
						$scope.loan_info = data.data.loan_info;
						$scope.awardStatus = $scope.formData.award_status;
						$scope.editLoan = {
							id : $scope.loan_info.id,
							name : $scope.loan_info.name,
							borrow_type : $scope.loan_info.use,
							deposit_certificate : $scope.loan_info.deposit_certificate,
							validate : $scope.loan_info.validate,
							period_type : $scope.loan_info.repay_mode == '1'
									? 'month'
									: 'day',
							amount : $scope.loan_info.amount,
							apr : $scope.loan_info.apr,
							tender_amount_min : String($scope.loan_info.tender_amount_min),
							tender_amount_max : String($scope.loan_info.tender_amount_max),
							award_status : $scope.loan_info.award_status,
							award_proportion : $scope.loan_info.award_proportion == '0'
									? ''
									: $scope.loan_info.award_proportion,
							is_auto : $scope.loan_info.is_auto,
							auto_scale : $scope.loan_info.auto_scale,
							borrow_auto_switch : $scope.formData.borrow_auto_switch,
							contents : $scope.loan_info.contents,
							attachment_ids : data.data.attachment_ids,
							// 附表需要的数据
							category_id : $scope.loan_info.category_id,
							tender_roam_min : $scope.formData.tender_roam_min,
							vouch_company_id : $scope.loan_info.vouch_company_id,
							vouch_style : $scope.formData.vouch_style,
							assets : $scope.formData.assets,
							assets_use : $scope.formData.assets_use,
							risk : $scope.formData.risk,
							//项目需求
							assessment_ids:data.data.assessment_ids,//第三方评估
							collateral_message:$scope.loan_info.collateral_message,//抵押物信息
							background_invest:$scope.loan_info.background_invest,//背景调查
							collateral_assessment:$scope.loan_info.collateral_assessment,//抵押物评估
							actural_inspect:$scope.loan_info.actural_inspect,//实地考察
							rights_confirm:$scope.loan_info.rights_confirm,//债权确立
							collateral_confirm:$scope.loan_info.collateral_confirm,//抵押确立
							contract_supervise:$scope.loan_info.contract_supervise,//合同监管
							finance_supervise:$scope.loan_info.finance_supervise,//资金监督 
							dynamic_control:$scope.loan_info.dynamic_control  //动态风控

							
						};
						// 还款方式切换
						$scope.repayType = function(val) {
							if (val == 'day') {
								$scope.repay_type = $scope.formData.repay_types_day;
								$scope.period_area = $scope.formData.period_area_day;
							} else {
								$scope.period_area = $scope.formData.period_area_month;
								$scope.repay_type = $scope.formData.repay_types_month;
							}
							$scope.editLoan.repay_type = $scope.repay_type[0].value;
							$scope.editLoan.period = $scope.period_area[0].value;
						};
						$scope.repayType($scope.editLoan.period_type);
						$scope.editLoan.period = $scope.loan_info.period;
						$scope.editLoan.repay_type = $scope.loan_info.repay_type;

						$scope.loading = true; // 设置加载loading值
					});
				};
				// 借款标类型选择
				$scope.changeAjax(editid);
				// 输入范围过滤 a:输入; b:范围最低; c:范围最高; $name: 变量name名; $MoM:倍数;
				$scope.chAmount = function(a, b, c, $name, $MoM) {
					var a = parseFloat(a), b = parseFloat(b), c = parseFloat(c);
					if ($MoM !== undefined) {
						if (a >= b && a <= c && a % $MoM == 0) {
							$scope.EditLoanForm[$name].$invalid = false;
						} else {
							$scope.EditLoanForm[$name].$invalid = true;
						}
					} else {
						if (a >= b && a <= c) {
							$scope.EditLoanForm[$name].$invalid = false;
						} else {
							$scope.EditLoanForm[$name].$invalid = true;
						}
					}
				};
				$scope.submit = function() {
					var submitTxt = $scope.SubmitBtn;
					$scope.SubmitBtn = $scope.SubmitBtn + '中...';
					$scope.EditLoanForm.$invalid = true; // 控制‘保存’或者‘提交’时防止重复操作
					var editLoan = angular.copy($scope.editLoan);
					editLoan.attachment_ids = editLoan.attachment_ids ? JSON
							.stringify(editLoan.attachment_ids) : "";
							
					editLoan.assessment_ids = editLoan.assessment_ids ? JSON
							.stringify(editLoan.assessment_ids) : "";
					$http({
						method : 'post',
						url : $scope.subUrl,
						data : $.param(editLoan),
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						if (data.status == '200') {
							layer.msg(data.description, 1, 1, function() {
								if ($scope.jumpUrl) {
									window.location.href = $scope.jumpUrl;
								} else {
									parent.location.reload();
									parent.layer.closeAll();
								}
							});
						} else {
							$scope.SubmitBtn = submitTxt;
							$scope.EditLoanForm.$invalid = false; // 释放重复操作控制
							var msg = data.description
									? data.description
									: "操作失败！";
							layer.msg(msg, 1, 5);
						}
					});
				}

				$scope.cancel = function() {
					var index = parent.layer.getFrameIndex(window.name);
					parent.layer.close(index);

				}
				// 删除选项
				$scope.removeList = function(i, list) {
					var oldTodos = $scope.editLoan[list], remove = oldTodos[i];
					$scope.editLoan[list] = [];
					angular.forEach(oldTodos, function(todo) {
						if (todo != remove)
							$scope.editLoan[list].push(todo);
					});
				};
			}]);

	// 模块选择
	tableApp.controller('tplModelCtrl', ['$scope', '$rootScope', '$http',
			'$injector', function($scope, $rootScope, $http, $injector) {
				$scope.formData = {};
				$scope.Url = 'system/format/choice';
				$http.post($scope.Url).success(function(data) {
					$scope.loading = true; // 设置加载loading值
					$scope.tplModel = data;
				});
				$scope.submit = function() {
					$http({
						method : 'post',
						url : 'system/format/savechoice',
						data : $.param($scope.formData),
						headers : {
							'Content-Type' : 'application/x-www-form-urlencoded'
						}
					}).success(function(data) {
						if (data.status == '200') {
							layer.msg(data.description, 1, 1, function() {
								location.reload();
							});
						} else {
							layer.msg(data.description, 1, 3);
						}
					});
				}
			}]);

	// 表单里的文章编辑器
	// tableApp.directive('ueditor', function() {
	// return {
	// require: '?ngModel',
	// link: function($S, element, attr, ctrl) {
	// var _NGUeditor, _updateByRender;
	// _updateByRender = false;
	// _NGUeditor = (function() {
	// function _NGUeditor() {
	// this.bindRender();
	// this.initEditor();
	// return;
	// }
	//
	//
	// /**
	// * 初始化编辑器
	// * @return {[type]} [description]
	// */
	//
	// _NGUeditor.prototype.initEditor = function() {
	// var _UEConfig, _editorId, _self;
	// _self = this;
	// if (typeof UM === 'undefined') {
	// console.error("Please import the local resources of ueditor!");
	// return;
	// }
	// var editor1 = element.attr('id');
	// this.editor = UM.getEditor(editor1);
	// return this.editor.ready(function() {
	// _self.editorReady = true;
	// _self.editor.addListener("contentChange", function() {
	// ctrl.$setViewValue(_self.editor.getContent());
	// if (!_updateByRender) {
	// if (!$S.$$phase) {
	// $S.$apply();
	// }
	// }
	// _updateByRender = false;
	// });
	// element.bind('blur change keyup', function() {
	// $S.$apply(function() {
	// ctrl.$setViewValue(_self.editor.getContent());
	// if (!_updateByRender) {
	// if (!$S.$$phase) {
	// $S.$apply();
	// }
	// }
	// _updateByRender = false;
	// });
	// });
	// _self.setEditorContent();
	// if (typeof $S.ready === "function") {
	// $S.ready(_self.editor);
	// }
	// });
	// };
	//
	// _NGUeditor.prototype.setEditorContent = function(content) {
	// if (content == null) {
	// content = this.modelContent;
	// }
	// if (this.editor && this.editorReady) {
	// this.editor.setContent(content);
	// }
	// };
	//
	// _NGUeditor.prototype.bindRender = function() {
	// var _self;
	// _self = this;
	// ctrl.$render = function() {
	// _self.modelContent = (ctrl.$isEmpty(ctrl.$viewValue) ? "" :
	// ctrl.$viewValue);
	// _updateByRender = true;
	// _self.setEditorContent(_self.modelContent);
	// };
	// };
	//
	// return _NGUeditor;
	// })();
	// new _NGUeditor();
	// }
	// };
	// });
	tableApp.directive("kindEditor", function() {
		return {
			scope : {},
			restrict : 'A',
			require : '?ngModel',
			link : function(scope, element, attrs, ctrl) {
				var _initContent, editor;
				var fexUE = {
					initEditor : function() {
						editor = KindEditor.create(element[0], {
							width : '250px',
							height : '300px',
							resizeType : 1,
							allowPreviewEmoticons : true,
							allowImageUpload : true,
							allowFileManager : true,
							uploadJson : 'umeditor/admin/common/public/fileupload',
							afterChange : function() {
								ctrl.$setViewValue(this.html());
							},
							items : ['lineheight', 'fontname', 'fontsize', '|',
									'forecolor', 'hilitecolor', 'bold',
									'italic', 'underline', 'link', 'image']
						});
					},
					setContent : function(content) {
						if (editor) {
							editor.html(content);
						}
					}
				}
				if (!ctrl) {
					return;
				}
				_initContent = ctrl.$viewValue;
				ctrl.$render = function() {
					_initContent = ctrl.$isEmpty(ctrl.$viewValue)
							? ''
							: ctrl.$viewValue;
					fexUE.setContent(_initContent);
				};
				fexUE.initEditor();
			}
		}
	})
	// 日期控件
	tableApp.controller('dateCtrl', function($scope) {
		$('.date').datepicker({
			autoclose : true,
			todayHighlight : true,
			language : 'zh-CN'
		});
	});

	// textarea编辑绑定ng-model，让textarea可以初始化数据（暂时没用到）
	tableApp.directive('contenteditable', function() {
		return {
			require : 'ngModel',
			link : function(scope, elm, attrs, ctrl) {
				// view -> model
				elm.bind('blur change keyup', function() {
					scope.$apply(function() {
						ctrl.$setViewValue(elm.html());
					});
				});
				// model -> view
				ctrl.$render = function(value) {
					elm.html(value);
				};
				// load init value from DOM
				ctrl.$setViewValue(elm.html());
			}
		};
	});

	// 上传单张图片
	tableApp.directive('fileupload', function() {
		return {
			require : "?ngModel",
			link : function(scope, element, ngModel) {
				if (!ngModel) {
					return;
				}

				function uploadsuccess(file, _data, response) {
					var result = eval('(' + _data + ')');
					var single_img = $('#single_img');
					var input_list = '<input type="hidden" name="singlefile" value="'
							+ result.data.id + '" />';
					single_img.html(input_list);
					$('#single_img_src').attr('src', result.data.fileurl);
				}
				element.uploadify({
					'swf' : '/js/plugins/uploadify/scripts/uploadify.swf',
					'uploader' : '/common/public/fileupload',
					fileObjName : 'Filedata',
					buttonText : '请选择',
					width : 50,
					height : 20,
					fileSizeLimit : '2000KB',
					auto : true,
					multi : true,
					onUploadSuccess : uploadsuccess
				});

			}
		}
	});

	// 系统权限分配控制器
	tableApp.controller('neweditRole', function($scope, $http) {
		$scope.params = {};
		$scope.params.checkForm = [];
		/* 状态初始化 */
		$scope.check_txt = '全选';
		$scope.checkStatus = false;
		$http({
			method : 'post',
			url : "system/role/roleFields?id=" + editId,
			headers : {
				'Content-Type' : 'application/x-www-form-urlencoded'
			}
		}).success(function(data) {
			$scope.repeatList = data;
			// 数据赋值
			/* 初始化 */
			var dataInit = function(val) {
				if (val.checked) {
					$scope.params.checkForm.push(val.value);
				}
			};
			$scope.dataForeach = function(_data, callFU) {
				angular.forEach(_data, function(val, key) {
					if (typeof callFU == 'function') {
						callFU(val);
					}
					$scope.dataForeach(val.children, callFU);
				});
			};
			$scope.dataForeach($scope.repeatList, dataInit);

			// 数据判断
			/* 选中选择 */
			$scope.childerTrue = function(_data, pid, checked, repeatList) {
				$scope.dataForeach(_data, function(v) {
					var ido = $scope.params.checkForm.indexOf(v.value), parentStatus = false;
					if (ido < 0) {
						$scope.params.checkForm.push(v.value);
					}
				});
				$scope.checkTF(pid, checked, repeatList);
			};
			/* 取消选择 */
			$scope.childerFalse = function(_data, pid, checked, repeatList) {
				$scope.dataForeach(_data, function(v) {
					var ido = $scope.params.checkForm.indexOf(v.value);
					if (ido >= 0) {
						$scope.params.checkForm.splice(ido, 1);
					}
				});
				$scope.checkTF(pid, checked, repeatList);
			};
			/* 选中取消处理方法 */
			$scope.checkTF = function(pid, status, repeatList) {
				/* 联动父级 */
				var $a = pid;
				$scope.dataForeach(repeatList, function(val) {
					var $idx = $scope.params.checkForm.indexOf($a);
					if($a > 0){
                        if ($idx < 0) {
                            $scope.params.checkForm.push($a);
                        }
                        if (val.value == $a) {
                            $a = val.pid;
                        }
                    }
				});
				$scope.dataForeach(repeatList, function(val) {
					if (val.value == pid) {
						var $i = 0, $n = val.children.length, $idx = $scope.params.checkForm
								.indexOf(val.value), $val = val.value;
						if (status && $idx < 0) {
							$scope.params.checkForm.push(val.value);
							return;
						}
						function checkParentUpdate(val, status) {
							$i++;
							if ($i == $n) {
								$scope.check(val, val.value, status);
							}
						}

						angular.forEach(val.children, function(vn, kn) {
							var idn = $scope.params.checkForm.indexOf(vn.value);
							if ((idn < 0 && !status) || (idn >= 0 && status)) {
								checkParentUpdate(val, status);
							}
						});
					}
				});
			};

			$scope.childerForeach = function(_data, id, checked, repeatList) {
				var childData = _data.children, pid = _data.pid;
				if (checked) {
					$scope.childerTrue(childData, pid, checked, repeatList);
				} else {
					$scope.childerFalse(childData, pid, checked, repeatList);
				}
			};

			$scope.check = function(_data, value, checked) {
				var idx = $scope.params.checkForm.indexOf(value);
				if (idx >= 0 && !checked) {
					$scope.params.checkForm.splice(idx, 1);
				}
				if (idx < 0 && checked) {
					$scope.params.checkForm.push(value);
				}
				$scope.childerForeach(_data, value, checked, $scope.repeatList);
			};
			$scope.loading = true; // 设置加载loading值
		});

		/* 全选|取消全选 */
		$scope.checkChange = function(status) {
			$scope.params.checkForm = [];
			if (status) {
				$scope.checkStatus = false;
				$scope.check_txt = '全选';
			} else {
				var checkAll;
				$scope.dataForeach($scope.repeatList, function(val) {
					$scope.params.checkForm.push(val.value);
				});
				$scope.check_txt = '反选';
				$scope.checkStatus = true;
			}
		};

		$scope.submit = function() {
			$scope.subUrl = 'system/role/editRoleSubmit?id=' + editId;
			$http({
				method : 'post',
				url : $scope.subUrl,
				data : $.param($scope.params),
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded'
				}
			}).success(function(data) {
				if (data.status == '200') {
					layer.msg(data.description, 1, 1, function() {
						if ($scope.jumpUrl) {
							window.location.href = $scope.jumpUrl;
						} else {
							parent.location.reload();
							parent.layer.closeAll();
						}
					});
				} else {
					// $scope.SubmitBtn = submitTxt;
					$scope.AddLoanForm.$invalid = false; // 释放重复操作控制
					var msg = data.description ? data.description : "操作失败！";
					layer.msg(msg, 1, 5);
				}
			});
		}
	});

}).call(this);
