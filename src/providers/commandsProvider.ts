'use strict';
import * as vscode from 'vscode';
import * as settings from '../common/configSettings';
import { Commands, RedLanguage } from '../common/constants';
let path = require('path');
let terminal: vscode.Terminal;

export function activateExecInTerminalProvider(): vscode.Disposable[] {
    const disposables: vscode.Disposable[] = [];
    disposables.push(vscode.commands.registerCommand(Commands.Red_Interpret, execInTerminal));
    disposables.push(vscode.commands.registerCommand(Commands.Red_InterpretInGUIConsole, execInTerminalGUI));
    disposables.push(vscode.commands.registerCommand(Commands.Red_Compile, compileInTerminal));
    disposables.push(vscode.commands.registerCommand(Commands.Red_CompileGUI, compileInTerminalGUI));
    //disposables.push(vscode.commands.registerCommand(Commands.Red_Exec_Selection, execSelectionInTerminal));
    disposables.push(vscode.window.onDidCloseTerminal((closedTerminal: vscode.Terminal) => {
        if (terminal === closedTerminal) {
            terminal = null;
        }
    }))
    return disposables;
}

function compileInTerminal(fileUri?: vscode.Uri) {
    let redSettings = settings.RedSettings.getInstance();
    let currentRedPath = redSettings.redPath;

    if (currentRedPath != '') {
        execCommand(currentRedPath, Commands.Red_Compile, fileUri, false);
    } else {
        vscode.window.showErrorMessage('No Red compiler! Please configure the `red.redPath` in `settings.json`');
    }
}

function execInTerminal(fileUri?: vscode.Uri) {
    let redSettings = settings.RedSettings.getInstance();
    let currentRedPath = redSettings.redPath;
    let redTool = true;

    if (currentRedPath == '') {
        currentRedPath = redSettings.redConsolePath;
        redTool = false;
    }

    execCommand(currentRedPath, Commands.Red_Interpret, fileUri, false, redTool);
}

function compileInTerminalGUI(fileUri?: vscode.Uri) {
    let redSettings = settings.RedSettings.getInstance();
    let currentRedPath = redSettings.redPath;

    if (currentRedPath != '') {
        execCommand(currentRedPath, Commands.Red_Compile, fileUri, true);
    } else {
        vscode.window.showErrorMessage('No Red compiler! Please configure the `red.redPath` in `settings.json`');
    }
}

function execInTerminalGUI(fileUri?: vscode.Uri) {
    let redSettings = settings.RedSettings.getInstance();
    let currentRedPath = redSettings.redPath;

    if (currentRedPath == '') {
        currentRedPath = redSettings.redGUIConsolePath;
    }

    execCommand(currentRedPath, Commands.Red_Interpret, fileUri, true, false);
}

function execCommand(currentRedPath: string, command: string, fileUri?: vscode.Uri, guiMode?: boolean, redTool?: boolean) {
    let redSettings = settings.RedSettings.getInstance();
    let filePath: string;
    let buildDir: string;
    let text: string;

    if (fileUri === undefined || typeof fileUri.fsPath !== 'string') {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor !== undefined) {
            if (!activeEditor.document.isUntitled) {
                if (activeEditor.document.languageId === RedLanguage.language) {
                    filePath = activeEditor.document.fileName;
                } else {
                    vscode.window.showErrorMessage('The active file is not a Red source file');
                    return;
                }
            } else {
                vscode.window.showErrorMessage('The active file needs to be saved before it can be run');
                return;
            }
        } else {
            vscode.window.showErrorMessage('No open file to run in terminal');
            return;
        }
    } else {
        filePath = fileUri.fsPath;
    }

    if (filePath.indexOf(' ') > 0) {
        filePath = `"${filePath}"`;
    }
    terminal = terminal ? terminal : vscode.window.createTerminal(`Red`);
    
    switch(command) {
        case Commands.Red_Interpret: {
            if (redTool) {
                text = `${currentRedPath} --cli ${filePath}`;
            } else {
                text = `${currentRedPath} ${filePath}`;
            }
        } break;
        case Commands.Red_Compile: {
            buildDir = redSettings.buildDir ||
                vscode.workspace.rootPath ||
                path.dirname(filePath);                           // no workspace, use script folder
            terminal.sendText(`cd "${buildDir}"`);
            if (guiMode) {
                text = `${currentRedPath} -t Windows -c ${filePath}`;
            } else {
                text = `${currentRedPath} -c ${filePath}`;
            }
        } break;
        default: {
            text = 'echo "No red toolchain or red console"';
        }
    }
    terminal.sendText(text);
    terminal.show();
}

// function execSelectionInTerminal() {
//     const currentRedPath = settings.RedSettings.getInstance().redPath;
//     const activeEditor = vscode.window.activeTextEditor;
//     if (!activeEditor) {
//         return;
//     }

//     const selection = vscode.window.activeTextEditor.selection;
//     if (selection.isEmpty) {
//         return;
//     }
//     const code = vscode.window.activeTextEditor.document.getText(new vscode.Range(selection.start, selection.end));
//     terminal = terminal ? terminal : vscode.window.createTerminal(`Red`);
//     terminal.sendText(`${currentRedPath} --txt "${code}"`);
//     terminal.show();
// }
