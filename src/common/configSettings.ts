'use strict';

import * as vscode from 'vscode';
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
        var date;
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

export interface IRedSettings {
    redPath: string;
    devOptions: any[];
}

export interface IAutoCompeteSettings {
    autoComplete: boolean;
}

export class RedSettings implements IRedSettings {
    constructor() {
        vscode.workspace.onDidChangeConfiguration(() => {
            this.initializeSettings();
        });

        this.initializeSettings();
    }
    private initializeSettings() {
        var redSettings = vscode.workspace.getConfiguration("red");
        this.redPath = redSettings.get<string>("redPath");
        this.devOptions = redSettings.get<any[]>("devOptions");
        this.devOptions = Array.isArray(this.devOptions) ? this.devOptions : [];

        if (this.redPath == '') {
            this.redPath = getRedConsole();
        }
        var autoCompleteSettings = redSettings.get<IAutoCompeteSettings>("autoComplete");
        if (this.autoComplete) {
            Object.assign<IAutoCompeteSettings, IAutoCompeteSettings>(this.autoComplete, autoCompleteSettings);
        }
        else {
            this.autoComplete = autoCompleteSettings;
        }
    }

    public redPath: string;
    public devOptions: any[];
    public autoComplete: IAutoCompeteSettings;
}