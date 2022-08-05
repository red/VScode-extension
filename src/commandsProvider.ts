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

function normalFile(value: string): string {
	return value.replace(/\\/g, '/');
}

function createTerm(name: string) {
	if (process.platform === 'win32') {
		return vscode.window.createTerminal(name, 'cmd');
	} else {
		return vscode.window.createTerminal(name);
	}
}

function execCommand(command: string, args: string) {
	const termName = 'Red';
	let text: string = "";

	for (let t of vscode.window.terminals) {
		if (t.name === termName) {
			terminal = t;
			break;
		}
	}

	terminal = terminal ? terminal : createTerm(termName);
	if (terminal && terminal.exitStatus) {	// killed by the user
		terminal.dispose();
		terminal = createTerm(termName);
	}

	text = text + "\"" + command + "\"";
	text = text + " " + args;
	terminal.sendText(text);
	terminal.show(true);	// do not take the focus
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

function redRunScript(gui: boolean, fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let filePath = getFileName(fileUri);
	if (filePath === '') {return;}

	filePath = normalFile(filePath);
	filePath = "\"" + filePath + "\"";

	let redTool = gui ? redConfigs.redGuiConsole : redConfigs.redConsole;
	if (redTool === '') {
		if (gui) {
			vscode.window.showErrorMessage('No Red View! Please set the `red.redViewPath` in `settings.json`');
		} else {
			vscode.window.showErrorMessage('No Red CLI! Please set the `red.redPath` in `settings.json`');
		}
		return;
	}
	let command = normalFile(redTool);
	execCommand(command, filePath);
}

function redCompileScript(mode: string, fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	if (redTool === '') {
		vscode.window.showErrorMessage('No Red compiler! Please set the `red.redToolChainPath` in `settings.json`');
		return;
	}
	let filePath = getFileName(fileUri);

	if (mode === "clear") {
		let buildDir = getBuildDir(filePath);
		buildDir = normalFile(buildDir);
		if (!buildDir.endsWith("/")) {
			buildDir = buildDir.concat("/");
		}
		buildDir = "\"" + buildDir + "\"";
		let args = "clear " + buildDir;
		let command = normalFile(redTool);
		execCommand(command, args);
		return;
	}

	if (filePath === '') {return;}

	let buildDir = getBuildDir(filePath);
	let outName = getOutFileName(buildDir, filePath);
	outName = normalFile(outName);
	outName = "\"" + outName + "\"";

	filePath = normalFile(filePath);
	filePath = "\"" + filePath + "\"";

	let command = normalFile(redTool);
	// dev mode
	let args = "-c -o " + outName + " " + filePath;
	
	if (mode === "release-gui") {
		let target = getTarget();
		args = "-r -t " + target + " -o " + outName + " " + filePath;
	} else if (mode === "release-cli") {
		args = "-r -o " + outName + " " + filePath;
	} else if (mode === "update") {
		args = "-u -o " + outName + " " + filePath;
	}
	execCommand(command, args);
}

export function redRunInConsole(fileUri?: vscode.Uri) {
	redRunScript(false, fileUri);
}

export function redRunInGuiConsole(fileUri?: vscode.Uri) {
	redRunScript(true, fileUri);
}

export function redCompileDev(fileUri?: vscode.Uri) {
	redCompileScript("dev", fileUri);
}

export function redCompileReleaseGui(fileUri?: vscode.Uri) {
	redCompileScript("release-gui", fileUri);
}

export function redCompileReleaseCli(fileUri?: vscode.Uri) {
	redCompileScript("release-cli", fileUri);
}

export function redCompileClear(fileUri?: vscode.Uri) {
	redCompileScript("clear", fileUri);
}

export function redCompileUpdate(fileUri?: vscode.Uri) {
	redCompileScript("update", fileUri);
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
			label: 'Compile Current Script (Dev mode)',
			description: '',
			command: 'red.compile'
		},
		{
			label: 'Compile Current Script (GUI Release mode)',
			description: '',
			command: 'red.compileReleaseGUI'
		},
		{
			label: 'Compile Current Script (CLI Release mode)',
			description: '',
			command: 'red.compileReleaseCLI'
		},
		{
			label: 'Delete all libRedRT related files',
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

