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
    .directive("snailUploadify", function($timeout) {
        return {
            scope: {},
            require: '?ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, ngModel) {
                var eleSiblings = element.siblings(".single-img-box"),
                	sessionId = attrs.sessionId, 
                    tempOpt = {},
                    ajaxResult = function(data) {
                        try {
                            return eval('(' + data + ')');
                        } catch (e) {
                            return false;
                        }
                    },
                    optFu = function(name) {
                        switch (name) {
                            case 'uploadMulti': //上传多张
                                return tempOpt = {
                                	auto: false,
                                    onUploadSuccess: function(file, d, response) {
                                        var result = ajaxResult(d);
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
                                        } else {
                                            layer.msg('上传失败！', 1, 8);
                                        }
                                    }
                                }
                                break;
                            case 'uploadSola': //上传单张
                                return tempOpt = {
                                    onUploadSuccess: function(file, d, response) {
                                        var result = ajaxResult(d);
                                        if (result.status == 200) {
                                            var imgRemove = eleSiblings.find('.oldpic'),
                                                imgAdd = eleSiblings.find('.newpic'),
                                                imgLoad = "/assets/css/images/loading.gif";
                                            if (imgRemove) imgRemove.remove();
                                            imgAdd.show();
                                            imgAdd.attr("src", imgLoad);
                                            imgAdd.attr("data-original", result.data.fileurl);
                                            scope.$apply(function() {
                                                ngModel.$setViewValue(result.data.id);
                                            });
                                        } else {
                                            layer.msg('上传失败！', 1, 8);
                                        }
                                    }
                                }
                                break;
                            case 'uploadSolaFile': //上传单个附件
                                return tempOpt = {
                                    auto: true,
                                    queueSizeLimit: 1,
                                    fileSizeLimit: '20MB',
                                    fileTypeExts: '*.apk',
                                    onUploadSuccess: function(file, d, response) {
                                        var result = ajaxResult(d);
                                        if (result.status == 200) {
                                            var g = ngModel.$viewValue ? ngModel.$viewValue : '';
                                            g = result.data.fileurl
                                            scope.$apply(function() {
                                                ngModel.$setViewValue(result.data.fileurl);
                                            });
                                        } else {
                                            layer.msg('上传失败！', 1, 8);
                                        }
                                    }
                                }
                                break;
                            case 'uploadMultiFile': //上传多个附件
                                return tempOpt = {
                                    fileSizeLimit: '20MB',
                                    fileTypeExts: '*.apk;*.rar;*.zip',
                                    onUploadSuccess: function(file, d, response) {
                                        var result = ajaxResult(d);
                                        if (result.status == 200) {
                                            var g = ngModel.$viewValue ? ngModel.$viewValue : [],
                                                m = [];
                                            g.push({
                                                file_url: result.data.fileurl,
                                                url: result.data.id,
                                                name: file.name
                                            });
                                            scope.$apply(function() {
                                                ngModel.$setViewValue(g);
                                            });
                                        } else {
                                            layer.msg('上传失败！', 1, 8);
                                        }
                                    }
                                }
                                break;
                        }
                    };
                var defaultOpts = {
                    'fileObjName': 'Filedata',
                    'auto': true,
                    'swf': '/js/plugins/uploadify/scripts/uploadify.swf',
                    'uploader': attrs.uploader || 'common/public/fileupload', //上传方法
                    'buttonImage': '',
                    'buttonClass': '',
                    'queueID': '',
                    'queueSizeLimit': 999,
                    'buttonText': '请选择',
                    'width': 50,
                    'height': 32,
                    'fileSizeLimit': '2048KB',
                    'fileTypeExts': '*.gif; *.jpg; *.png',
                    'onUploadSuccess': function(file, d, response) {
                        uploadSola(d);
                    }
                };
                $timeout(function() {
                    var options = scope.$eval(attrs.snailUploadify),
                    	opts = angular.extend({}, defaultOpts, options, optFu(options.onUploadSuccess)),
                    	opts = angular.extend({}, opts, {uploader: opts.uploader + ';jsessionid=' + sessionId});
                    $('#' + attrs.id).uploadify(opts);
                    $('.file_upload').on('click', function() {
                        var than = $(this).attr('data-id');
                        $('#' + than).uploadify('upload', '*');
                    });
                });
            }
        };
    })
    //复选框指令
    .directive('checklistModel', ['$parse', '$compile', function ($parse, $compile) {
        // contains
        function contains(arr, item, comparator) {
            if (angular.isArray(arr)) {
                for (var i = arr.length; i--;) {
                    if (comparator(arr[i], item)) {
                        return true;
                    }
                }
            }
            return false;
        }

        // add
        function add(arr, item, comparator) {
            arr = angular.isArray(arr) ? arr : [];
            if (!contains(arr, item, comparator)) {
                arr.push(item);
            }
            return arr;
        }

        // remove
        function remove(arr, item, comparator) {
            if (angular.isArray(arr)) {
                for (var i = arr.length; i--;) {
                    if (comparator(arr[i], item)) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
            return arr;
        }

        // http://stackoverflow.com/a/19228302/1458162
        function postLinkFn(scope, elem, attrs) {
            // exclude recursion, but still keep the model
            var checklistModel = attrs.checklistModel;
            attrs.$set("checklistModel", null);
            // compile with `ng-model` pointing to `checked`
            $compile(elem)(scope);
            attrs.$set("checklistModel", checklistModel);

            // getter / setter for original model
            var getter = $parse(checklistModel);
            var setter = getter.assign;
            var checklistChange = $parse(attrs.checklistChange);
            var checklistBeforeChange = $parse(attrs.checklistBeforeChange);

            // value added to list
            var value = attrs.checklistValue ? $parse(attrs.checklistValue)(scope.$parent) : attrs.value;


            var comparator = angular.equals;

            if (attrs.hasOwnProperty('checklistComparator')) {
                if (attrs.checklistComparator[0] == '.') {
                    var comparatorExpression = attrs.checklistComparator.substring(1);
                    comparator = function (a, b) {
                        return a[comparatorExpression] === b[comparatorExpression];
                    };

                } else {
                    comparator = $parse(attrs.checklistComparator)(scope.$parent);
                }
            }

            // watch UI checked change
            scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }

                if (checklistBeforeChange && (checklistBeforeChange(scope) === false)) {
                    scope[attrs.ngModel] = contains(getter(scope.$parent), value, comparator);
                    return;
                }

                setValueInChecklistModel(value, newValue);

                if (checklistChange) {
                    checklistChange(scope);
                }
            });

            function setValueInChecklistModel(value, checked) {
                var current = getter(scope.$parent);
                if (angular.isFunction(setter)) {
                    if (checked === true) {
                        setter(scope.$parent, add(current, value, comparator));
                    } else {
                        setter(scope.$parent, remove(current, value, comparator));
                    }
                }

            }

            // declare one function to be used for both $watch functions
            function setChecked(newArr, oldArr) {
                if (checklistBeforeChange && (checklistBeforeChange(scope) === false)) {
                    setValueInChecklistModel(value, scope[attrs.ngModel]);
                    return;
                }
                scope[attrs.ngModel] = contains(newArr, value, comparator);
            }

            // watch original model change
            // use the faster $watchCollection method if it's available
            if (angular.isFunction(scope.$parent.$watchCollection)) {
                scope.$parent.$watchCollection(checklistModel, setChecked);
            } else {
                scope.$parent.$watch(checklistModel, setChecked, true);
            }
        }

        return {
            restrict: 'A',
            priority: 1000,
            terminal: true,
            scope: true,
            compile: function (tElement, tAttrs) {
                if ((tElement[0].tagName !== 'INPUT' || tAttrs.type !== 'checkbox') && (tElement[0].tagName !== 'MD-CHECKBOX') && (!tAttrs.btnCheckbox)) {
                    throw 'checklist-model should be applied to `input[type="checkbox"]` or `md-checkbox`.';
                }

                if (!tAttrs.checklistValue && !tAttrs.value) {
                    throw 'You should provide `value` or `checklist-value`.';
                }

                // by default ngModel is 'checked', so we set it if not specified
                if (!tAttrs.ngModel) {
                    // local scope var storing individual checkbox model
                    tAttrs.$set("ngModel", "checked");
                }

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
    })
    
    .directive("colorBox", function() {
        return {
            scope: {},
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, element, attrs, ctrl) {
                var colorbox_params = {
                    reposition: true,
                    scalePhotos: true,
                    scrolling: false,
                    previous: '<i class="icon-arrow-left"></i>',
                    next: '<i class="icon-arrow-right"></i>',
                    close: '&times;',
                    current: '{current} of {total}',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    onOpen: function() {
                        document.body.style.overflow = 'hidden';
                    },
                    onClosed: function() {
                        document.body.style.overflow = 'auto';
                    },
                    onComplete: function() {
                        $.colorbox.resize();
                    }
                };

                $(element).colorbox(colorbox_params);
                //$("#cboxLoadingGraphic").append("<i class='icon-spinner orange'></i>");
                //let's add a custom loading icon
            }
        }
    })
    
    .directive("datePicker", function($injector) {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                var defaults, options;
                scope.deVal = element.attr('data-default-val') ? element.attr('data-default-val') : '';
                ngModel.$render = function() {
                    element.val(ngModel.$viewValue || scope.deVal);
                };
                var typeArr = new Array('start_time', 'end_time','min_today_time');
                // Write data to the model
                function read() {
                    var val = element.val();
                    ngModel.$setViewValue(val);
                }

                function contains(arr, obj) {
                    var i = arr.length;
                    while (i--) {
                        if (arr[i] === obj) {
                            return true;
                        }
                    }
                    return false;
                }

                function setPicker(than) {
                    if (contains(typeArr, than)) {
                        WdatePicker(options);
                    } else {
                        WdatePicker({
                            el: attrs.id
                        });
                    }
                }

                defaults = {
                    readOnly: true,
                    dateFmt: 'yyyy-MM-dd'
                }

                switch (attrs.id) {
                    case 'start_time':
                        options = {
                            maxDate: '#F{$dp.$D(\'end_time\')}',
                            el: 'start_time'
                        };
                        break;
                    case 'end_time':
                        options = {
                            minDate: '#F{$dp.$D(\'start_time\')}',
                            el: 'end_time'
                        };
                        break;
                    case 'min_today_time':
                        options = {
                            minDate: '%y-%M-%d',
                            el: 'min_today_time'
                        };
                        break;
                }

                options = angular.extend({}, options, defaults, scope.$eval(attrs.datePicker));
                element.on("focus click", function() {
                    setPicker(attrs.id);
                    scope.$apply(read);
                });
                $('.date-picker-icon').on('click', function() {
                    setPicker($(this).prev().attr('id'));
                });
            }
        }
    }).directive('ueditor', function($timeout) {
        return {
            require: '?ngModel',
            scope: {},
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
                        _editorId = attr.id ? attr.id : "_editor_" + element[0].name + parseInt(Math.random() * 90000000 + 10000000, 10);
                        element[0].id = _editorId;
                        this.editor = UM.getEditor(_editorId);
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
                            if (_self.modelContent.length > 0) {
                                _self.setEditorContent();
                            }
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
                            _self.setEditorContent();
                        };
                    };

                    return _NGUeditor;

                })();
                new _NGUeditor();
            }
        };
    })
    
    .directive('dyRank', function() {
    return {
        require:'ngModel',
        scope:{},
        link:function(scope, elm, attrs, ctrl) {
        	attrs.$observe("min",function(value){
        		if(!value) { return undefined; }
        		else{
    			 	ctrl.$parsers.unshift(function(viewValue) {
		                if (viewValue<parseFloat(attrs.min) || viewValue>parseFloat(attrs.max)|| viewValue%parseInt(attrs.mult)) {
		                    ctrl.$setValidity('dyRank', false);
		                    return undefined;
		                } else {
		                    ctrl.$setValidity('dyRank', true);
		                    return viewValue;
		                }
		            });
        		}
        	});
           
        }
    };
    
});
