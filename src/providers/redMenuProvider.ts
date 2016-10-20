'use strict';
import * as vscode from 'vscode';
import * as settings from '../common/configSettings';
import { Commands } from '../common/constants';

export function activateRedMenuProvider(): vscode.Disposable {
    return vscode.commands.registerCommand("red.commandMenu", setCommandMenu);
}

function setCommandMenu() {
    const options = [
        {
            label: 'Run Red Script',
            description: '',
            command: Commands.Red_Interpret
        },
        {
            label: 'Run Red Script in GUI Console',
            description: '',
            command: Commands.Red_InterpretInGUIConsole
        },
        {
            label: 'Compile Red Script',
            description: '',
            command: Commands.Red_Compile
        },
        {
            label: 'Compile Red Script in GUI mode',
            description: '',
            command: Commands.Red_CompileGUI
        }
    ];
    vscode.window.showQuickPick(options).then(option => {
        if (!option || !option.command || option.command.length === 0) {
            return;
        }
        vscode.commands.executeCommand(option.command);
    });
}