import * as vscode from 'vscode';
import * as settings from './configSettings'

let outChannel: vscode.OutputChannel;
let redSettings: settings.IRedSettings;

class Logger {
    static initializeChannel() {
        if (redSettings) return;
        redSettings = new settings.RedSettings();
        if (redSettings.devOptions.indexOf("DEBUG") >= 0) {
            outChannel = vscode.window.createOutputChannel('RedExtLog');
        }
    }

    static write(category: string = "log", title: string = "", message: any) {
        Logger.initializeChannel();
        if (title.length > 0) {
            Logger.writeLine(category, "---------------------------");
            Logger.writeLine(category, title);
        }

        Logger.writeLine(category, message);
    }
    static writeLine(category: string = "log", line: any) {
        console[category](line);
        if (outChannel) {
            outChannel.appendLine(line);
        }
    }
}
export function error(title: string = "", message: any) {
    Logger.write.apply(Logger, ["error", title, message]);
}
export function warn(title: string = "", message: any) {
    Logger.write.apply(Logger, ["warn", title, message]);
}
export function log(title: string = "", message: any) {
    Logger.write.apply(Logger, ["log", title, message]);
}
