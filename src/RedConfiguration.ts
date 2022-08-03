'use strict';

import { window, workspace, WorkspaceConfiguration } from 'vscode';
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

function checkFileExists(filePath: fs.PathLike, checkExec: boolean = false) {
	try {
		let isfile = fs.statSync(filePath).isFile();
		if (!isfile) {
			window.showErrorMessage('Cannot access file: ' + filePath);
		}
		if (checkExec && isfile) {
			if (!isExec(filePath)) {
				window.showErrorMessage('Not an executable: ' + filePath);
				return false;
			}
			return true;
		} else {
			return isfile;
		}
	} catch (err) {
		return false;
	}
}

function isExec(p: fs.PathLike) {
	try {
	  fs.accessSync(p, fs.constants.X_OK);
	  return true;
	} catch (e) {
	  return false;
	}
}

function parseDate(date: string) {
	const months = [
		'jan', 'feb', 'mar', 'apr', 'may', 'jun',
		'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
	];

	const day = Number(date.slice(0,2));
	const month = months.indexOf(date.slice(2,5).toLowerCase());
	const year = Number(date.slice(5,7));
	if (Number.isNaN(year) || Number.isNaN(day) || month === -1) {
		return undefined;
	}
	return new Date(year, month, day);
}

function searchRedTool(name: string, searchPath: string) {
	try {
		const expectExt = process.platform === 'win32' ? '.exe' : '';
		let files = fs.readdirSync(searchPath);
		let tool = '';
		let toolDate = new Date(1800, 0);
		let startsWith = name + '-';
		for (let f of files) {
			let ext = path.extname(f);
			let parts = path.basename(f, ext).slice(startsWith.length).split("-");
			if (f.startsWith(startsWith) && parts.length === 2 && parts[0].length === 7 && ext === expectExt) {
				let fpath = path.join(searchPath, f);
				let date = parseDate(parts[0]);
				let d = fs.statSync(fpath).mtime;
				if (date !== undefined) {
					date.setHours(d.getHours(), d.getMinutes(), d.getSeconds());
					if (tool === '') {
						toolDate = date;
						tool = fpath;
					} else {
						if (date > toolDate) {
							toolDate = date;
							tool = fpath;
						}
					}
				}
			}
		}
		if (tool === '') {
			tool = path.join(searchPath, name + expectExt);
			if (!fs.statSync(tool).isFile()) {return '';};
		}
		return tool;
	}
	catch (err) {
		return '';
	}
}

/**
 * @param {string} exe executable name (without extension if on Windows)
 * @return {string|null} executable path if found
 * */
function findExecutable(exe: string, searchPath: string = '') {
	let useOSPath = false;
	if (searchPath === '') {
		useOSPath = true;
		searchPath = process.env.PATH || "";
	}
	let ext: string;
	if (process.platform === 'win32') {
    	ext = ".exe";
	} else {
		ext = "";
	}
    const pathDirs = searchPath
        .replace(/["]+/g, "")
        .split(path.delimiter)
        .filter(Boolean);

	if (useOSPath) {
		const candidates = pathDirs.map((d) => path.join(d, exe + ext));
		for (let i in candidates) {	
			if (checkFileExists(candidates[i], true)) {return candidates[i];};
		}
	} else {
		for (let dir of pathDirs) {
			let tool = searchRedTool(exe, dir);
			if (tool !== '') {
				return checkFileExists(tool, true) ? tool : '';
			}
		}
	}
	return '';
}

function getRedTool(name: string, toolDir: string = '', gui: boolean = false) {
	if (toolDir !== '') {
		let exe = findExecutable(name, toolDir);
		if (exe !== '') {return exe;}
	}

	if (process.platform === 'win32') {
		// There is a `red` program on Linux already
		let exe = findExecutable(name);
		if (exe !== '') {return exe;}
	}

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
		if (_console === '') {return '';}

		let exe = path.join(preBuiltPath, _console);
		return checkFileExists(exe, true) ? exe : '';
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

	public get redDir(): string {
		return this.configuration.get<string>('red.redDir', '');
	}

	public get redCore(): string {
		let exe = this.configuration.get<string>('red.redPath', '');
		if (exe !== '' && !checkFileExists(exe, true)) {
			return '';
		}
		return exe;
	}

	public get redView(): string {
		let exe = this.configuration.get<string>('red.redViewPath', '');
		if (exe !== '' && !checkFileExists(exe, true)) {
			return '';
		}
		return exe;
	}

	public get redToolChain(): string {
		let path = this.configuration.get<string>('red.redToolChainPath', '');
		if (path !== '' && !checkFileExists(path, true)) {
			return '';
		}
		return path === '' ? findExecutable("red-toolchain", this.redDir) : path;
	}

	public get redExcludedPath(): string { 
		return this.configuration.get<string>('red.excludedPath', ''); 
	}

	public get redConsole(): string {
		let path = this.redCore;
		return path === '' ? getRedTool("red", this.redDir) : path; 
	}

	public get redGuiConsole(): string {
		let path = this.redView;
		return path === '' ? getRedTool("red-view", this.redDir, true) : path;
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
