'use strict';


var electron = require('electron');
var remote = electron.remote;
var dialog = remote.dialog;
var psd = require('psd');
var PNG = require('pngjs').PNG;


$('#file_select').on('click', function(){
	var currentWindow = remote.getCurrentWindow();

	dialog.showOpenDialog(
		currentWindow, 
		{
			properties: ['openFile'],
			filters: [{ name: 'PSD File', extensions: ['psd']}]
		},
		function(files){
			//cancel
			if(!files || files.length === 0){
				return;
			}
			
			$('#file_select').addClass('disabled');
			
			openPSDFile(files[0]);
		}
	);
});


var openPSDFile = function(file){
	var psd_file = psd.fromFile(file);
	psd_file.parse();
	console.log(psd_file);
	
	createCanvas(psd_file.image);
	
	createLayerTable();
	
	forAllLayer(psd_file.tree(), function(node){
		appendLayerToTable(node.layer);
		appendCooridanteToCanvas(node.layer.left, node.layer.top);
	});
};


var createCanvas = function(image){
	var imageElm = createImageElement(image);
	$('#img-canvas')
		.attr('width', image.width().toString())
		.attr('height', image.height().toString())
		.show();
	
	$('#position-canvas')
		.attr('width', image.width().toString())
		.attr('height', image.height().toString())
		.show();
	
	if(imageElm.complete){
		drawImageToCanvas(imageElm);
	}else{
		//createProgressBar();
		imageElm.onload = function(e){
			drawImageToCanvas(e.target);
			//deleteProgressBar();
		};
	}
};


var drawImageToCanvas = function(image){
	var ctx = $('#img-canvas').get(0).getContext('2d');
	ctx.drawImage(image, 0, 0);
}


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
		.append($('<td />').text(layer.left).addClass('layer-table-align-right'))
		.append($('<td />').text(layer.top).addClass('layer-table-align-right'))
		.append($('<td />').text(layer.width).addClass('layer-table-align-right'))
		.append($('<td />').text(layer.height).addClass('layer-table-align-right'))
		.append($('<td />').addClass('layer-table-align-right').append(image));

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
