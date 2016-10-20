'use strict';

import * as vscode from 'vscode';
import { SystemVariables } from './systemVariables';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

function folderExists(path)
{
    try
    {
        return fs.statSync(path).isDirectory();
    }
    catch (err)
    {
        return false;
    }
}

function getRedConsole() {
    var root;
    if (process.platform == 'win32') {
        root = path.join(process.env.ALLUSERSPROFILE, 'Red');
    } else {
        root = path.join(process.env.HOME, '.red');
        if (!folderExists(root)) {
            root = "/tmp/.red/";
        }
    }
    try {
        var files = fs.readdirSync(root);
        var console = '';
        var date: Date;
        for (var i in files) {
            var name = files[i];
            var ext = path.extname(name);
            if (name.startsWith('console') && (ext == '.exe' || ext == '')) {
                var console_path = path.join(root, name);
                var stats = fs.statSync(console_path);
                if (console == '') {
                    console = console_path
                    date = new Date(util.inspect(stats.ctime));
                } else {
                    var date2 = new Date(util.inspect(stats.ctime));
                    if (date2 > date) {
                        date = date2;
                        console = console_path;
                    }
                }
            }
        }
        return console;
    }
    catch (err) {
        return '';
    }
}

function getRedGUIConsole() {                   // TBD: Should merge it with getRedConsole
    var root;
    if (process.platform == 'win32') {
        root = path.join(process.env.ALLUSERSPROFILE, 'Red');
    } else {
        root = path.join(process.env.HOME, '.red');
        if (!folderExists(root)) {
            root = "/tmp/.red/";
        }
    }
    try {
        var files = fs.readdirSync(root);
        var console = '';
        var date: Date;
        for (var i in files) {
            var name = files[i];
            var ext = path.extname(name);
            if (name.startsWith('gui-console') && (ext == '.exe' || ext == '')) {
                var console_path = path.join(root, name);
                var stats = fs.statSync(console_path);
                if (console == '') {
                    console = console_path
                    date = new Date(util.inspect(stats.ctime));
                } else {
                    var date2 = new Date(util.inspect(stats.ctime));
                    if (date2 > date) {
                        date = date2;
                        console = console_path;
                    }
                }
            }
        }
        return console;
    }
    catch (err) {
        return '';
    }
}

export interface IRedSettings {
    redPath: string;
    redConsolePath: string;
    redGUIConsolePath: string;
    buildDir: string;
    devOptions: any[];
}

export interface IAutoCompeteSettings {
    autoComplete: boolean;
}

const systemVariables: SystemVariables = new SystemVariables();
export class RedSettings implements IRedSettings {
    private static redSettings: RedSettings = new RedSettings();
    constructor() {
        if (RedSettings.redSettings) {
            throw new Error('Singleton class, Use getInstance method');
        }
        vscode.workspace.onDidChangeConfiguration(() => {
            this.initializeSettings();
        });

        this.initializeSettings();
    }
    public static getInstance(): RedSettings {
        return RedSettings.redSettings;
    }
    private initializeSettings() {
        let redSettings = vscode.workspace.getConfiguration("red");
        this.redPath = systemVariables.resolveAny(redSettings.get<string>("redPath"));
        this.buildDir = redSettings.get<string>("buildDir");
        this.devOptions = redSettings.get<any[]>("devOptions");
        this.devOptions = Array.isArray(this.devOptions) ? this.devOptions : [];
        this.redConsolePath = getRedConsole();
        this.redGUIConsolePath = getRedGUIConsole();

        var autoCompleteSettings = redSettings.get<IAutoCompeteSettings>("autoComplete");
        if (this.autoComplete) {
            Object.assign<IAutoCompeteSettings, IAutoCompeteSettings>(this.autoComplete, autoCompleteSettings);
        }
        else {
            this.autoComplete = autoCompleteSettings;
        }
    }

    public redPath: string;
    public redConsolePath: string;
    public redGUIConsolePath: string;
    public buildDir: string;
    public devOptions: any[];
    public autoComplete: IAutoCompeteSettings;
}