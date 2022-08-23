import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as vscode from 'vscode';
import { join } from 'path';

export interface Config {
    chinstrap: Chinstrap;
}

export interface Chinstrap {
    network: Network;
    compiler: Compiler;
}

export interface Compiler {
    lang: string;
    test: string;
}

export interface Network {
    development: INetwork;
    jakarta: INetwork;
    mainnet: INetwork;
}

export interface INetwork {
    host: string;
    accounts: Account[];
}

export interface Account {
    privateKeyFile: string;
}

export const getConfig = (path: string) => {
    return (yaml.load(fs.readFileSync(path, "utf8")) as Config).chinstrap;
}

let _channel: vscode.OutputChannel;
export const getOutputChannel = (): vscode.OutputChannel => {
	if (!_channel) {
		_channel = vscode.window.createOutputChannel('Chinstrap');
	}
	return _channel;
}

export enum OutputLevel {
	FATAL = "FATAL",
	ERROR = "ERROR",
	WARN  = "WARN",
	INFO  = "INFO",
	DEBUG = "DEBUG",
    NONE  = ""
}

export const logMessage = (msg: string, level: OutputLevel) => {
    if (level==OutputLevel.NONE)
        getOutputChannel().append(`${msg}`)
    else
        getOutputChannel().append(`[${level}] ${msg}`)
}

export const logToSameLine = (msg: string, level: OutputLevel) => {
    getOutputChannel().clear()
    if (level==OutputLevel.NONE)
        getOutputChannel().append(`${msg}`)
    else
        getOutputChannel().append(`[${level}] ${msg}`)
}