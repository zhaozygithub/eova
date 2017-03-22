var dyDir = angular.module("dyDir", [])
    .directive("dyjs", function() {
        return {
            restrict: 'ACE',
            replace: true,
            link: function(scope, element, attrs) {
                function infoBox() {
                    var htmlBox = $("html").height(),
                        navbarH = $(".navbar").outerHeight(),
                        crumbsH = $(".breadcrumbs").outerHeight(),
                        iframeBox = $('#iframe_box'),
                        srcBoxH = $(".form-horizontal").height(),
                        toolBoxH = $(".ui_dygrid_view").outerHeight(),
                        infoList = $(".info_list"),
                        pagesH = $(".pages").outerHeight();
                    var infoListH = htmlBox - srcBoxH - toolBoxH - pagesH;
                    //infoList.css('height', infoListH);  列表高度
                }
                element.ready(function() {
                    $(window).resize(function() {
                        infoBox();
                    });
                });
                //监听
                scope.$watch(attrs.dyjs, function() {
                    infoBox();
                });
            }

        }
    })
    // 文件上传指令
    .directive("snailUploadify", function() {
        return {
            scope: {},
            require: '?ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, ngModel) {
                var opts = angular.extend({}, scope.$eval(attrs.snailUploadify)),
                    aObj = opts.onUploadSuccess;
                var eleSiblings = element.siblings(".single-img-box");
                //上传单张
                function uploadSola(d) {
                        var result = eval("[" + d + "]")[0];
                        if (result.status == 200) {
                            var imgRemove = eleSiblings.find('.oldpic'),
                                imgAdd = eleSiblings.find('.newpic'),
                                imgLoad = "assets/css/images/loading.gif";
                            if (imgRemove) imgRemove.remove();
                            imgAdd.show();
                            imgAdd.attr("src", imgLoad);
                            imgAdd.attr("data-original", result.data.fileurl);
                            scope.$apply(function() {
                                ngModel.$setViewValue(result.data.id);
                            });
                        }
                        return false;
                    }
                    //上传多张
                function uploadMulti(d) {
                    var result = eval("[" + d + "]")[0];
                    if (result.status == 200) {
                        var g = ngModel.$viewValue ? ngModel.$viewValue : [],
                            m = [];
                        g.push({
                            imgurl: result.data.id,
                            minimg: result.data.fileurl,
                            title: ''
                        });
                        scope.$apply(function() {
                            ngModel.$setViewValue(g);
                        });
                    }
                    return false;
                }
                element.uploadify({
                    'fileObjName': opts.fileObjName || 'Filedata',
                    'auto': opts.auto != undefined ? opts.auto : true,
                    'swf': opts.swf || '/js/plugins/uploadify/scripts/uploadify.swf',
                    'uploader': opts.uploader || '/common/public/fileupload', //图片上传方法
                    'buttonImage': opts.buttonImage || '',
                    'buttonClass': opts.buttonClass || '',
                    'queueID': opts.queueID || '',
                    'queueSizeLimit': opts.queueSizeLimit || 999,
                    'buttonText': opts.buttonText || '请选择',
                    'width': opts.width || 50,
                    'height': opts.height || 32,
                    'fileSizeLimit': '2048KB',
                    'auto': opts.auto || false,
                    'onUploadSuccess': function(file, d, response) {
                        if (ngModel) {
                            if (aObj == 'uploadMulti') {
                                uploadMulti(d);
                            } else {
                                uploadSola(d);
                            }
                        }

                    }
                });
            }
        };
    })
    // 复选框指令
    .directive("checklistModel", ['$parse', '$compile', function($parse, $compile) {
        // contains
        function contains(arr, item) {
            if (angular.isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], item)) {
                        return true;
                    }
                }
            }
            return false;
        }

        // add
        function add(arr, item) {
            arr = angular.isArray(arr) ? arr : [];
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], item)) {
                    return arr;
                }
            }
            arr.push(item);
            return arr;
        }

        // remove
        function remove(arr, item) {
            if (angular.isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], item)) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
            return arr;
        }

        // http://stackoverflow.com/a/19228302/1458162
        function postLinkFn(scope, elem, attrs) {
            // compile with `ng-model` pointing to `checked`
            $compile(elem)(scope);

            // getter / setter for original model
            var getter = $parse(attrs.checklistModel);
            var setter = getter.assign;

            // value added to list
            var value = $parse(attrs.checklistValue)(scope.$parent);

            // watch UI checked change
            scope.$watch('checked', function(newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                var current = getter(scope.$parent);
                if (newValue === true) {
                    setter(scope.$parent, add(current, value));
                } else {
                    setter(scope.$parent, remove(current, value));
                }
            });

            // watch original model change
            scope.$parent.$watch(attrs.checklistModel, function(newArr, oldArr) {
                scope.checked = contains(newArr, value);
            }, true);
        }

        return {
            restrict: 'A',
            priority: 1000,
            terminal: true,
            scope: true,
            compile: function(tElement, tAttrs) {
                //if (tElement[0].tagName !== 'INPUT' || !tElement.attr('type', 'checkbox')) {
                if (tElement[0].tagName !== 'INPUT' || tAttrs.type !== 'checkbox') {
                    throw 'checklist-model should be applied to `input[type="checkbox"]`.';
                }

                if (!tAttrs.checklistValue) {
                    throw 'You should provide `checklist-value`.';
                }

                // exclude recursion
                tElement.removeAttr('checklist-model');

                // local scope var storing individual checkbox model
                tElement.attr('ng-model', 'checked');

                return postLinkFn;
            }
        };
    }])
    .directive("lazy", function($timeout) {
        return {
            restrict: 'AC',
            scope: {},
            link: function(scope, element, attrs) {
                function test(time) {
                    $timeout(function() {
                        element.lazyload({
                            effect: 'fadeIn',
                            effectspeed: 200,
                            skip_invisible: false
                        });
                    }, time);
                };
                scope.$watch(function() {
                    return element.attr('data-original');
                }, function() {
                    test(0);
                }, true);
            }
        };
    })
    .directive("helpIcon", function() {
        return {
            restrict: 'AC',
            scope: {},
            link: function(scope, element, attrs) {
                scope.$watch(element, function() {
                    $('[data-rel=tooltip]').tooltip();
                    $('[data-rel=popover]').popover();
                })

            }
        }
    });
