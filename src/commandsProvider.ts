'use strict';

import * as vscode from 'vscode';
import {RedConfiguration} from  './RedConfiguration';
import * as path from 'path';

let terminal: vscode.Terminal;

export function redRunInConsole(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	let toolChain = true;
	let fileState = getFileState(fileUri);
	if (fileState.filePath == '') {return}
	if (fileState.redsystem) {
		vscode.window.showErrorMessage("can't run red/system file in terminal");
		return;
	}

	if (redTool == '') {
		redTool = redConfigs.redConsole;
		toolChain = false;
	}

	execCommand(redTool, false, fileState, false, toolChain);
}

export function redRunInGuiConsole(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	let fileState = getFileState(fileUri);
	if (fileState.filePath == '') {return}
	if (fileState.redsystem) {
		vscode.window.showErrorMessage("can't run red/system file in terminal");
		return;
	}

	if (redTool == '') {
		redTool = redConfigs.redGuiConsole;
	}

	execCommand(redTool, false, fileState, true, false);
}

export function redCompileInConsole(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	let fileState = getFileState(fileUri);
	if (fileState.filePath == '') {return}

	if (redTool != '') {
		execCommand(redTool, true, fileState, false);
	} else {
		vscode.window.showErrorMessage('No Red compiler! Please configure the `red.redPath` in `settings.json`');
	}
}

export function redCompileInGuiConsole(fileUri?: vscode.Uri) {
	let redConfigs = RedConfiguration.getInstance();
	let redTool = redConfigs.redToolChain;
	let fileState = getFileState(fileUri);
	if (fileState.filePath == '') {return}

	if (redTool != '') {
		execCommand(redTool, true, fileState, true);
	} else {
		vscode.window.showErrorMessage('No Red compiler! Please configure the `red.redPath` in `settings.json`');
	}
}

function getFileState(fileUri?: vscode.Uri): {filePath: string, redsystem: boolean} {
	let state = {filePath: '', redsystem: false};
	if (fileUri === null || fileUri === undefined || typeof fileUri.fsPath !== 'string') {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor !== undefined) {
			if (!activeEditor.document.isUntitled) {
				if ((activeEditor.document.languageId === 'red') || (activeEditor.document.languageId === 'reds')) {
					state.filePath = activeEditor.document.fileName;
					if (activeEditor.document.languageId === 'reds') {
						state.redsystem = true;
					}
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
		state.filePath = fileUri.fsPath;
	}
	return state;
}

function execCommand(tool: string, compileMode: boolean, fileState: {filePath: string, redsystem: boolean}, guiMode?: boolean, toolChain?: boolean) {
	let redConfigs = RedConfiguration.getInstance();
	let text: string;

	terminal = terminal ? terminal : vscode.window.createTerminal(`Red`);

	if (compileMode || fileState.redsystem) {
		let buildDir: string;
		let outputFilename: string;
		buildDir = redConfigs.redWorkSpace || vscode.workspace.rootPath || path.dirname(fileState.filePath);
		outputFilename = path.join(buildDir, path.parse(fileState.filePath).name);
		if (guiMode && (process.platform == 'win32' || process.platform == 'darwin')) {
			let target: string;
			if (process.platform == 'win32') {
				target = "Windows";
			} else {
				target = "macOS";
			}
			text = `${tool} -t ${target} -o "${outputFilename}" -c "${fileState.filePath}"`;
		} else {
			text = `${tool} -o "${outputFilename}" -c "${fileState.filePath}"`;
		}
	} else {
			if (toolChain) {
				text = `${tool} --cli "${fileState.filePath}"`;
			} else {
				text = `${tool} "${fileState.filePath}"`
			}
	}
	terminal.sendText(text);
	terminal.show();
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
			label: 'Compile Red/System Script',
			description: '',
			command: 'reds.compile'
		},
		{
			label: 'Compile Red/System Script in GUI mode',
			description: '',
			command: 'reds.compileGUI'
		}
	];
	vscode.window.showQuickPick(options).then(option => {
		if (!option || !option.command || option.command.length === 0) {
			return;
		}
		vscode.commands.executeCommand(option.command);
	});
}

