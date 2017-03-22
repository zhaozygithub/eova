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
        $('#' + form_id).on('submit', function() {
            $.ajax({
                url: 'finance/fee/editsubmit',
                data: $('#' + form_id).serialize(),
                type: 'post',
                dataType: 'json',
                success: function(data) {
                    if (data.status == 200) {
                        layer.msg(data.description, 1, 1, function() {
                            window.location.href = 'finance/loanfee/list';
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
    exports.CertificateFeeForm = function(form_id) {
    	$('#' + form_id).on('submit', function() {
    		$.ajax({
    			url: 'finance/certificatefee/editsubmit',
    			data: $('#' + form_id).serialize(),
    			type: 'post',
    			dataType: 'json',
    			success: function(data) {
    				if (data.status == 200) {
    					layer.msg(data.description, 1, 1, function() {
    						window.location.href = 'finance/certificatefee/list';
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
    };
	exports.uploadify=function(btn){
	    $("#"+btn).uploadify({
                'swf': 'js/plugins/uploadify/scripts/uploadify.swf',
                'uploader': 'common/public/fileupload',
                fileObjName: 'Filedata',
                buttonText: '请选择',
                width: 50,
                height: 20,
                fileSizeLimit: '2000KB',
                auto: true,
                multi: true,
                onUploadSuccess: function(file, _data, response) {
                    var img=$("#"+btn+"_img");
                    var hid=$("#"+btn+"_hid");
                    var result=$.parseJSON(_data);
                    console.log(result)
                    var data=result.data;
                    if(result.status==200){
                        hid.val(data.fileurl);
                        if(img.length){
                            img.attr("src",data.fileurl);  
                        }else{
                          $("#"+btn).before('<img src="'+data.fileurl+'" width="50" height="50" />');  
                        }
                    }
                }　　
            });
	};

 	//个人推广提现设置
    exports.OneSpreadConfigForm = function(form_id) {
        $('input[name=loan_status]').click(function(){
            var loan_status_val = $(this).val();
            if(loan_status_val==1){
                $('.loan_status_display').css('display','table-row')
            }else{
                $('.loan_status_display').css('display','none')
            }
        });
        $('input[name=tender_status]').click(function(){
            var tender_status_val = $(this).val();
            if(tender_status_val==1){
                $('.tender_status_display').css('display','table-row')
            }else{
                $('.tender_status_display').css('display','none')
            }
        })

        var url = window.location.href,
        urlHost = window.location.protocol + '//' + window.location.host + '/member/spread/member';

        require('validate');
        $('#OneSpreadConfigForm').validate({
             errorElement: 'font',
             errorClass:'font-wrong',
             errorPlacement: function(error, element) {
                 error.appendTo(element.parent().parent());
             },
             rules: {
                 loan_proportion: {
                     required: true,
                     number:true
                 },
                 loan_amount_type: {
                     required: true
                 },
                 loan_loan_category: {
                     required: true
                 },
                 tender_proportion: {
                     required: true,
                     number:true
                 },
                 tender_amount_type: {
                     required: true
                 },
                 tender_loan_category: {
                     required: true
                 }
             },
             messages: {
                 loan_proportion: {
                    required: '比例不能为空',
                    number:'比例必须是数字'
                 },
                 loan_amount_type: {
                     required: '资金类型不能为空'
                 },
                 loan_loan_category: {
                     required:'适合标种不能为空'
                 },
                 tender_proportion: {
                     required:'比例不能为空',
                     number:'比例必须是数字'
                 },
                 tender_amount_type: {
                     required: '资金类型不能为空'
                 },
                 tender_loan_category: {
                     required: '适合标种不能为空'
                 }
             },
             submitHandler: function(form) {
                $(form).ajaxSubmit({
                    type: 'post',
                    url: '/member/spread/OneEditConfigSubmit',
                    dataType: 'json',
                    success: function(data) {
                        if (data.status == '200') {
                            layer.msg(data.description, 1, 1, function() {
                                window.location.href = urlHost;
                            });
                        } else if (data.status == "250") {
                            parent.layer.msg(data.description, 2, 0, function() {
                                parent.window.location.href = "/system/public/login";
                            });
                        } else {
                            var msg = data.description ? data.description : "操作失败！";
                            layer.msg(msg, 1, 5);
                        }
                    }
                })
             }

        });

    }

    //ajax请求处理
    exports.judgeAjax = function(url, callbackFn, form) {
        require('submitform');
        $(form).ajaxSubmit({
            type: callbackFn.type ? callbackFn.type : 'post',
            url: url,
            success: function(data) {
               var dataType_json=(typeof(data)==="object");
                if (dataType_json) {
                    if (data.status == "250") {
                        parent.layer.msg(data.description, 2, 0, function() {
                            parent.window.location.href = "/system/public/login";
                        });
                    } else {
                        return callbackFn.json(data);
                    }
                } else {
                    return callbackFn.html(data);
                };
            },
            error: function() {
                parent.layer.msg('请求服务器出错', 2, 0);
            }
        });
        return false;
    }

    //商户充值
    exports.merchanRecharge = function(form_id){
    	
    	$('#' + form_id).on('submit', function() {
    		 if($("#amount").val() == ""){
	           alert("充值金额不能为空");
	           return false;
	        }
	        
    		$.ajax({
    			url: '/trust/trust/merchanRecharge',
    			data: $('#' + form_id).serialize(),
    			type: 'post',
    			dataType: 'json',
    			success: function(data) {
    				if (data.status == 200) {
    					parent.$.layer({
                            type: 1,
                            title: '温馨提示',
                            area: ['436px', '275px'],
                            page: {
                                url: '/finance/merchan/merchargeDialog'
                            },
                            close: function(index){
                            	parent.$("#easypaysubmit").remove();
                            }
                        });
                        parent.$('body').append(data.description.form);
    					
    				} else {
    					var msg = data.description ? data.description : "操作失败！";
    					parent.layer.msg(msg, 1, 5);
    				}
    			}
    		});
    		return false;
    	});
    }
    //商户提现
     exports.merchanWithdraw = function(form_id){
    	
    	$('#' + form_id).on('submit', function() {
    		 if($("#money").val() == ""){
	           alert("提现金额不能为空");
	           return false;
	        }
	        
    		$.ajax({
    			url: '/trust/trust/merchanWithdraw',
    			data: $('#' + form_id).serialize(),
    			type: 'post',
    			dataType: 'json',
    			success: function(data) {
    				if (data.status == 200) {
    					parent.$.layer({
                            type: 1,
                            title: '温馨提示',
                            area: ['436px', '275px'],
                            page: {
                                url: '/finance/merchan/merchargeDialog'
                            },
                            close: function(index){
                            	parent.$("#easypaysubmit").remove();
                            }
                        });
                        parent.$('body').append(data.description.form);
    					
    				} else {
    					var msg = data.description ? data.description : "操作失败！";
    					parent.layer.msg(msg, 1, 5);
    				}
    			}
    		});
    		return false;
    	});
    }
    exports.test = function(){
    	$(".skipOpen").live("click",function(){
    		$("#easypaysubmit").submit();
    	});
    	$(".complete").live("click",function(){
    		layer.closeAll()
    	});
    	
    }   
    exports._fileCtrl = function(form_id) {
        require('fileimage');
        $(form_id).on('change', function() {
            $(this).loadImageFile();
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
    
});
