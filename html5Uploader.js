(function ($) {

    $.fn.html5Uploader = function (options) {

        var crlf = '\r\n';
        var boundary = "iloveigloo";
        var dashes = "--";

        var settings = {
            "name": "uploadedFile",
            "drop": null,
            "maxFilesCount": 10,
            "postUrl": "upload.php",
            "onSelectFile": null,
            "multipart_params": null,
            "onClientAbort": null,
            "onClientError": null,
            "onClientLoad": null,
            "onClientLoadEnd": null,
            "onClientLoadStart": null,
            "onClientProgress": null,
            "onServerAbort": null,
            "onServerError": null,
            "onServerLoad": null,
            "onServerLoadStart": null,
            "onServerProgress": null,
            "onServerReadyStateChange": null,
            "onSuccess": null,
            "onError": null,
            "acceptFileTypes": /(\.|\/)(gif|jpe?g|png|zip)$/i,
            "maxFileSize": 100000000 // 100 MB
        };
        
        // Error and info messages:
        var errors = {
            maxNumberOfFiles: 'Maximum number of files exceeded',
            acceptFileTypes: 'File type not allowed',
            maxFileSize: 'File is too large',
            minFileSize: 'File is too small'
        };

        if (options) {
            $.extend(settings, options);
        }

        return this.each(function (options) {
            var $this = $(this);

            $this.bind("change", function () {
                var files = this.files;

                if(files.length > settings.maxFilesCount) {
	                //alert('maxFilesCount');
	                settings.onError(errors.maxNumberOfFiles);
                } else {
	                for (var i = 0; i < files.length; i++) {
	                    validation(files[i]);
	                }
                }
            });
                
            if(settings.drop) {
                $this
                .bind("dragenter dragover", function () {
                    $(this).addClass("hover");
                    return false;
                })
                .bind("dragleave", function () {
                    $(this).removeClass("hover");
                    return false;
                })
                .bind("drop", function (e) {
                    $(this).removeClass("hover");
                    var files = e.originalEvent.dataTransfer.files;
                    for (var i = 0; i < files.length; i++) {
	                    validation(files[i]);
                    }
                    return false;
                });
            }

        });
        
        function validation(file) {
	        var error = false;
	        if(file.size > settings.maxFileSize) {
		        error = true;
		        //alert('maxFileSize');
		        settings.onError(errors.maxFileSize);
	        }
	        if(settings.acceptFileTypes && !(settings.acceptFileTypes.test(file.type) || settings.acceptFileTypes.test(file.name))) {
		        error = true;
				//alert('acceptFileTypes');
				settings.onError(errors.acceptFileTypes);
            }
            
            if(error) {
	            //alert('Ошибка!');
	            settings.onError('Ошибка!');
                //return fileHandler(file);
            } else {
                return fileHandler(file);
            }
            
            
        } 

        function fileHandler(file) {
            var fileReader = new FileReader();
            
            settings.onSelectFile(file);

            fileReader.onabort = function (e) {
                if (settings.onClientAbort) {
                    settings.onClientAbort(e, file);
                }
            };
            fileReader.onerror = function (e) {
                if (settings.onClientError) {
                    settings.onClientError(e, file);
                }
            };
            fileReader.onload = function (e) {
                if (settings.onClientLoad) {
                    settings.onClientLoad(e, file);
                }
            };
            fileReader.onloadend = function (e) {
                if (settings.onClientLoadEnd) {
                    settings.onClientLoadEnd(e, file);
                }
            };
            fileReader.onloadstart = function (e) {
                if (settings.onClientLoadStart) {
                    settings.onClientLoadStart(e, file);
                }
            };
            fileReader.onprogress = function (e) {
                if (settings.onClientProgress) {
                    settings.onClientProgress(e, file);
                }
            };
            fileReader.readAsDataURL(file);

            var xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.upload.onabort = function (e) {
                if (settings.onServerAbort) {
                    settings.onServerAbort(e, file);
                }
            };
            xmlHttpRequest.upload.onerror = function (e) {
                if (settings.onServerError) {
                    settings.onServerError(e, file);
                }
            };
            xmlHttpRequest.upload.onload = function (e) {
                if (settings.onServerLoad) {
                    settings.onServerLoad(e, file);
                }
            };
            xmlHttpRequest.upload.onloadstart = function (e) {
                if (settings.onServerLoadStart) {
                    settings.onServerLoadStart(e, file);
                }
            };
            xmlHttpRequest.upload.onprogress = function (e) {
	            var done = e.loaded, total = e.total;
                var loaded = ((Math.floor(done/total*100)/1) + '%');
                
                if (settings.onServerProgress) {
                    settings.onServerProgress(e, file, loaded);
                }
            };
            xmlHttpRequest.onreadystatechange = function (e) {
                if (settings.onServerReadyStateChange) {
                    settings.onServerReadyStateChange(e, file, xmlHttpRequest.readyState);
                }
                if (settings.onSuccess && xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
                    settings.onSuccess(e, file, xmlHttpRequest.responseText);
                }
            };
            xmlHttpRequest.open("POST", settings.postUrl, true);

            if (file.getAsBinary) { // Firefox

                var data = dashes + boundary + crlf +
                    "Content-Disposition: form-data;" +
                    "name=\"" + settings.name + "\";" +
                    "filename=\"" + unescape(encodeURIComponent(file.name)) + "\"" + crlf +
                    "Content-Type: application/octet-stream" + crlf + crlf +
                    file.getAsBinary() + crlf +
                    dashes + boundary + dashes;

                xmlHttpRequest.setRequestHeader("Content-Type", "multipart/form-data;boundary=" + boundary);
                xmlHttpRequest.sendAsBinary(data);

            } else if (window.FormData) { // Chrome

                var formData = new FormData();
                formData.append(settings.name, file);

                if(settings.multipart_params) {
					$.each(settings.multipart_params, function(key, value) {                    
						formData.append(key,value);
					}); 
                }

                xmlHttpRequest.send(formData);

            }
        }

    };

})(jQuery);
