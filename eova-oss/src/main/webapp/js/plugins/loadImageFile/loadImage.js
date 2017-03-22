! function(a) {
    a.fn.loadImageFile = function(opts) {
        var defaults = {
            fileBox: '.file-box',
            imagePreview: '.imagePreview',
            imageInfo: '.imageInfo',
            width: '50',
            height: '50'
        };
        if (window.FileReader) {
            var oPreviewImg = null,
                oFReader = new window.FileReader(),
                rFilter = /^(?:image\/bmp|image\/gif|image\/jpeg|image\/png|image\/x\-icon)$/i;

            var options = $.extend({}, defaults, opts);
            var eFiles = a(this),
                aFiles = eFiles.prop('files'),
                bFiles = a(this).closest(options.fileBox),
                iFiles = bFiles.find(options.imageInfo),
                newPreview = bFiles.prev(options.imagePreview);
            if (aFiles.length === 0) {
                return;
            }
            if (!rFilter.test(aFiles[0].type)) {
                eFiles.value = '';
                newPreview.html('');
                iFiles.html('');
                alert("您必须选择一个有效的图片文件!");
                return;
            }
            oFReader.readAsDataURL(aFiles[0]);

            oFReader.onload = function(oFREvent) {
                if (!oPreviewImg) {
                    oPreviewImg = new Image();
                    oPreviewImg.style.height = options.height + "px";
                    newPreview.html(oPreviewImg);
                }
                oPreviewImg.src = oFREvent.target.result;
                iFiles.html(aFiles[0].name);
            };

        }
    }
}(jQuery);
