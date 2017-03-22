(function() {
	function isEmpty(obj) {
        for (var name in obj) {
            return false;
        }
        return true;
    }

    //删除json字段
    function removeJsonFn(name, array) {
        for (var i = 0; i < array.length; i++) {
            delete name[array[i]];
        }
    }

    //删除数组元素
    Array.prototype.baoremove = function (dx) {
        if (isNaN(dx) || dx > this.length) {
            return false;
        }
        this.splice(dx, 1);
    }
    var tableApp = angular.module('tableApp', ['ngRoute', 'validation', 'validation.rule', 'pageApp', 'dyDir', 'filters']);
    tableApp.filter('to_trusted', ['$sce', function($sce) {
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);

    tableApp.controller('tableCtrl', function($scope, $rootScope, $http) {
        $http.post(window.location.href).success(function(_data) {
            $scope.tableHlist = _data.data.TableHeader;
            $scope.tableBUrl = _data.data.TableB;
            $scope.CheckId = false;
            $scope.loading = false; //设置加载loading值

            $scope.CheckId = _data.data.Check ? true : false;
            $scope.CheckIName = _data.data.Check ? _data.data.Check : 'id';
            $scope.setsSrcbox(_data); //设置搜索框
            $http.post($scope.tableBUrl).success(function(data) {
                $scope.loading = true; //设置加载loading值
                if (data.status == '200') {
                    $scope.tableB = data.data.items;
                    $scope.Total = data.data.total_items; //总条数
                    $scope.Pages = data.data.total_pages; //总页数
                    $scope.Epage = data.data.epage; //每页条数
                    if (!$scope.Epage) {
                        $scope.Epage = 10; //默认每页条数
                    }
                    $scope.pageHide = true;
                    $scope.setPages();
                } else {
                    $.layer({
                        area: ['auto', 'auto'],
                        title: '提示',
                        closeBtn: false,
                        dialog: {
                            msg: data.description,
                            type: 8
                        }
                    });
                }
            });
        });

        //设置全选框
        $scope.checkChange = function() {
            $scope.bec = !$scope.bec;
            if ($scope.bec) {
                $scope.Checklist.id = $scope.tableB.map(function(item) {
                    return item[$scope.CheckIName];
                });
                var arrya = $scope.Checklist.id,
                    keyLen = arrya.length;
                for (var i = 0; i < keyLen; i++) {
                    $scope.Checklist.on[arrya[i]] = true;
                }
            } else {
                $scope.Checklist.id = [];
                $scope.Checklist.on = [];
            }
        }

        //设置复选行选中
        $scope.Checklist = {
            id: [],
            on: []
        };

        $scope.checkBtn = function(val, $event) {
            $event.stopPropagation();
            if ($scope.CheckId) {
                var array = $scope.Checklist.id,
                    key = array.indexOf(val),
                    keyLen = array.length;
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

        //设置单选行选中
        $scope.radioBtn = function(val, $event) {
            $event.stopPropagation();
            if ($scope.CheckId) {
                $scope.radioList = [];
                $scope.radioList[val] = !$scope.radioList[val];
            } else {
                return false;
            }
        };

        //设置搜索框
        $scope.setsSrcbox = function(_data) {
            //判断是否有搜索框
            $scope.IsSearch = false;
            $scope.tableHform = _data.data.Search;
            if ($scope.tableHform && $scope.tableHform.length > 0) {
                $scope.IsSearch = true;
            }
            //判断是否有工具栏
            $scope.IsTool = false;
            $scope.ToolList = _data.data.Tool;
            if ($scope.ToolList && $scope.ToolList.length > 0) {
                $scope.IsTool = true;
            }
        }

        //设置总页数，并在前台显示页码
        $scope.setPages = function() {
            $scope.pageItem = [];
            var len = $scope.Pages;
            for (var i = 0; i < len; i++) {
                if (i < $scope.pageData.current_page + 5 && i > $scope.pageData.current_page - 7)
                    $scope.pageItem.push(i);

            }
        }

        $scope.pageData = {};
        $scope.SpageData = {};
        $scope.pageData.current_page = 1;
        $scope.getPageData = function() {
            $http({
                method: 'POST',
                url: $scope.tableBUrl,
                data: $.param($scope.pageData), // pass in data as strings
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                cache: true
            }).success(function(data) {
                if (data.status == '200') {
                    $scope.tableB = data.data.items;
                    $scope.Pages = data.data.total_pages;
                    $scope.Total = data.data.total_items;
                    $scope.setPages();
                    $scope.pageHide = true; //重新渲染指令
                } else {
                    layer.msg(data.description, 1, 2);
                }
            });
        }
        $scope.cachePageData = {} //搜索数据的缓存
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

        //添加列表
        $scope.addList = function(url, title) {
            var ck = $('input[name="ck"]:checked');
            $.layer({
                type: 2,
                title: title,
                shadeClose: true,
                maxmin: true,
                fix: false,
                area: ['800px', 500],
                iframe: {
                    src: url
                }
            });
        }

        //删除列表
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
            $.layer({
                area: ['auto', 'auto'],
                title: title,
                dialog: {
                    msg: '确定是否' + name + 'id为 ' + ckid + ' 的这些选项？',
                    btns: 2,
                    type: 4,
                    btn: ['确定', '取消'],
                    yes: function() {
                        $.ajax({
                            type: 'post',
                            url: url,
                            data: {
                                'delid': ckid
                            },
                            success: function(data) {
                                var results = eval('(' + data + ')');
                                if (results.status == 200) {
                                    layer.msg(results.data, 1, 1, function() {
                                        $scope.getPageData();
                                    });
                                } else {
                                    layer.msg(results.description, 1, 2, function() {
                                        $scope.getPageData();
                                    });
                                }
                            }
                        })
                    },
                    no: function() {

                    }
                }
            });
        }

        //修改列表
        $scope.editList = function(url, title, name) {
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
                $.layer({
                    type: 2,
                    title: title,
                    shadeClose: true,
                    maxmin: true,
                    fix: false,
                    area: ['800px', 500],
                    iframe: {
                        src: url + '&editid=' + editid
                    }
                });
            }
        }

        //查看协议
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
                    type: 2,
                    title: title,
                    shadeClose: false,
                    fix: false,
                    area: [600, 470],
                    iframe: {
                        src: url + '&editid=' + editid
                    }
                });
            }
        }

        //查看列表
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
                    type: 2,
                    title: title,
                    shadeClose: true,
                    maxmin: true,
                    fix: false,
                    area: ['800px', 500],
                    iframe: {
                        src: url + '&editid=' + editid
                    }
                });
            }
        }

        //导出数据
        $scope.exportdata = function(url, title) {
            $.layer({
                area: ['auto', 'auto'],
                title: title,
                dialog: {
                    msg: '确定是否导出数据？',
                    btns: 2,
                    type: 4,
                    btn: ['确定', '取消'],
                    yes: function() {
                        window.location.href = url;
                        layer.closeAll();
                    },
                    no: function() {

                    }
                }
            });
        }

        //撤销数据
        $scope.cancel = function(url, title) {
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
            $.layer({
                area: ['auto', 'auto'],
                title: title,
                dialog: {
                    msg: '确定是否撤销id为 ' + ckid + ' 的这些选项？',
                    btns: 2,
                    type: 4,
                    btn: ['确定', '取消'],
                    yes: function() {
                        $.ajax({
                            type: 'post',
                            url: url,
                            data: {
                                'delid': ckid
                            },
                            success: function(data) {
                                var results = eval('(' + data + ')');
                                if (results.status == 200) {
                                    layer.msg(results.data, 1, 1, function() {
                                        $scope.getPageData();
                                    });
                                } else {
                                    layer.msg(results.description, 1, 2, function() {
                                        $scope.getPageData();
                                    });
                                }
                            }
                        })
                    },
                    no: function() {

                    }
                }
            });
        }

        //发送数据
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
            $.layer({
                area: ['auto', 'auto'],
                title: title,
                dialog: {
                    msg: '确定是否发送id为 ' + ckid + ' 的这些选项？',
                    btns: 2,
                    type: 4,
                    btn: ['确定', '取消'],
                    yes: function() {
                        $.ajax({
                            type: 'post',
                            url: url,
                            data: {
                                'sendid': ckid
                            },
                            success: function(data) {
                                var results = eval('(' + data + ')');
                                if (results.status == 200) {
                                    layer.msg(results.data, 1, 1, function() {
                                        $scope.getPageData();
                                    });
                                } else {
                                    layer.msg(results.description, 1, 2, function() {
                                        $scope.getPageData();
                                    });
                                }
                            }
                        })
                    },
                    no: function() {

                    }
                }
            });
        }

        //图片查看
        $scope.photoView = function(url, $event) {
            $event.stopPropagation();
            $.layer({
                type: 1, //0-4的选择,（1代表page层）
                area: ['500px', 'auto'],
                border: [8, 0.3, '#000'], //不显示边框
                title: [0],
                bgcolor: '#eee', //设置层背景色
                page: {
                    html: '<img src="' + url + '" width="500"/>'
                },
                shift: 'top' //从上动画弹出
            });
        }

        //修改列表跳转
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

        //查看跳转
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

        //查看跳转打开新标签页面
        $scope.tagSkip = function(url) {
            window.location.href = url;
        }

    });

    //编辑控制器
    tableApp.controller('EditCtrl', ['$scope', '$rootScope', '$http', '$injector', function($scope, $rootScope, $http, $injector) {
        var url = window.location.href,
            urlattr = url.split('='),
            editid = {
                "editid": urlattr[urlattr.length - 1]
            };
        $scope.f_hide = function() {
            var n = "",
                m = "",
                l = $scope.formlist.length;

            for (var i = 0; i < l; i++) {
                if ($scope.formlist[i].haschild) {
                    n = i + 1;
                    m = $scope.formlist[i].name;
                    $.each($scope.formlist[i].options, function(n, e) {
                        if ($scope.formlist[i].options[n].checkstatu) {
                            $scope.EformData[m] = $scope.formlist[i].options[n].value;
                        }
                    })
                }
            }
            if (m) {
                dl = $scope.formlist[n - 1].options.length
                $scope.$watch("EformData." + m + "", function() {
                    for (var i = n; i < n + dl; i++) {
                        $scope.formlist[i].hide = true;
                        if ($scope.formlist[n - 1].options[i - n].value == $scope.EformData[m]) {
                            $scope.formlist[i].hide = false;
                        }
                    }
                })
            }
        }
        $http({
            method: 'post',
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(data) {
            $scope.formlist = data.data.FormFields; //渲染页面用的数据
            $scope.subUrl = data.data.SubUrl; //提交地址
            $scope.jumpUrl = data.data.jumpUrl ? data.data.jumpUrl : "";
            $scope.webNotice = data.data.webNotice ? data.data.webNotice : "";
            $scope.EformData = {};
            // 自定义按钮名称
            $scope.SubmitBtn = data.data.Submit ? data.data.Submit : '保存';
            // 控制‘保存’、‘取消’按钮的显示隐藏判断
            $scope.btnShow = data.data.view ? false : true;
            $scope.cancelShow = data.data.cancelbtn ? false : true;
            $scope.reload = data.data.reload ? true : false;
            // Get数据URL
            if (data.data.getDataUrl) {
                urlattr = data.data.getDataUrl.split('=');
                editid = {
                    "editid": urlattr[urlattr.length - 1]
                };
            }
            $scope.loading = true; //设置加载loading值
            $http({
                method: 'post',
                url: url,
                data: $.param(editid),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(_data) {
                if (_data.status == 200) {
                    var initformdata = _data.data.FormData;
                    $scope.EformData.editid = urlattr[urlattr.length - 1];
                    if (initformdata) {
                        for (var i = 0; i < initformdata.length; i++) {
                            $scope.EformData[initformdata[i].name] = initformdata[i].value;
                        }
                    }
                } else {
                    $.layer({
                        area: ['auto', 'auto'],
                        title: '提示',
                        closeBtn: false,
                        dialog: {
                            msg: _data.description,
                            btns: 1,
                            type: 7,
                            btn: ['确定'],
                            yes: function() {
                                var index = parent.layer.getFrameIndex(window.name);
                                parent.layer.close(index);
                            }
                        }
                    });
                }
            });
            $scope.f_hide(); //控制显示隐藏，如费用类型选择的字段
        });
        $scope.submit = function() {
            var submitTxt = $scope.SubmitBtn;
            $scope.SubmitBtn = $scope.SubmitBtn + '中...';
            $scope.EditForm.$invalid = true; // 控制‘保存’或者‘提交’时防止重复操作
            $http({
                method: 'post',
                url: $scope.subUrl,
                data: $.param($scope.EformData),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                if (data.status == 200) {
                    if (data.data.popup) {
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
                    $scope.EditForm.$invalid = false; // 释放重复操作控制
                    var msg = data.description ? data.description : "操作失败！";
                    layer.msg(msg, 1, 5);
                }
            });
        }

        $scope.cancel = function() {
            if ($scope.reload) {
                parent.location.reload();
            }
            var index = parent.layer.getFrameIndex(window.name);
            parent.layer.close(index);
        }

        //删除选项
        $scope.removeList = function(i) {
            var oldTodos = $scope.EformData.case,
                remove = oldTodos[i];
            $scope.EformData.case = [];
            angular.forEach(oldTodos, function(todo) {
                if (todo != remove) $scope.EformData.case.push(todo);
            });
        };
    }]);

    //添加控制器
    tableApp.controller('AddCtrl', ['$scope', '$rootScope', '$http', '$injector', function($scope, $rootScope, $http, $injector) {
        var url = window.location.href;
        $scope.btnShow = true; // 控制‘保存’、‘取消’按钮默认显示
        $scope.f_hide = function() {
            var n = "",
                m = "",
                l = $scope.formlist.length;

            for (var i = 0; i < l; i++) {
                if ($scope.formlist[i].haschild) {
                    n = i + 1;
                    m = $scope.formlist[i].name;
                    $.each($scope.formlist[i].options, function(n, e) {
                        if ($scope.formlist[i].options[n].checkstatu) {
                            $scope.EformData[m] = $scope.formlist[i].options[n].value;
                        }
                    })
                }
            }
            if (m) {
                dl = $scope.formlist[n - 1].options.length
                $scope.$watch("EformData." + m + "", function() {
                    for (var i = n; i < n + dl; i++) {
                        $scope.formlist[i].hide = true;
                        if ($scope.formlist[n - 1].options[i - n].value == $scope.EformData[m]) {
                            $scope.formlist[i].hide = false;
                        }
                    }
                })
            }
        }
        $http({
            method: 'post',
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(data) {
            $scope.formlist = data.data.FormFields; //渲染页面用的数据
            $scope.subUrl = data.data.SubUrl; //提交地址
            $scope.jumpUrl = data.data.jumpUrl ? data.data.jumpUrl : "";
            $scope.EformData = {};
            // 自定义名称
            if (data.data.Submit) {
                $scope.SubmitBtn = data.data.Submit;
            } else {
                $scope.SubmitBtn = '保存';
            }
            // 控制‘保存’、‘取消’按钮的显示隐藏判断
            if (data.data.view) {
                $scope.btnShow = false;
            }
            //$scope.initformdata = data.data.FormData; //初始化页面的数据
            $scope.loading = true; //设置加载loading值
            $scope.f_hide(); //控制显示隐藏，如费用类型选择的字段
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
                method: 'post',
                url: $scope.subUrl,
                data: $.param($scope.EformData),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
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
                    var msg = data.description ? data.description : "操作失败！";
                    layer.msg(msg, 1, 5);
                }
            });
        }

        $scope.cancel = function() {
            var index = parent.layer.getFrameIndex(window.name);
            parent.layer.close(index);

        }

        //删除选项
        $scope.removeList = function(i) {
            var oldTodos = $scope.EformData.case,
                remove = oldTodos[i];
            $scope.EformData.case = [];
            angular.forEach(oldTodos, function(todo) {
                if (todo != remove) $scope.EformData.case.push(todo);
            });
        };
    }]);

    //编辑控制器
    tableApp.controller('BorrowCtrl', ['$scope', '$rootScope', '$http', '$injector', function($scope, $rootScope, $http, $injector) {
        var url = window.location.href,
            urlHost = window.location.protocol + '//' + window.location.host + '/finance/fee/borrow',
            urlattr = url.split('='),
            editid = {
                "editid": urlattr[urlattr.length - 1]
            };
        $scope.loading = true; //设置加载loading值
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
    
    
    //存证费用设置
    tableApp.controller('CertificateFeeCtrl', ['$scope', '$rootScope', '$http', '$injector', function($scope, $rootScope, $http, $injector) {
        var url = window.location.href,
            urlHost = window.location.protocol + '//' + window.location.host + '/finance/certificatefee/certificatefee',
            urlattr = url.split('='),
            editid = {
                "editid": urlattr[urlattr.length - 1]
            };
        $scope.loading = true; //设置加载loading值
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
    //存证统计
    tableApp.controller('certificatefeeCountCtrl', ['$scope', '$rootScope', '$http', '$injector', function($scope, $rootScope, $http, $injector) {
        var url = window.location.href,
            urlHost = window.location.protocol + '//' + window.location.host + '/finance/certificatefee/countTotal',
            urlattr = url.split('='),
            editid = {
                "editid": urlattr[urlattr.length - 1]
            };
        $scope.loading = true; //设置加载loading值
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
    tableApp.controller('tabCtrl', ['$scope', '$rootScope', '$http', '$injector', function($scope, $rootScope, $http, $injector) {
        $scope.setTabid = function(tabidValue) {
            $scope.tabid = tabidValue;
        };

        $scope.isSetid = function(tabidName) {
            return $scope.tabid === tabidName;
        };
    }]);

    //查看控制器
    tableApp.controller('viewCtrl', ['$scope', '$rootScope', '$http', '$injector', function($scope, $rootScope, $http, $injector) {
    	$scope.loan = loanContent.loan;
        $scope.loanInfo = loanContent.loanInfo;
        $scope.loanRepay = loanContent.loanRepay;
        $scope.loanRepayList = loanContent.loanRepayList;
        $scope.tenderList = loanContent.tenderList;
        $scope.company = loanContent.company;

    }]);
    
    //添加借款标
    tableApp.controller('AddLoanCtrl', ['$scope', '$rootScope', '$http', '$injector', function($scope, $rootScope, $http, $injector) {
        $scope.catid = {};
        $scope.EformData = {};
        $scope.loan_info = loan_info;
        $scope.catid.category_id = $scope.loan_info.category_option[0].id;
        $scope.catid.borrow_use = $scope.loan_info.borrow_option[0].id;
        $scope.catid.deposit_certificate = $scope.loan_info.deposit_certificate[1].id;
        $scope.url = '/finance/borrow/getLoanConfig';
        $scope.subUrl = '/finance/borrow/addSubmit';
        $scope.jumpUrl = 'loan/verify/list';
        $scope.changeAjax = function(data) {
                $http({
                    method: 'post',
                    url: $scope.url,
                    data: $.param(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data) {
                    // 自定义按钮名称
                    $scope.SubmitBtn = data.Submit ? data.Submit : '保存';
                    // 控制‘保存’、‘取消’按钮的显示隐藏判断
                    $scope.btnShow = data.view ? false : true;
                    $scope.cancelShow = data.cancelbtn ? false : true;
                    $scope.formData = data;
                    $scope.EformData.repay_type = data.repay_types ? data.repay_types[0].id : '';
                    $scope.EformData.award_status = data.award_status ? data.award_status : '';
                    $scope.loading = true; //设置加载loading值
                });
            }
            //借款标类型选择
        $scope.changeAjax($scope.catid);
        $scope.change = function(id) {
                $scope.catid.category_id = id;
                $scope.changeAjax($scope.catid);
            }
            //输入范围过滤 a:输入; b:范围最低; c:范围最高; $name: 变量name名; $MoM:倍数;
        $scope.chAmount = function(a, b, c, $name, $MoM) {
            var a = parseFloat(a),
                b = parseFloat(b),
                c = parseFloat(c);
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
        }
        $scope.submit = function() {
            var submitTxt = $scope.SubmitBtn;
            $scope.SubmitBtn = $scope.SubmitBtn + '中...';
            $scope.AddLoanForm.$invalid = true; // 控制‘保存’或者‘提交’时防止重复操作
            $scope.EformData = $.extend({}, $scope.EformData, $scope.catid);
            $http({
                method: 'post',
                url: $scope.subUrl,
                data: $.param($scope.EformData),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
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
                    var msg = data.description ? data.description : "操作失败！";
                    layer.msg(msg, 1, 5);
                }
            });
        }

        $scope.cancel = function() {
            var index = parent.layer.getFrameIndex(window.name);
            parent.layer.close(index);

        }
    }]);
    //模块选择
    tableApp.controller('tplModelCtrl', ['$scope', '$rootScope', '$http', '$injector', function($scope, $rootScope, $http, $injector) {
        $scope.formData = {};
        $scope.Url = 'system/Format/choice';
        $http.post($scope.Url).success(function(data) {
            $scope.loading = true; //设置加载loading值
            $scope.tplModel = data;
        });
        $scope.submit = function() {
            $http({
                method: 'post',
                url: 'system/Format/savechoice',
                data: $.param($scope.formData),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
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

    //表单里的文章编辑器
    tableApp.directive('ueditor', function() {
        return {
            require: '?ngModel',
            link: function($S, element, attr, ctrl) {
                var _NGUeditor, _updateByRender;
                _updateByRender = false;
                _NGUeditor = (function() {
                    function _NGUeditor() {
                        this.bindRender();
                        this.initEditor();
                        return;
                    }


                    /**
                     * 初始化编辑器
                     * @return {[type]} [description]
                     */

                    _NGUeditor.prototype.initEditor = function() {
                        var _UEConfig, _editorId, _self;
                        _self = this;
                        if (typeof UM === 'undefined') {
                            console.error("Please import the local resources of ueditor!");
                            return;
                        }
                        var editor1 = element.attr('id');
                        this.editor = UM.getEditor(editor1);
                        return this.editor.ready(function() {
                            _self.editorReady = true;
                            _self.editor.addListener("contentChange", function() {
                                ctrl.$setViewValue(_self.editor.getContent());
                                if (!_updateByRender) {
                                    if (!$S.$$phase) {
                                        $S.$apply();
                                    }
                                }
                                _updateByRender = false;
                            });
                            element.bind('blur change keyup', function() {
                                $S.$apply(function() {
                                    ctrl.$setViewValue(_self.editor.getContent());
                                    if (!_updateByRender) {
                                        if (!$S.$$phase) {
                                            $S.$apply();
                                        }
                                    }
                                    _updateByRender = false;
                                });
                            });
                            _self.setEditorContent();
                            if (typeof $S.ready === "function") {
                                $S.ready(_self.editor);
                            }
                        });
                    };

                    _NGUeditor.prototype.setEditorContent = function(content) {
                        if (content == null) {
                            content = this.modelContent;
                        }
                        if (this.editor && this.editorReady) {
                            this.editor.setContent(content);
                        }
                    };

                    _NGUeditor.prototype.bindRender = function() {
                        var _self;
                        _self = this;
                        ctrl.$render = function() {
                            _self.modelContent = (ctrl.$isEmpty(ctrl.$viewValue) ? "" : ctrl.$viewValue);
                            _updateByRender = true;
                            _self.setEditorContent(_self.modelContent);
                        };
                    };

                    return _NGUeditor;
                })();
                new _NGUeditor();
            }
        };
    });

    //日期控件
    tableApp.controller('dateCtrl', function($scope) {
        $('.date').datepicker({
            autoclose: true,
            todayHighlight: true,
            language: 'zh-CN'
        });
    });

    //textarea编辑绑定ng-model，让textarea可以初始化数据（暂时没用到）
    tableApp.directive('contenteditable', function() {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
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

    //上传单张图片
    tableApp.directive('fileupload', function() {
        return {
            require: "?ngModel",
            link: function(scope, element, ngModel) {
                if (!ngModel) {
                    return;
                }

                function uploadsuccess(file, _data, response) {
                    var result = eval('(' + _data + ')');
                    var single_img = $('#single_img');
                    var input_list = '<input type="hidden" name="singlefile" value="' + result.data.id + '" />';
                    single_img.html(input_list);
                    $('#single_img_src').attr('src', result.data.fileurl);
                }
                element.uploadify({
                    'swf': '/js/plugins/uploadify/scripts/uploadify.swf',
                    　　　'uploader': '/common/public/fileupload',
                    fileObjName: 'Filedata',
                    buttonText: '请选择',
                    width: 50,
                    height: 20,
                    fileSizeLimit: '2000KB',
                    auto: true,
                    multi: true,
                    onUploadSuccess: uploadsuccess　　　
                });

            }
        }
    });

    //系统权限分配控制器
    tableApp.controller('editRole', function($scope, $http) {
        $scope.params = {};
        $scope.params.checkForm = $scope.checkForm = {};
        $http({
            method: 'post',
            url: "system/role/roleFields?id=" + editId,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(data) {
            $scope.repeatList = data;
            $scope.rendPage(data); //请求到数据后渲染页面
            $scope.loading = true; //设置加载loading值
        });

        //渲染页面函数
        $scope.rendPage = function(data) {
                var initformdata = data;
                for (var i = 0; i < initformdata.length; i++) {
                    $scope.checkForm[initformdata[i].value] = initformdata[i].checked;
                    if (initformdata[i].children) {
                        $scope.rendPage(initformdata[i].children);
                    }
                }
            }
            //点击全选子集
        $scope.checkLink = function(list, status, parentList1, parentList2) {
            if (parentList1) {
                var parent1Status = false;
                $.each(parentList1.children, function(n, v) {
                    if ($scope.checkForm[v.value]) {
                        parent1Status = true;
                        return;
                    }
                });
                $scope.checkForm[parentList1.value] = parent1Status;
            }
            if (parentList2) {
                var parent2Status = false;
                $.each(parentList2.children, function(n, v) {
                    if ($scope.checkForm[v.value]) {
                        parent2Status = true;
                        return;
                    }
                });
                $scope.checkForm[parentList2.value] = parent2Status;
            }
            if (list.children) {
                var initformdata = list.children;
                for (var i = 0; i < initformdata.length; i++) {
                    $scope.checkForm[initformdata[i].value] = status;
                    if (initformdata[i].children) {
                        $scope.checkLink(initformdata[i], status)
                    }
                }
            }
        }
        $scope.submit = function() {
            $scope.subUrl = 'system/role/editRoleSubmit?id=' + editId;
            $http({
                method: 'post',
                url: $scope.subUrl,
                data: $.param($scope.params),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
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
                    //$scope.SubmitBtn = submitTxt;
                    $scope.AddLoanForm.$invalid = false; // 释放重复操作控制
                    var msg = data.description ? data.description : "操作失败！";
                    layer.msg(msg, 1, 5);
                }
            });
        }
    });

}).call(this);
