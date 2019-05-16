'use strict';

import * as vscode from 'vscode';
import {RedConfiguration} from  './RedConfiguration';
import * as path from 'path';

let terminal: vscode.Terminal;

function getTarget(): string {
	if (process.platform === 'win32') {
		return "Windows";
	} else if (process.platform === 'darwin') {
		return "macOS";
	} else {
		return '';
	}
}

function getBuildDir(filePath: string): string {
	let redConfigs = RedConfiguration.getInstance();
	return redConfigs.redWorkSpace || vscode.workspace.rootPath || path.dirname(filePath);
}

function getOutFileName(buildDir: string, filePath: string): string {
	let outName = path.join(buildDir, path.parse(filePath).name);
	if (process.platform === 'win32') {
		outName = outName + ".exe";
	}
	return outName;
}

function execCommand(command: string) {
	let text: string;

	terminal = terminal ? terminal : vscode.window.createTerminal(`Red`);
	text = `${command}`;
	terminal.sendText(text);
	terminal.show();
}

function getFileName(fileUri?: vscode.Uri): string {
	let filePath = '';
	if (fileUri === null || fileUri === undefined || typeof fileUri.fsPath !== 'string') {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor !== undefined) {
			if (!activeEditor.document.isUntitled) {
				if ((activeEditor.document.languageId === 'red') || (activeEditor.document.languageId === 'reds')) {
					filePath = activeEditor.document.fileName;
				} else {
					vscode.window.showErrorMessage('The active file is not a Red or Red/System source file');
				}
			} else {
				vscode.window.showErrorMessage('The active file needs to be saved before it can be run');
			}
		} else {
			vscode.window.showErrorMessage('No open file to run in terminal');
		}
	} else {
		return fileUri.fsPath;
	}
	return filePath;
}

export function redRunInConsole(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	let filePath = getFileName(fileUri);
	if (filePath === '') {return;}
	let ext = path.parse(filePath).ext.toLowerCase();
	if (ext !== ".red") {
		vscode.window.showErrorMessage("don't support " + ext + " file");
		return;
	}

	let command: string;
	if (redTool === '') {
		command = redConfigs.redConsole + " " + filePath;
	} else {
		command = redTool + " --cli " + filePath;
	}

	execCommand(command);
}

export function redRunInGuiConsole(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	let filePath = getFileName(fileUri);
	if (filePath === '') {return;}
	let ext = path.parse(filePath).ext.toLowerCase();
	if (ext !== ".red") {
		vscode.window.showErrorMessage("don't support " + ext + " file");
		return;
	}

	let command: string;
	if (redTool === '') {
		command = redConfigs.redGuiConsole + " " + filePath;
	} else {
		command = redTool + " " + filePath;
	}

	execCommand(command);
}

export function redCompileInConsole(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	if (redTool === '') {
		vscode.window.showErrorMessage('No Red compiler! Please configure the `red.redPath` in `settings.json`');
		return;
	}
	let filePath = getFileName(fileUri);
	if (filePath === '') {return;}
	let ext = path.parse(filePath).ext.toLowerCase();
	if (ext !== ".red") {
		vscode.window.showErrorMessage("don't support " + ext + " file");
		return;
	}

	let buildDir = getBuildDir(filePath);
	let outName = getOutFileName(buildDir, filePath);

	let command= redTool + " -c " + filePath + " -o " + outName;
	execCommand(command);
}

export function redCompileInGuiConsole(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	if (redTool === '') {
		vscode.window.showErrorMessage('No Red compiler! Please configure the `red.redPath` in `settings.json`');
		return;
	}
	let filePath = getFileName(fileUri);
	if (filePath === '') {return;}
	let ext = path.parse(filePath).ext.toLowerCase();
	if (ext !== ".red") {
		vscode.window.showErrorMessage("don't support " + ext + " file");
		return;
	}

	let buildDir = getBuildDir(filePath);
	let outName = getOutFileName(buildDir, filePath);
	let target = getTarget();

	let command= redTool + " -t " + target + " -c " + filePath + " -o " + outName;
	execCommand(command);
}

export function redCompileInRelease(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	if (redTool === '') {
		vscode.window.showErrorMessage('No Red compiler! Please configure the `red.redPath` in `settings.json`');
		return;
	}
	let filePath = getFileName(fileUri);
	if (filePath === '') {return;}
	let ext = path.parse(filePath).ext.toLowerCase();
	if (ext !== ".red") {
		vscode.window.showErrorMessage("don't support " + ext + " file");
		return;
	}

	let buildDir = getBuildDir(filePath);
	let outName = getOutFileName(buildDir, filePath);
	let target = getTarget();

	let command= redTool + " -t " + target + " -r " + filePath + " -o " + outName;
	execCommand(command);
}

export function redCompileClear(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	if (redTool === '') {
		vscode.window.showErrorMessage('No Red compiler! Please configure the `red.redPath` in `settings.json`');
		return;
	}
	let filePath = getFileName(fileUri);
	let buildDir = getBuildDir(filePath);

	let command= redTool + " clear " + buildDir;
	execCommand(command);
}

export function redCompileUpdate(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	if (redTool === '') {
		vscode.window.showErrorMessage('No Red compiler! Please configure the `red.redPath` in `settings.json`');
		return;
	}
	let filePath = getFileName(fileUri);
	if (filePath === '') {return;}
	let ext = path.parse(filePath).ext.toLowerCase();
	if (ext !== ".red") {
		vscode.window.showErrorMessage("don't support " + ext + " file");
		return;
	}

	let buildDir = getBuildDir(filePath);
	let outName = getOutFileName(buildDir, filePath);

	let command= redTool + " -u -c " + filePath + " -o " + outName;
	execCommand(command);
}

export function redsCompile(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	if (redTool === '') {
		vscode.window.showErrorMessage('No Red compiler! Please configure the `red.redPath` in `settings.json`');
		return;
	}
	let filePath = getFileName(fileUri);
	if (filePath === '') {return;}
	let ext = path.parse(filePath).ext.toLowerCase();
	if (ext !== ".reds") {
		vscode.window.showErrorMessage("don't support " + ext + " file");
		return;
	}

	let buildDir = getBuildDir(filePath);
	let outName = getOutFileName(buildDir, filePath);

	let command= redTool + " -r " + filePath + " -o " + outName;
	execCommand(command);
}

export function setCommandMenu() {
	const options = [
		{
			label: 'Run Red Script',
			description: '',
			command: 'red.interpret'
		},
		{
			label: 'Run Red Script in GUI Console',
			description: '',
			command: 'red.interpretGUI'
		},
		{
			label: 'Compile Red Script',
			description: '',
			command: 'red.compile'
		},
		{
			label: 'Compile Red Script in GUI mode',
			description: '',
			command: 'red.compileGUI'
		},
		{
			label: 'Compile Red Script in Release mode',
			description: '',
			command: 'red.compileRelease'
		},
		{
			label: 'Clear libRedRT',
			description: '',
			command: 'red.clear'
		},
		{
			label: 'Update libRedRT',
			description: '',
			command: 'red.update'
		},
		{
			label: 'Compile Red/System Script',
			description: '',
			command: 'reds.compile'
		}
	];
	vscode.window.showQuickPick(options).then(option => {
		if (!option || !option.command || option.command.length === 0) {
			return;
		}
		vscode.commands.executeCommand(option.command);
	});
}

