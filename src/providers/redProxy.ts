'use strict';

import * as fs from 'fs';
import * as os from 'os';
import * as child_process from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as settings from './../common/configSettings';
import * as logger from './../common/logger';

var proc: child_process.ChildProcess;
var redSettings = settings.RedSettings.getInstance();

const redVSCodeTypeMappings = new Map<string, vscode.CompletionItemKind>();
var mappings = {
    "none": vscode.CompletionItemKind.Value,
    "type": vscode.CompletionItemKind.Class,
    "object": vscode.CompletionItemKind.Class,
    "map": vscode.CompletionItemKind.Class,
    "function": vscode.CompletionItemKind.Function,
    "builtin": vscode.CompletionItemKind.Function,
    "file": vscode.CompletionItemKind.File,
    "funcdef": vscode.CompletionItemKind.Function,
    "keyword": vscode.CompletionItemKind.Keyword,
    "variable": vscode.CompletionItemKind.Variable,
    "value": vscode.CompletionItemKind.Value,
    "param": vscode.CompletionItemKind.Variable
};

Object.keys(mappings).forEach(key=> {
    redVSCodeTypeMappings.set(key, mappings[key]);
});

const redVSCodeSymbolMappings = new Map<string, vscode.SymbolKind>();
var symbolMappings = {
    "none": vscode.SymbolKind.Variable,
    "type": vscode.SymbolKind.Class,
    "object": vscode.SymbolKind.Class,
    "map": vscode.SymbolKind.Class,
    "function": vscode.SymbolKind.Function,
    "builtin": vscode.SymbolKind.Function,
    "file": vscode.SymbolKind.File,
    "funcdef": vscode.SymbolKind.Function,
    "keyword": vscode.SymbolKind.Variable,
    "variable": vscode.SymbolKind.Variable,
    "value": vscode.SymbolKind.Variable,
    "param": vscode.SymbolKind.Variable,
    "logic": vscode.SymbolKind.Boolean,
    "integer": vscode.SymbolKind.Number,
    "float": vscode.SymbolKind.Number,
    "string": vscode.SymbolKind.String,
    "block": vscode.SymbolKind.Array
};

Object.keys(symbolMappings).forEach(key=> {
    redVSCodeSymbolMappings.set(key, symbolMappings[key]);
});

function getMappedVSCodeType(redType: string): vscode.CompletionItemKind {
    if (redVSCodeTypeMappings.has(redType)) {
        return redVSCodeTypeMappings.get(redType);
    }
    else {
        return vscode.CompletionItemKind.Keyword;
    }
}

function getMappedVSCodeSymbol(redType: string): vscode.SymbolKind {
    if (redVSCodeTypeMappings.has(redType)) {
        return redVSCodeSymbolMappings.get(redType);
    }
    else {
        return vscode.SymbolKind.Variable;
    }
}

export enum CommandType {
    Arguments,
    Completions,
    Usages,
    Definitions,
    Symbols
}

var commandNames = new Map<CommandType, string>();
commandNames.set(CommandType.Arguments, "arguments");
commandNames.set(CommandType.Completions, "completions");
commandNames.set(CommandType.Definitions, "definitions");
commandNames.set(CommandType.Usages, "usages");
commandNames.set(CommandType.Symbols, "names");

export class RedProxy extends vscode.Disposable {
    public constructor(context: vscode.ExtensionContext) {
        super(killProcess);

        context.subscriptions.push(this);
        initialize(context.asAbsolutePath("."));
    }

    private cmdId: number = 0;

    public getNextCommandId(): number {
        return this.cmdId++;
    }
    public sendCommand<T extends ICommandResult>(cmd: ICommand<T>): Promise<T> {
        return sendCommand(cmd);
    }
}

function initialize(dir: string) {
    spawnProcess(path.join(dir, "redFiles"));
}

var previousData = "";
var commands = new Map<number, IExecutionCommand<ICommandResult>>();
var commandQueue: number[] = [];

function killProcess() {
    try {
        if (proc) {
            proc.kill();
        }
    }
    catch (ex) { }
}

function handleError(source: string, errorMessage: string) {
    logger.error(source + ' redProxy', `Error (${source}) ${errorMessage}`);
}

