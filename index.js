'use strict';

var electron = require('electron');
var remote = electron.remote;
console.log(remote);
var psd = require('psd');

var textarea = document.getElementById('tree_view');
var dialog = remote.dialog;
console.log(dialog);

var file_select2 = document.getElementById('file_select2');
file_select2.addEventListener('click', function(e){
	var currentWindow = remote.getCurrentWindow();

	dialog.showOpenDialog(
		currentWindow, 
		{
			properties: ['openFile'],
			filters: []
		},
		function(files){
			files.forEach(function(file){
				var psd_path = file;
				var psd_file = psd.fromFile(psd_path);
				psd_file.parse();
				textarea.value = JSON.stringify(psd_file.tree().export());
			});

		}
	);
});