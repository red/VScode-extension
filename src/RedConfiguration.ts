'use strict';

import { workspace, WorkspaceConfiguration } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

function folderExists(path: fs.PathLike)
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

function checkFileExists(filePath: fs.PathLike) {
	try {
		return (fs.statSync(filePath)).isFile();
	} catch (err) {
		return false;
	}
}

/**
 * @param {string} exe executable name (without extension if on Windows)
 * @return {string|null} executable path if found
 * */
function findExecutable(exe: string) {
    const envPath = process.env.PATH || "";
	let ext: string;
	if (process.platform === 'win32') {
    	ext = ".exe";
	} else {
		ext = "";
	}
    const pathDirs = envPath
        .replace(/["]+/g, "")
        .split(path.delimiter)
        .filter(Boolean);
    const candidates = pathDirs.map((d) => path.join(d, exe + ext));
    for (let i in candidates) {	
		if (checkFileExists(candidates[i])) {return candidates[i];};
	}
	return '';
}

function getRedConsole(gui: boolean) {
	let name = 'red';
	if (gui) {name = 'red-view';}
	let exe = findExecutable(name);
	if (exe !== '') {return exe;}

	let preBuiltPath: string;
	if (process.platform === 'win32') {
		preBuiltPath = path.join(process.env.ALLUSERSPROFILE || "c:", 'Red');
	} else {
		preBuiltPath = path.join(process.env.HOME || "/tmp", '.red');
		if (!folderExists(preBuiltPath)) {
			preBuiltPath = "/tmp/.red/";
		}
	}
	try {
		let files = fs.readdirSync(preBuiltPath);
		let _console = '';
		let startsWith = 'console-';
		if (gui) {startsWith = 'gui-console-';}
		for (let i in files) {
			let name = files[i];
			let ext = path.extname(name);
			if (name.startsWith(startsWith) && (ext === '.exe' || ext === '')) {
				if (_console === '') {
					_console = name;
				} else {
					let stamps1 = path.basename(_console, ext).split("-");
					let stamps2 = path.basename(name, ext).split("-");
					for (let j in stamps2) {
						if (+stamps1[j] < +stamps2[j]) {
							_console = name;
							break;
						}
					}
				}
			}
		}
		return path.join(preBuiltPath, _console);
	}
	catch (err) {
		return '';
	}
}

export class RedConfiguration {
	private static redConfigs: RedConfiguration = new RedConfiguration();
	public static getInstance(): RedConfiguration {
		return RedConfiguration.redConfigs;
	}
	public get isIntelligence(): boolean {
		return this.configuration.get<boolean>('red.intelligence', true);
	}

	public get needRlsDebug(): boolean {
		return this.configuration.get<boolean>('red.rls-debug', false);
	}

	public get redCore(): string {
		return this.configuration.get<string>('red.redPath', '');
	}

	public get redView(): string {
		return this.configuration.get<string>('red.redViewPath', '');
	}

	public get redToolChain(): string {
		let path = this.configuration.get<string>('red.redToolChainPath', '');
		return path === '' ? findExecutable("red-toolchain") : path;
	}

	public get redExcludedPath(): string { 
		return this.configuration.get<string>('red.excludedPath', ''); 
	}

	public get redConsole(): string {
		let path = this.redCore;
		return path === '' ? getRedConsole(false) : path; 
	}

	public get redGuiConsole(): string {
		let path = this.redView;
		return path === '' ? getRedConsole(true) : path;
	}

	public get redWorkSpace(): string {
		return this.configuration.get<string>('red.buildDir', '');
	}

	public get allConfigs(): any {
		return this.configuration.get('red', {}) as any;
	}

	private readonly configuration: WorkspaceConfiguration;

	constructor() {
		if (RedConfiguration.redConfigs) {
			throw new Error('Singleton class, Use getInstance method');
		}
		this.configuration = workspace.getConfiguration();
	}
}
