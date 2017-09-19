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
			
			var ul = $('<ul />').addClass('collection').attr('id', 'layer-list');
			$('#display-block').append(ul);
			
			/*
			psd_file.layers.forEach(function(layer){
				appendLayerToList(layer);
			});
			*/
			
			forAllLayer(psd_file.tree(), function(node){
				appendLayerToList(node.layer);
			});
			//deleteProgressBar();
		}
	);
});


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


var appendLayerToList = function(layer){
	var id = 'checkbox-' + layer.name.replace(/[^a-zA-Z0-9\-_:.]/g, '');
	
	var checkbox = $('<input />')
		.addClass("filled-in")
		.attr('id', id)
		.attr("type", "checkbox")
		.attr("checked", "checked");
	
	var label = $('<label />')
		.attr('for', id)
		.text(layer.name);
	
	var image = $(createImageElement(layer))
		.addClass('secondary-content')
		.attr('height', '28');

	var newLayer = $('<li />')
		.addClass('collection-item');
		
	newLayer
		.append(checkbox)
		.append(label)
		.append(image);

	$('#layer-list').append(newLayer);
};


var createImageElement = function(layer){
	var image = new Image();
	var b64Data = PNG.sync.write(layer.image.toPng()).toString('base64');
	image.src = "data:image/png;base64," + b64Data;
	return image;
};
