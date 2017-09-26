'use strict';


var electron = require('electron');
var remote = electron.remote;
var dialog = remote.dialog;
var fs = require('fs');
var psd = require('psd');
var PNG = require('pngjs').PNG;


$('#select-file').on('click', function(){
	var options = {
		properties: ['openFile'],
		filters: [{ name: 'PSD File', extensions: ['psd']}]
	};
	var callback = function(files){
		//cancel
		if(!files || files.length === 0){
			return;
		}
		
		$('#select-file').addClass('disabled');
		
		openPSDFile(files[0]);
	}
	
	dialog.showOpenDialog(null, options, callback);
});


$('#save-img').on('click', function(){
	var imgCanvas = $('#img-canvas').get(0);
	var positionCanvas = $('#position-canvas').get(0);
	$('#save-canvas')
		.attr('width', imgCanvas.width.toString())
		.attr('height', imgCanvas.height.toString());
	var saveCanvas = $('#save-canvas').get(0);
	var saveCtx = saveCanvas.getContext('2d');
	
	saveCtx.clearRect(0, 0, saveCanvas.width, saveCanvas.height);
	
	var imgElm = getImageFromCanvas(imgCanvas);
	var positionElm = getImageFromCanvas(positionCanvas);
	
	drawImageToCanvas2(imgElm, saveCtx, function(){
		drawImageToCanvas2(positionElm, saveCtx, function(){
			var data = saveCanvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
			savePNG(data);
		});
	});
});


var savePNG = function(data){
	var options = {
		title: '保存',
		filters: [{name: 'PNGファイル', extensions: ['png']}]
	};
	
	var callback = function(filename){
		fs.writeFile(filename, data, 'base64', function (err) {
			if (err) {
				return console.error(err);
			}
		});
	}
	
	dialog.showSaveDialog(null, options, callback);
}


var drawImageToCanvas2 = function(img, ctx, cb){
	if(img.complete){
		ctx.drawImage(img, 0, 0);
		cb();
	}else{
		img.onload = function(){
			ctx.drawImage(img, 0, 0);
			cb();
		};
	}
}


var getImageFromCanvas = function(canvas){
	var image = new Image();
	image.src = canvas.toDataURL();
	return image;
}


var openPSDFile = function(file){
	var psd_file = psd.fromFile(file);
	psd_file.parse();
	
	createCanvas(psd_file.image);
	createLayerTable();
	
	forAllLayer(psd_file.tree(), function(node){
		appendLayerToTable(node.layer);
		appendCooridanteToCanvas(node.layer.left, node.layer.top);
	});
	
	$('#save-block').show();
};


var createCanvas = function(image){
	var imageElm = createImageElement(image);
	$('#img-canvas')
		.attr('width', image.width().toString())
		.attr('height', image.height().toString());
	
	$('#position-canvas')
		.attr('width', image.width().toString())
		.attr('height', image.height().toString());
	
	drawImageToCanvas2(imageElm, $('#img-canvas').get(0).getContext('2d'), function(){
		$('#img-block').show();
	});
};


var createProgressBar = function(){
	var progressBar = $('<div />').addClass('progress').attr('id', 'prog-bar');
	$('<div />').addClass('indeterminate').appendTo(progressBar);
	progressBar.insertAfter('#title-bar');
};


var deleteProgressBar = function(){
	$('#prog-bar').remove();
};


var forAllLayer = function(node, func){
	if(!node.hasChildren()){
		func(node);
		return;
	}
	
	node.children().forEach(function(child){
		forAllLayer(child, func);
	});
};


var createLayerTable = function(){
	$('#layer-table').show();
}


var appendLayerToTable = function(layer){
	var id = 'checkbox-' + layer.name.replace(/[^a-zA-Z0-9\-_:.]/g, '');
	
	var checkbox = $('<input />')
		.addClass("filled-in")
		.attr('id', id)
		.attr("type", "checkbox")
		.attr("checked", "checked");
	
	var label = $('<label />')
		.attr('for', id)
		.text(layer.name);
		
	var checkboxDiv = $('<div />')
		.append(checkbox)
		.append(label);
	
	var image = $(createImageElement(layer.image))
		.attr('height', '28');
	
	var tr = $('<tr />')
		.append($('<td />').append(checkboxDiv))
		.append($('<td />').text(layer.left))
		.append($('<td />').text(layer.top))
		.append($('<td />').text(layer.width))
		.append($('<td />').text(layer.height))
		.append($('<td />').addClass('right').append(image));

	$('#layer-table-body').append(tr);
};


var createImageElement = function(layerImage){
	var imageElm = new Image();
	var b64Data = PNG.sync.write(layerImage.toPng()).toString('base64');
	imageElm.src = "data:image/png;base64," + b64Data;
	return imageElm;
};


var appendCooridanteToCanvas = function(x, y){
	var ctx = $('#position-canvas').get(0).getContext('2d');
	ctx.fillRect(x - 1, y - 1, 3, 3);
	ctx.fillText('(' + x + ', ' + y + ')', x + 5, y + 10);
};
