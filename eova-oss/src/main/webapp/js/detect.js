define(function(require, exports, module) {
    exports.detect = function() {
        //require('raphael-debug');
        //咨询窗口
        $(function() {
            $('.service .sid').click(function() {
                if ($(this).hasClass('on')) {
                    $('.service .bd').animate({
                        marginLeft: 0
                    });
                    $(this).removeClass('on');
                } else {
                    $('.service .bd').animate({
                        marginLeft: -250
                    });
                    $(this).addClass('on');
                }
            })
        })

        //通知切换js
        $('#msgIndex .hd li').click(function() {
            var i = $(this).index();
            $(this).addClass('on').siblings().removeClass('on');
            $('#msgIndex .bd-item').eq(i).addClass('on').siblings().removeClass('on');
        })
        $('[data-rel=tooltip]').tooltip({
            container: 'body'
        });
        $('[data-rel=popover]').popover({
            html: true,
            container: 'body'
        });
        //配资进度效果
       /* window.onload = function() {
            var r = Raphael("holder", 120, 120),
                R = 50, //圆形半径      
                param = {
                    'stroke': "#27d697",
                    "stroke-width": 10
                }, //设置颜色 和边框
                hash = document.location.hash;
            r.customAttributes.arc = function(value, total, R) {
                var alpha = 360 / total * value,
                    a = (90 - alpha) * Math.PI / 180,
                    x = 56 + R * Math.cos(a),
                    y = 56 - R * Math.sin(a),
                    //color = "hsb(".concat(Math.round(R) / 20, ",", 1, ", )"),
                    path;
                if (total == value) {
                    path = [
                        ["M", 56, 56 - R],
                        ["A", R, R, 0, 1, 1, 55.99, 56 - R]
                    ];
                } else {
                    path = [
                        ["M", 56, 56 - R],
                        ["A", R, R, 0, +(alpha > 180), 1, x, y]
                    ];
                }
                return {
                    path: path
                };
            };

            //drawMarks(R, 60);
            var sec = r.path().attr(param).attr({
                arc: [0, 100, R]
            });

            //进度方法
            function progress(value, total, R, hand) {
                hand.animate({
                    arc: [value, total, R]
                }, 1500);
            }

            //进度实现
            var i = 0;
            var timer;
            var p = link;
            var t = 1500 / 90;
            var str = "";
            progress(p, 100, 50, sec);

            if (p == 100) {
                str = "恭喜您，运营基本材料已配置完成！"
            } else {
                str = "检测得分" + p + "分，建议您立即完善运营配置材料"
            }

            $('#PT').html(0);
            timer = setInterval(function() {
                i++;
                $('#PT').html(i);
                if (i >= p) {
                    clearInterval(timer);

                    $('#opTit').html(str);
                }
            }, t);
        };*/

        //查看信息
        $('.lookinfo').on('click', function() {
            var url = $(this).attr('data-url'),
                title = '查看';
            $.layer({
                type: 2,
                title: title,
                shadeClose: false,
                maxmin: true,
                fix: false,
                area: ['800px', 500],
                iframe: {
                    src: url
                },
                close: function(index) {
                    location.reload();
                }
            });
        });

    }
 exports.helpIcon = function() {
        $('[data-rel=tooltip]').tooltip({
            container: 'body'
        });
        $('[data-rel=popover]').popover({
            html: true,
            container: 'body'
        });
    }
    exports.message = function() {
        $.ajax({
            url: '/system/main/getAgree',
            type: 'POST',
            dataType: 'json',
            success: function(data) {
                if (data.status == '200') {
                    $.layer({
                        type: 2,
                        title: '协议详情',
                        shadeClose: false,
                        move: false,
                        fix: false,
                        area: [600, 470],
                        iframe: {
                            src: '/system/agree/LookSubmit&editid=' + data.data
                        },
                        close: function() {
                            window.location.href = "/system/public/logout";
                        }
                    });
                }
            }
        });

    }
})
