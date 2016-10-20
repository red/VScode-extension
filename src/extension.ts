'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {RedCompletionProvider} from './providers/completionProvider';
import {RedHoverProvider} from './providers/hoverProvider';
import {RedDefinitionProvider} from './providers/definitionProvider';
import {RedReferenceProvider} from './providers/referenceProvider';
import {RedRenameProvider} from './providers/renameProvider';
import {RedSymbolProvider} from './providers/symbolProvider';

import { activateExecInTerminalProvider } from './providers/commandsProvider';
import { activateRedMenuProvider } from './providers/redMenuProvider';

import * as fs from 'fs';
import * as settings from './common/configSettings'

const RED_MODE: vscode.DocumentFilter = { language: 'red', scheme: 'file' }
let outChannel: vscode.OutputChannel;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let redSettings = settings.RedSettings.getInstance();

    if (redSettings.autoComplete) {
        fs.access(redSettings.redConsolePath, fs.constants.F_OK, function(err) {
            if (!err) {
                outChannel = vscode.window.createOutputChannel('Red-Lang');
                outChannel.clear();
                context.subscriptions.push(vscode.languages.registerHoverProvider(RED_MODE, new RedHoverProvider(context)));
                context.subscriptions.push(vscode.languages.registerCompletionItemProvider(RED_MODE, new RedCompletionProvider(context), '/'));
            }
        });
    }
    //context.subscriptions.push(vscode.languages.registerDefinitionProvider(RED, new RedDefinitionProvider(context)));
    //context.subscriptions.push(vscode.languages.registerReferenceProvider(RED, new RedReferenceProvider(context)));
    //context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(RED, new RedSymbolProvider(context)));

    context.subscriptions.push(activateRedMenuProvider());
    context.subscriptions.push(...activateExecInTerminalProvider());

	vscode.languages.setLanguageConfiguration(RED_MODE.language, {
		wordPattern: /(-?\d*\.\d\w*)|([^\`\(\)\[\{\]\}\\\|\;\'\"\,\/\s]+)/g
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}