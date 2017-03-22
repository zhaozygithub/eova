define(function(require, exports, module) {
    exports.menu = function() {
        $("#sidebar ul li a").live("click", function() {
            $("#sidebar ul li").removeClass("active");
            $(this).parents("li").addClass("active");
            var url = $(this).attr('rel');
            if (url != '' || url != '#') {
                $('#iframe_box').attr('src', url);
            }
        });

        function iframeH() {
            var t = $("#iframe_box").offset().top,
                c_h = $(window).height();
            $("#iframe_box").height(c_h - t - 55);
        }
        $(document).ready(function() {
            iframeH();
            window.onresize = function() {
                iframeH();
            }
        })
    }

    exports.editor = function() {
        require('umeditor');
        require('umeditorC');
        $(document).ready(function() {

            window.um = UM.getEditor('myEditor');
        })
    }

    //借款费用修改提交
    exports.BorrowForm = function(form_id) {
        var url = window.location.href,
            urlHost = window.location.protocol + '//' + window.location.host + '/finance/fee/borrow';
        $('#' + form_id).on('submit', function() {
            $.ajax({
                url: '/finance/fee/editsubmit',
                data: $('#' + form_id).serialize(),
                type: 'post',
                dataType: 'json',
                success: function(data) {
                    if (data.status == 200) {
                        layer.msg(data.description, 1, 1, function() {
                            window.location.href = urlHost;
                        });
                    } else {
                        var msg = data.description ? data.description : "操作失败！";
                        layer.msg(msg, 1, 5);
                    }
                }
            });
            return false;
        });
    }

    //借款费用修改提交
    exports.SpreadConfigForm = function(form_id) {
        var url = window.location.href,
            urlHost = window.location.protocol + '//' + window.location.host + '/member/spread/config';
        $('#' + form_id).on('submit', function() {
            $.ajax({
                url: '/member/spread/editConfigSubmit',
                data: $('#' + form_id).serialize(),
                type: 'post',
                dataType: 'json',
                success: function(data) {
                    if (data.status == 200) {
                        layer.msg(data.description, 1, 1, function() {
                            window.location.href = urlHost;
                        });
                    } else {
                        var msg = data.description ? data.description : "操作失败！";
                        layer.msg(msg, 1, 5);
                    }
                }
            });
            return false;
        });
    }

    //支付方式修改提交
    exports.PaymentForm = function(form_id) {
            var url = window.location.href,
                urlHost = window.location.protocol + '//' + window.location.host + '/finance/payment/list';
            $('#' + form_id).on('submit', function() {
                $.ajax({
                    url: '/finance/payment/editsubmit',
                    data: $('#' + form_id).serialize(),
                    type: 'post',
                    dataType: 'json',
                    success: function(data) {
                        if (data.status == 200) {
                            layer.msg(data.description, 1, 1, function() {
                                window.location.href = urlHost;
                            });
                        } else {
                            var msg = data.description ? data.description : "操作失败！";
                            layer.msg(msg, 1, 5);
                        }
                    }
                });
                return false;
            });
        }
        //邮箱配置设置
    exports.emailCtrl = function(form_id, test_id) {
        exports._ajaxCtrl(form_id);
        exports._ajaxCtrl(test_id);
    }

    exports._ajaxCtrl = function(form_id) {
        var url = $(form_id).attr('data-url');
        $(form_id).on('submit', function(event) {
            require('submitform');
            $(this).ajaxSubmit({
                url: url,
                type: 'POST',
                dataType: 'json',
                success: function(data) {
                    if (data.status == 200) {
                        layer.msg(data.description, 1, 1, function() {
                            location.reload();
                        });
                    } else {
                        layer.msg(data.description, 1, 3);
                        return false;
                    }
                }
            });
            return false;
        });
    }

    //显示图片
    exports.imgShow = function(img_id) {
        $(img_id).on('click', function() {
            $.layer({
                type: 1,
                title: false,
                fix: false,
                area: ['800', 'auto'],
                page: {
                    html: '<img src=' + $(this).attr("src") + ' width="800">'
                }
            })
        });
    }

})