function spawnProcess(dir: string) {
    logger.log("cwd: ", dir);
    try {
        logger.log('child_process.spawn in redProxy', 'Value of redSettings.redConsolePath is : ' + redSettings.redConsolePath);
        proc = child_process.spawn(redSettings.redConsolePath, ["completion.red"], {
            cwd: dir
        });
    }
    catch (ex) {
        return handleError("spawnProcess", ex.message);
    }
    proc.stderr.setEncoding('utf8');
    proc.stderr.on("data", (data: string) => {
        handleError("stderr", data);
    });
    proc.on("end", (end) => {
        logger.error('spawnProcess.end', "End - " + end);
    });
    proc.on("error", error => {
        handleError("error", String(error));
    });

    proc.stdout.setEncoding('utf8');
    proc.stdout.on("data", (data: string) => {
        //Possible there was an exception in parsing the data returned
        //So append the data then parse it
        var dataStr = previousData = previousData + data + ""
        var responses: any[];
        try {
            responses = dataStr.split("\n").filter(line=> line.length > 0).map(resp=> JSON.parse(resp));
            previousData = "";
        }
        catch (ex) {
            //Possible we've only received part of the data, hence don't clear previousData
            handleError("stdout", ex.message);
            return;
        }

        responses.forEach((response) => {
            if (response["argments"]) {
                var index = commandQueue.indexOf(cmd.id);
                commandQueue.splice(index, 1);
                return;
            }
            var responseId = <number>response["id"];

            var cmd = <IExecutionCommand<ICommandResult>>commands.get(responseId);

            if (typeof cmd === "object" && cmd !== null) {
                commands.delete(responseId);
                var index = commandQueue.indexOf(cmd.id);
                commandQueue.splice(index, 1);

                //Check if this command has expired
                if (cmd.token.isCancellationRequested) {
                    return;
                }

                switch (cmd.command) {
                    case CommandType.Completions: {
                        var results = <IAutoCompleteItem[]>response['results'];
                        if (results.length > 0) {
                            results.forEach(item=> {
                                item.type = getMappedVSCodeType(<string><any>item.type);
                                item.kind = getMappedVSCodeSymbol(<string><any>item.type);
                            });

                            var completionResult: ICompletionResult = {
                                items: results,
                                requestId: cmd.id
                            }
                            cmd.resolve(completionResult);
                        }
                        break;
                    }
                    case CommandType.Definitions: {
                        var defs = <any[]>response['results'];
                        if (defs.length > 0) {
                            var def = defs[0];
                            var defResult: IDefinitionResult = {
                                requestId: cmd.id,
                                definition: {
                                    columnIndex: Number(def.column),
                                    fileName: def.fileName,
                                    lineIndex: Number(def.line),
                                    text: def.text,
                                    type: getMappedVSCodeType(<string>def.type),
                                    kind: getMappedVSCodeSymbol(<string>def.type)
                                }
                            };

                            cmd.resolve(defResult);
                        }
                        break;
                    }
                    case CommandType.Symbols: {
                        var defs = <any[]>response['results'];
                        if (defs.length > 0) {
                            var defResults: ISymbolResult = {
                                requestId: cmd.id,
                                definitions: []
                            }
                            defResults.definitions = defs.map(def=> {
                                return <IDefinition>{
                                    columnIndex: <number>def.column,
                                    fileName: <string>def.fileName,
                                    lineIndex: <number>def.line,
                                    text: <string>def.text,
                                    type: getMappedVSCodeType(<string>def.type),
                                    kind: getMappedVSCodeSymbol(<string><any>def.type)
                                };
                            });

                            cmd.resolve(defResults);
                        }
                        break;
                    }
                    case CommandType.Usages: {
                        var defs = <any[]>response['results'];
                        if (defs.length > 0) {
                            var refResult: IReferenceResult = {
                                requestId: cmd.id,
                                references: defs.map(item=> {
                                    return {
                                        columnIndex: item.column,
                                        fileName: item.fileName,
                                        lineIndex: item.line - 1,
                                        moduleName: item.moduleName,
                                        name: item.name
                                    };
                                }
                                )
                            };

                            cmd.resolve(refResult);
                        }
                        break;
                    }
                }
            }
            
            //Ok, check if too many pending requets
            if (commandQueue.length > 10) {
                var items = commandQueue.splice(0, commandQueue.length - 10);
                items.forEach(id=> {
                    if (commands.has(id)) {
                        commands.delete(id);
                    }
                })
            }
        });
    });
}

