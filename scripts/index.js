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
			filters: []
		},
		function(files){
			if(files.length === 0){
				return;
			}
			
			//createProgressBar();
			
			var psd_file = psd.fromFile(files[0]);
			psd_file.parse();
			console.log(psd_file);
			
			createCanvas(psd_file.image);
			
			createLayerTable();
			
			forAllLayer(psd_file.tree(), function(node){
				//appendLayerToList(node.layer);
				appendLayerToTable(node.layer);
			});
			//deleteProgressBar();
			
			
		}
	);
});


var createCanvas = function(image){
	var imageElm = createImageElement(image);
	var canvas = $('<canvas />')
		.attr('id', 'img-canvas')
		.attr('width', image.width().toString())
		.attr('height', image.height().toString())
		.addClass('center');
	$('#img-block').append(canvas);
	
	if(imageElm.complete){
		drawImageToCanvas(imageElm);
	}else{
		imageElm.onload = function(e){
			drawImageToCanvas(e.target);
		};
	}
};


var drawImageToCanvas = function(image){
	var ctx = $('#img-canvas').get(0).getContext('2d');
	ctx.drawImage(image, 0, 0);
}


var createProgressBar = function(){
	var progressBar = $('div').addClass('progress').attr('id', 'prog-bar');
	$('div').addClass('indeterminate').appendTo(progressBar);
	progressBar.insertAfter('#title-bar');
};


var deleteProgressBar = function(){
	$('prog-bar').remove();
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
	var tr = $('<tr />')
		.append($('<th />').text('layer').addClass('layer-table-align-center'))
		.append($('<th />').text('x').addClass('layer-table-align-center'))
		.append($('<th />').text('y').addClass('layer-table-align-center'))
		.append($('<th />').text('w').addClass('layer-table-align-center'))
		.append($('<th />').text('h').addClass('layer-table-align-center'))
		.append($('<th />').text('thumbnail').addClass('layer-table-align-center'));
	var thead = $('<thead />').append(tr);
	var tbody = $('<tbody />').attr('id', 'layer-table-body');
	var layerTable = $('<table />').addClass('hilight').attr('id', 'layer-table');
	layerTable.append(thead);
	layerTable.append(tbody);
	
	$('#display-block').append(layerTable);
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
