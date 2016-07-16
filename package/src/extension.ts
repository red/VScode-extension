'use strict';

import * as vscode        from 'vscode';
import * as fs            from 'fs';
import * as path          from 'path';
import * as http          from 'http';
import * as child_process from 'child_process';

var red_outputChannel1 = vscode.window.createOutputChannel('red_outputChannel1');
var red_extensionPath = '';
var red_pkg = {};
var red_menu = [];
var _exe = '';
var red_bin_path = '';
var red_bin_exist = false;
var stdout_read_encoding = {encoding:'utf8'};

function mkdirpSync(dirpath) {
    var parts = dirpath.split(path.sep);
    for( var i = 1; i <= parts.length; i++ ) {
        try {
            fs.mkdirSync( path.join.apply(null, parts.slice(0, i)) );
        } catch (error) {
            if (error.code != 'EEXIST'){
                throw error;
            }
        }
    }
}
function http_download(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        if (response.statusCode !== 200) {
            fs.unlink(dest);
            return cb('Response status was ' + response.statusCode);
        }
        response.pipe(file);
        file.on('finish', function() {
            file.close();
            return cb();
        });
    });
    request.on('error', function (err) {
        fs.unlink(dest);
        return cb(err.message);
    });
    file.on('error', function(err) {
        fs.unlink(dest);
        return cb(err.message);
    });
}
function exec_os(arg) {
    var str = red_bin_path;
    switch(process.platform) {
        case 'win32': {
            //
        } break;
        case 'darwin': {
            arg = arg.replace(' -t msdos ', ' -t darwin ');
        } break;
        case 'linux': {
            arg = arg.replace(' -t msdos ', ' -t linux ');
        } break;
        default: {
        }
    }
    if (arg.substr(-5) == '.red"') {
        str = str + ' ' + arg;
    } else {
        str = arg;
    }
    red_outputChannel1.append(str + '\r\n'); red_outputChannel1.show();
    child_process.exec(str, null, function (error, stdout, stderr) {
        var output;
        if (error != null) {
            output = error.message;
        }
        else {
            output = stdout.toString();
            output += stderr.toString();
        }
        red_outputChannel1.append(output); red_outputChannel1.show();
    });
}

function handle_command(command) {
    if (red_bin_exist == false) {
	    var url = 'http://static.red-lang.org/dl/auto/' + process.platform.replace('win32', 'win').replace('darwin','mac') + '/red-latest' + _exe;
        vscode.window.showInformationMessage('Please wait, download...    ' + url);
        http_download(url, red_bin_path, function () {
            if (arguments.length == 0) {
                if (process.platform != 'win32') {
                    child_process.exec('chmod 777 ' + red_bin_path);
                }
                red_bin_exist = true;
                vscode.window.showInformationMessage('Please wait, compile gui-console...');
                var str = red_bin_path + ' ' + red_extensionPath + '/bin/' + process.platform + '/keep-me.red';
                //child_process.exec(str, stdout_read_encoding, function (error, stdout, stderr) {
                child_process.execFile(red_bin_path, [red_extensionPath + '/bin/' + process.platform + '/keep-me.red'], stdout_read_encoding, function (error, stdout, stderr) {
                    var output;
                    if (error != null) {
                        output = error.message;
                    }
                    else {
                        output = 'You can interpret or compile now!';
                    }
                    vscode.window.showInformationMessage(output);
                });
            } else {
                vscode.window.showInformationMessage(arguments[0]);
            }
        });
    } else {
        if (-1 < red_pkg['contributes'].languages[0].extensions.indexOf(vscode.window.activeTextEditor.document.fileName.substr(-4, 4))) {
            var arg = '';
            var fileName = vscode.window.activeTextEditor.document.fileName;
            var executable = true;
            switch(command) {
                case 'red_menu': {
                    vscode.window.showQuickPick(red_menu).then(function (menu_item) {
                        if (menu_item != null) {
                            red_pkg['contributes'].commands.some(function(element1,index1,array1){
                                if (element1.title == menu_item.substr(0, menu_item.lastIndexOf('(') - 1)) {
                                    handle_command(element1.command);
                                    return true;
                                }
                            });
                        }
                    });
                    executable = false;
                } break;
                case 'red_interpret': {
                    arg = '"' + fileName + '"';
                } break;
                case 'red_compile': {
                    arg = '-c -o "' + fileName.substr(0, fileName.length - 4) + _exe + '" -t msdos "' + fileName + '"';
                    red_outputChannel1.append('please wait...\r\n'); red_outputChannel1.show();
                } break;
                case 'red_compile_gui': {
                    arg = '-c -o "' + fileName.substr(0, fileName.length - 4) + _exe + '" "' + fileName + '"';
                    red_outputChannel1.append('please wait...\r\n'); red_outputChannel1.show();
                } break;
                case 'red_call_compile_result': {
                    arg = '"' + fileName.substr(0, fileName.length - 4) + _exe + '"';
                } break;
                default: {
                    arg = 'unhandled command: ' + command;
                    executable = false;
                }
            }
            if (executable) {
                exec_os(arg);
            } else {
                red_outputChannel1.append(arg + '\r\n'); red_outputChannel1.show();
            }
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    red_extensionPath = context.extensionPath;
    red_pkg = JSON.parse(fs.readFileSync(red_extensionPath + '/package.json', 'utf8'));
    red_pkg['contributes'].commands.forEach(function(element1,index1,array1){
        red_pkg['contributes'].keybindings.some(function(element2,index2,array3){ //forEach can not use break
            if (element1.command == element2.command) {
                if (element1.command != 'red_menu') {
                    red_menu.push(element1.title + ' (' + element2.key + ')');
                }
                context.subscriptions.push(vscode.commands.registerCommand( element1.command, function(){handle_command(element1.command);} ));
                return true;
            }
        });
    });
    
    if ('win32' == process.platform) {
        _exe = '.exe';
        stdout_read_encoding.encoding = 'utf16le';
    }
    red_bin_path = red_extensionPath + '/bin/' + process.platform + '/';
    //fs.existsSync(red_bin_path) || fs.mkdirSync(red_bin_path);
    //mkdirpSync(red_bin_path);
    red_bin_path = red_bin_path + 'red' + _exe;
    try {
        fs.accessSync(red_bin_path, fs.X_OK);
        red_bin_exist = true;
    } catch (e) {
        //
    }
}

export function deactivate() {
}