function sendCommand<T extends ICommandResult>(cmd: ICommand<T>): Promise<T> {
    return new Promise<ICommandResult>((resolve, reject) => {
        if (!proc) {
            return reject("Red proc not initialized");
        }
        var exexcutionCmd = <IExecutionCommand<T>>cmd;
        var payload = createPayload(exexcutionCmd);
        exexcutionCmd.resolve = resolve;
        exexcutionCmd.reject = reject;
        try {
            proc.stdin.write(JSON.stringify(payload) + "\n");
            commands.set(exexcutionCmd.id, exexcutionCmd);
            commandQueue.push(exexcutionCmd.id);
        }
        catch (ex) {
            //If 'This socket is closed.' that means process didn't start at all (at least not properly)
            if (ex.message === "This socket is closed.") {
                killProcess();
            }
            else {
                handleError("sendCommand", ex.message);
            }
            reject(ex.message);
        }
    });
}

function createPayload<T extends ICommandResult>(cmd: IExecutionCommand<T>): any {
    var payload = {
        id: cmd.id,
        prefix: "",
        lookup: commandNames.get(cmd.command),
        path: cmd.fileName,
        source: cmd.source,
        line: cmd.lineIndex,
        column: cmd.columnIndex,
        config: {}                  //getConfig()
    };

    if (cmd.command === CommandType.Symbols) {
        delete payload.column;
        delete payload.line;
    }

    return payload;
}

export interface ICommand<T extends ICommandResult> {
    command: CommandType;
    source: string;
    fileName: string;
    lineIndex: number;
    columnIndex: number;
}

interface IExecutionCommand<T extends ICommandResult> extends ICommand<T> {
    id?: number;
    resolve: (value?: T) => void
    reject: (ICommandError) => void;
    token: vscode.CancellationToken;
}

export interface ICommandError {
    message: string
}

export interface ICommandResult {
    requestId: number
}
export interface ICompletionResult extends ICommandResult {
    items: IAutoCompleteItem[];
}
export interface IDefinitionResult extends ICommandResult {
    definition: IDefinition;
}
export interface IReferenceResult extends ICommandResult {
    references: IReference[];
}
export interface ISymbolResult extends ICommandResult {
    definitions: IDefinition[]
}

export interface IReference {
    name: string,
    fileName: string,
    columnIndex: number,
    lineIndex: number,
    moduleName: string
}

export interface IAutoCompleteItem {
    type: vscode.CompletionItemKind;
    kind: vscode.SymbolKind;
    text: string;
    description: string;
    rightLabel: string;
}
export interface IDefinition {
    type: vscode.CompletionItemKind;
    kind: vscode.SymbolKind;
    text: string;
    fileName: string;
    columnIndex: number;
    lineIndex: number;
}


export class RedProxyHandler<R extends ICommandResult, T> {
    private redProxy: RedProxy;
    private defaultCallbackData: T;

    private lastToken: vscode.CancellationToken;
    private lastCommandId: number;
    private promiseResolve: (value?: T) => void;
    private parseResponse: (data: R) => T;
    private cancellationTokenSource: vscode.CancellationTokenSource;

    public constructor(context: vscode.ExtensionContext, defaultCallbackData: T, parseResponse: (data: R) => T) {
        this.redProxy = new RedProxy(context);
        this.defaultCallbackData = defaultCallbackData;
        this.parseResponse = parseResponse;
    }

    public sendCommand(cmd: ICommand<R>, resolve: (value: T) => void, token?: vscode.CancellationToken) {
        var executionCmd = <IExecutionCommand<R>>cmd;
        executionCmd.id = executionCmd.id || this.redProxy.getNextCommandId();

        if (this.cancellationTokenSource) {
            try {
                this.cancellationTokenSource.cancel();
            }
            catch (ex) { }
        }

        this.cancellationTokenSource = new vscode.CancellationTokenSource();
        executionCmd.token = this.cancellationTokenSource.token;

        this.redProxy.sendCommand<R>(executionCmd).then(data=> this.onResolved(data), () => { });
        this.lastCommandId = executionCmd.id;
        this.lastToken = token;
        this.promiseResolve = resolve;
    }

    private onResolved(data: R) {
        if (this.lastToken.isCancellationRequested || data.requestId !== this.lastCommandId) {
            this.promiseResolve(this.defaultCallbackData);
        }
        if (data) {
            this.promiseResolve(this.parseResponse(data));
        }
        else {
            this.promiseResolve(this.defaultCallbackData);
        }
    }
}
