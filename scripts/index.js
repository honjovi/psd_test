/* jshint node:true */
/* global $, Image */

'use strict';

var electron = require('electron');
var remote = electron.remote;
var dialog = remote.dialog;
var psd = require('psd');
var PNG = require('pngjs').PNG;


$('#file_select').on('click', function(e){
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
			
			files.forEach(function(file){
				var psd_path = file;
				var psd_file = psd.fromFile(psd_path);
				psd_file.parse();
				console.log(psd_file);
				$('#debug-area').value = JSON.stringify(psd_file.tree().export());
				/*
				forAllLayer(psd_file.tree(), function(layer){
					appendLayerToList(layer);
					console.log(layer.name);
				});
				*/
				psd_file.layers.forEach(function(layer){
					appendLayerToList(layer);
				});
			});
		}
	);
});


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
	var id = 'list-' + layer.legacyName.replace(' ', '');
	var newItem = $('<li></li>');
	var checkbox = $('<input>')
		.addClass("filled-in")
		.attr('id', id)
		.attr("type", "checkbox")
		.attr("checked", "checked");
	var label = $('<label>' + layer.name + '</label>').attr('for', id);
	var image = $(createImageElement(layer)).attr('width', '100');
	newItem.appendTo('#layer-list')
		.addClass('collection-item')
		.append(checkbox)
		.append(label)
		.append(image);
};


var createImageElement = function(layer){
	var image = new Image();
	var b64Data = PNG.sync.write(layer.image.toPng()).toString('base64');
	image.src = "data:image/png;base64," + b64Data;
	return image;
};
