(function() {
    function patternFU(value, rule) {
        return rule.test(value);
    }

    function noPatternFU(value, rule) {
        return !(rule.test(value));
    }
    var dyRule = {
        tel: /^0\d{2,3}-?\d{7,8}$/, //固定电话
        mobile: /^1[3|4|5|7|8][0-9]\d{8}$/, //手机号码
        telService: /^(400)-?(\d{3})-?(\d{4})$/, //客服电话
        noAllNumber: /^[0-9]*$/, //不能输入纯数字
        noAllLetter: /^[A-Za-z]*$/, //不能输入纯字母
        noSpecialStr: new RegExp("[%`~!@#$^&*()=|{}':;',\\[\\].<> /?~！@#￥……&*（）&;—|{}【】‘；：”“'。，、？\"\\\\+-]"), //不能含有特殊字符
        noZh: new RegExp("[\u4E00-\u9FA5]"), //不能含有中文字符
        inChar: /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{1,}$/, //非法字符
        noRepeat: new RegExp(/^(.)\1+$/), //同一个字符
        decimals: /^\d+(\.\d{1,2})?$/ //整数或保留小数点1~2位
    };

    function displayMessage(msg, name, type) {
        if (!msg) {
            return false;
        }
        var par = $('input[name=' + name + ']').parent() || $('textarea[name=' + name + ']').parent(),
            em = par.find('em');

        switch (type) {
            case 'success':
                if (em.hasClass('dy-validation')) {
                    em.find('.validation-valid').html(msg);
                }
                break;
            case 'error':
                if (em.hasClass('dy-validation')) {
                    em.find('.validation-invalid').html(msg);
                }
                break;
        }
    }
    angular.module('validation.rule', ['validation'])
        .run(["$rootScope", function($rootScope) {
            $rootScope.verifyInvalidCallback = function(type, options, name) {
                var message;
                switch (type) {
                    case 'range':
                        message = '请输入' + options.min + '~' + options.max + '之间值';
                        break;
                    case 'rangelength':
                        message = '请输入' + options.minlength + '~' + options.maxlength + '字符长度';
                        break;
                }
                displayMessage(message, name, 'error');
            };
            $rootScope.verifyValidCallback = function(type, options, name) {
                var message;
                switch (type) {
                    case 'range':
                        message = '';
                        break;
                    case 'rangelength':
                        message = '';
                        break;
                }
                displayMessage(message, name, 'success');
            }
        }])
        .config(['$validationProvider',
            function($validationProvider) {
                var rightMsg = "<i class='icon-ok-sign' style='font-size:16px;color:#438eb9;'></i>";
                var expression = {
                    required: function(value) {
                        return !!value;
                    },
                    required_nomsg: function(value) {
                        return !!value;
                    },
                    minlength: function(value, scope, element, attrs) {
                        return value.length >= attrs.minlength;
                    },
                    maxlength: function(value, scope, element, attrs) {
                        return value.length <= attrs.maxlength;
                    },
                    range: function(value, scope, element, attrs) {
                        if (value >= parseInt(attrs.min) && value <= parseInt(attrs.max)) {
                            return value;
                        }
                    },
                    rangelength: function(value, scope, element, attrs) {
                        var length = $.isArray(value) ? value.length : $.trim(value).length;
                        return length >= attrs.minlength && length <= attrs.maxlength;
                    },
                    pwdchar: function(value, scope, element, attrs, param) {
                        var paramArr = param ? param.replace(new RegExp("\\[\|\\]", "g"), '').split('|') : [0,99999],
                            valeg = value.length >= paramArr[0] && value.length <= paramArr[1];
                        if (value && (patternFU(value, dyRule.noAllNumber) || patternFU(value, dyRule.noRepeat) || patternFU(value, dyRule.noSpecialStr) || patternFU(value, dyRule.noAllLetter))) {
                            return false;
                        } else if (value && !valeg) {
                            return false;
                        } else {
                            return true;
                        }
                    },
                    equals: function (value, scope, element, attrs, param) {
                        var val = document.getElementsByName(param)[0].value;
                        return !val || value === val;
                    },
                    idcard: function(value) {
                        // 构造函数，变量为15位或者18位的身份证号码
                        function clsIDCard(CardNo) {
                            this.Valid = false;
                            this.ID15 = '';
                            this.ID18 = '';
                            this.Local = '';
                            if (CardNo != null) this.SetCardNo(CardNo);
                        }
                        // 设置身份证号码，15位或者18位
                        clsIDCard.prototype.SetCardNo = function(CardNo) {
                                this.ID15 = '';
                                this.ID18 = '';
                                this.Local = '';
                                CardNo = CardNo.replace(" ", "");
                                var strCardNo;
                                if (CardNo.length == 18) {
                                    pattern = /^\d{17}(\d|x|X)$/;
                                    if (pattern.exec(CardNo) == null) return;
                                    strCardNo = CardNo.toUpperCase();
                                } else {
                                    pattern = /^\d{15}$/;
                                    if (pattern.exec(CardNo) == null) return;
                                    strCardNo = CardNo.substr(0, 6) + '19' + CardNo.substr(6, 9)
                                    strCardNo += this.GetVCode(strCardNo);
                                }
                                this.Valid = this.CheckValid(strCardNo);
                            }
                            // 校验身份证有效性
                        clsIDCard.prototype.IsValid = function() {
                                return this.Valid;
                            }
                            // 返回生日字符串，格式如下，1981-10-10
                        clsIDCard.prototype.GetBirthDate = function() {
                                var BirthDate = '';
                                if (this.Valid) BirthDate = this.GetBirthYear() + '-' + this.GetBirthMonth() + '-' + this.GetBirthDay();
                                return BirthDate;
                            }
                            // 返回生日中的年，格式如下，1981
                        clsIDCard.prototype.GetBirthYear = function() {
                                var BirthYear = '';
                                if (this.Valid) BirthYear = this.ID18.substr(6, 4);
                                return BirthYear;
                            }
                            // 返回生日中的月，格式如下，10
                        clsIDCard.prototype.GetBirthMonth = function() {
                                var BirthMonth = '';
                                if (this.Valid) BirthMonth = this.ID18.substr(10, 2);
                                if (BirthMonth.charAt(0) == '0') BirthMonth = BirthMonth.charAt(1);
                                return BirthMonth;
                            }
                            // 返回生日中的日，格式如下，10
                        clsIDCard.prototype.GetBirthDay = function() {
                                var BirthDay = '';
                                if (this.Valid) BirthDay = this.ID18.substr(12, 2);
                                return BirthDay;
                            }
                            // 返回性别，1：男，0：女
                        clsIDCard.prototype.GetSex = function() {
                                var Sex = '';
                                if (this.Valid) Sex = this.ID18.charAt(16) % 2;
                                return Sex;
                            }
                            // 返回15位身份证号码
                        clsIDCard.prototype.Get15 = function() {
                                var ID15 = '';
                                if (this.Valid) ID15 = this.ID15;
                                return ID15;
                            }
                            // 返回18位身份证号码
                        clsIDCard.prototype.Get18 = function() {
                                var ID18 = '';
                                if (this.Valid) ID18 = this.ID18;
                                return ID18;
                            }
                            // 返回所在省，例如：上海市、浙江省
                        clsIDCard.prototype.GetLocal = function() {
                            var Local = '';
                            if (this.Valid) Local = this.Local;
                            return Local;
                        }
                        clsIDCard.prototype.GetVCode = function(CardNo17) {
                            var Wi = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1);
                            var Ai = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
                            var cardNoSum = 0;
                            for (var i = 0; i < CardNo17.length; i++) cardNoSum += CardNo17.charAt(i) * Wi[i];
                            var seq = cardNoSum % 11;
                            return Ai[seq];
                        }
                        clsIDCard.prototype.CheckValid = function(CardNo18) {
                            if (this.GetVCode(CardNo18.substr(0, 17)) != CardNo18.charAt(17)) return false;
                            if (!this.IsDate(CardNo18.substr(6, 8))) return false;
                            var aCity = {
                                11: "北京",
                                12: "天津",
                                13: "河北",
                                14: "山西",
                                15: "内蒙古",
                                21: "辽宁",
                                22: "吉林",
                                23: "黑龙江 ",
                                31: "上海",
                                32: "江苏",
                                33: "浙江",
                                34: "安徽",
                                35: "福建",
                                36: "江西",
                                37: "山东",
                                41: "河南",
                                42: "湖北 ",
                                43: "湖南",
                                44: "广东",
                                45: "广西",
                                46: "海南",
                                50: "重庆",
                                51: "四川",
                                52: "贵州",
                                53: "云南",
                                54: "西藏 ",
                                61: "陕西",
                                62: "甘肃",
                                63: "青海",
                                64: "宁夏",
                                65: "新疆",
                                71: "台湾",
                                81: "香港",
                                82: "澳门",
                                91: "国外"
                            };
                            if (aCity[parseInt(CardNo18.substr(0, 2))] == null) return false;
                            this.ID18 = CardNo18;
                            this.ID15 = CardNo18.substr(0, 6) + CardNo18.substr(8, 9);
                            this.Local = aCity[parseInt(CardNo18.substr(0, 2))];
                            return true;
                        }
                        clsIDCard.prototype.IsDate = function(strDate) {
                            var r = strDate.match(/^(\d{1,4})(\d{1,2})(\d{1,2})$/);
                            if (r == null) return false;
                            var d = new Date(r[1], r[2] - 1, r[3]);
                            return (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[2] && d.getDate() == r[3]);
                        }
                        var checkFlag = new clsIDCard(value);
                        if (!checkFlag.IsValid()) {
                            return false;
                        } else {
                            return true;
                        }
                    },
                    url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
                    email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
                    number: /^\d+$/,
                    phone: /^1[3|4|5|7|8][0-9]\d{8}$/,
                    decimals: function(value, scope, element, attrs, param) {
                    	return !value ||　patternFU(value, dyRule.decimals);
                    },
                    decimals_nomsg: /^\d+(\.\d{1,2})?$/,
                    gt_decimals: /^(?!0(\d|\.0+$|$))\d+(\.\d{1,2})?$/,
                    ne_decimals: /^(-)?(?!0(\d|\.0+$|$))\d+(\.\d{1,2})?$/,
                    gt_decimals_nomsg: /^(?!0(\d|\.0+$|$))\d+(\.\d{1,2})?$/,
                    qq: /^[1-9][0-9]{4,}$/,
                    inter: /^[0-9]\d*$/,
                    inter_nomsg: /^[0-9]\d*$/,
                    pinter: /^[1-9]\d*$/,
                    pinter_nomsg: /^[1-9]\d*$/,
                    username: /^[a-zA-Z][a-zA-Z0-9]{3,15}$/,
                    decimals_unit: /^\d+(\.\d{1,2})?[元|%]$/,
                    tel: /^0\d{2,3}-?\d{7,8}$/,
                    telphone: function(value, element) {
                        function tel(val) {
                            return /^0\d{2,3}-?\d{7,8}$/.test(val);
                        }

                        function mobile(val) {
                            return /^1[3|4|5|7|8][0-9]\d{8}$/.test(val);
                        }

                        function telTodo(val) {
                            if (tel(val) || mobile(val)) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                        return telTodo(value);
                    }
                };

                var defaultMsg = {
                    required: {
                        error: '此处为必填!',
                        success: ''
                    },
                    required_nomsg: {
                        error: '',
                        success: ''
                    },
                    minlength: {
                        error: '不能小于最小值限制',
                        success: ''
                    },
                    maxlength: {
                        error: '不能大于最大值限制',
                        success: ''
                    },
                    range: {
                        error: '请输入0~1之间值',
                        success: ''
                    },
                    rangelength: {
                        error: '',
                        success: ''
                    },
                    pwdchar: {
                        error: '请输入{0}~{1}位的英文和数字组合',
                        success: ''
                    },
                    equals: {
                        error: '两次输入不一致',
                        success: ''
                    },
                    idcard: {
                        error: '请填写有效身份证号码',
                        success: ''
                    },
                    url: {
                        error: '请填写正确的url地址!',
                        success: ''
                    },
                    email: {
                        error: '请填写正确的邮箱地址!',
                        success: ''
                    },
                    number: {
                        error: '请填写整数格式!',
                        success: ''
                    },
                    phone: {
                        error: '请填写正确手机格式!',
                        success: ''
                    },
                    decimals: {
                        error: '请填写整数或最多保留两位小数格式!',
                        success: ''
                    },
                    decimals_nomsg: {
                        error: '',
                        success: ''
                    },
                    gt_decimals: {
                        error: '请填写大于0的数值或最多保留两位小数格式!',
                        success: ''
                    },
                    ne_decimals: {
                        error: '请填写非0的数值或最多保留两位小数格式!',
                        success: ''
                    },
                    gt_decimals_nomsg: {
                        error: '',
                        success: ''
                    },
                    qq: {
                        error: '请填写正确QQ格式!',
                        success: ''
                    },
                    inter: {
                        error: '请填写整数格式!',
                        success: ''
                    },
                    inter_nomsg: {
                        error: '',
                        success: ''
                    },
                    pinter: {
                        error: '请填写正整数格式!',
                        success: ''
                    },
                    pinter_nomsg: {
                        error: '',
                        success: ''
                    },
                    username: {
                        error: '请填写以字母开头4-16位的英文、数字或组合!',
                        success: ''
                    },
                    decimals_unit: {
                        error: '',
                        success: ''
                    },
                    tel: {
                        error: '电话格式有误',
                        success: ''
                    },
                    telphone: {
                        error: '电话格式有误',
                        success: ''
                    }
                };

                $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);

            }
        ]);

}).call(this);
