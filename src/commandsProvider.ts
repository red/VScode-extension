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

function execCommand(command: string, args: string) {
	let text: string = "";

	terminal = terminal ? terminal : vscode.window.createTerminal(`Red`);
	if (process.platform === 'win32') {
		text = "cmd /c ";
	}
	text = text + "\"" + command + "\"";
	text = text + " " + args;
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
	filePath = "\"" + filePath + "\"";

	let command: string;
	let args: string;
	if (redTool === '') {
		command = redConfigs.redConsole;
		args = filePath;
	} else {
		command = redTool;
		args = "--cli " + filePath;
	}

	execCommand(command, args);
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
	filePath = "\"" + filePath + "\"";

	let command: string;
	let args: string;
	if (redTool === '') {
		command = redConfigs.redGuiConsole;
		args = filePath;
	} else {
		command = redTool;
		args = filePath;
	}

	execCommand(command, args);
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
	if (ext === ".reds") {
		redsCompile(fileUri);
		return;
	}
	if (ext !== ".red") {
		vscode.window.showErrorMessage("don't support " + ext + " file");
		return;
	}
	filePath = "\"" + filePath + "\"";

	let buildDir = getBuildDir(filePath);
	let outName = getOutFileName(buildDir, filePath);
	outName = "\"" + outName + "\"";


	let command= redTool;
	let args = "-c " + filePath + " -o " + outName;
	execCommand(command, args);
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
	filePath = "\"" + filePath + "\"";

	let buildDir = getBuildDir(filePath);
	let outName = getOutFileName(buildDir, filePath);
	let target = getTarget();
	outName = "\"" + outName + "\"";

	let command= redTool;
	let args = "-t " + target + " -c " + filePath + " -o " + outName;
	execCommand(command, args);
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
	filePath = "\"" + filePath + "\"";

	let buildDir = getBuildDir(filePath);
	let outName = getOutFileName(buildDir, filePath);
	let target = getTarget();
	outName = "\"" + outName + "\"";

	let command= redTool;
	let args = "-t " + target + " -r " + filePath + " -o " + outName;
	execCommand(command, args);
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
	filePath = "\"" + filePath + "\"";
	buildDir = "\"" + buildDir + "\"";

	let command= redTool;
	let args = "clear " + buildDir;
	execCommand(command, args);
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
	filePath = "\"" + filePath + "\"";

	let buildDir = getBuildDir(filePath);
	let outName = getOutFileName(buildDir, filePath);
	outName = "\"" + outName + "\"";

	let command= redTool;
	let args = "-u -c " + filePath + " -o " + outName;
	execCommand(command, args);
}

function redsCompile(fileUri?: vscode.Uri) {
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
	filePath = "\"" + filePath + "\"";

	let buildDir = getBuildDir(filePath);
	let outName = getOutFileName(buildDir, filePath);
	outName = "\"" + outName + "\"";

	let command= redTool;
	let args = "-r " + filePath + " -o " + outName;
	execCommand(command, args);
}

export function setCommandMenu() {
	const options = [
		{
			label: 'Run Current Script',
			description: '',
			command: 'red.interpret'
		},
		{
			label: 'Run Current Script in GUI Console',
			description: '',
			command: 'red.interpretGUI'
		},
		{
			label: 'Compile Current Script',
			description: '',
			command: 'red.compile'
		},
		{
			label: 'Compile Current Script (GUI mode)',
			description: '',
			command: 'red.compileGUI'
		},
		{
			label: 'Compile Current Script (Release mode)',
			description: '',
			command: 'red.compileRelease'
		},
		{
			label: 'Delete all temporary files (libRedRT, etc)',
			description: '',
			command: 'red.clear'
		},
		{
			label: 'Update libRedRT and Compile Current script',
			description: '',
			command: 'red.update'
		}
	];
	vscode.window.showQuickPick(options).then(option => {
		if (!option || !option.command || option.command.length === 0) {
			return;
		}
		vscode.commands.executeCommand(option.command);
	});
}

