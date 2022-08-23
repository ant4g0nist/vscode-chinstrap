import * as vscode from 'vscode';
import * as views from './views/';
import {FileExplorer} from './commons/fileExplorer';
import * as commands from './commands';
import path = require('path');
import { getOutputChannel } from './commons';

const memoryState = {
	configWatchers: new Map<string, vscode.FileSystemWatcher[]>(),
};

export async function activate(context: vscode.ExtensionContext) {
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

	await commands.checkRequired()
	const contractProvider = new views.contracts.ContractsProvider(rootPath);
	vscode.window.registerTreeDataProvider('contractProvider', contractProvider);

	const testProvider = new views.tests.TestsProvider(rootPath);
	vscode.window.registerTreeDataProvider('testProvider', testProvider);

	const originationProvider = new views.originations.OriginationProvider(rootPath);
	vscode.window.registerTreeDataProvider('originationProvider', originationProvider);

    const contractsWatcher = vscode.workspace.createFileSystemWatcher(path.join(rootPath, 'contracts/*'));
    const testsWatcher = vscode.workspace.createFileSystemWatcher(path.join(rootPath, 'tests/*'));
    const originationWatcher = vscode.workspace.createFileSystemWatcher(path.join(rootPath, 'originations/*'));
	
	memoryState.configWatchers.set(path.join(rootPath, 'contracts/*'), [contractsWatcher]);
	memoryState.configWatchers.set(path.join(rootPath, 'tests/*'), [testsWatcher]);
	memoryState.configWatchers.set(path.join(rootPath, 'originations/*'), [originationWatcher]);

    contractsWatcher.onDidChange(_ => contractProvider?.refresh());
    contractsWatcher.onDidCreate(_ => contractProvider?.refresh());
    contractsWatcher.onDidDelete(_ => contractProvider?.refresh());

	testsWatcher.onDidChange(_ => testProvider?.refresh());
    testsWatcher.onDidCreate(_ => testProvider?.refresh());
    testsWatcher.onDidDelete(_ => testProvider?.refresh());

	originationWatcher.onDidChange(_ => originationProvider?.refresh());
    originationWatcher.onDidCreate(_ => originationProvider?.refresh());
    originationWatcher.onDidDelete(_ => originationProvider?.refresh());

	vscode.commands.registerCommand('chinstrap.views.contracts.refresh', (_) => contractProvider.refresh());
	vscode.commands.registerCommand('chinstrap.views.tests.refresh', (_) => testProvider.refresh());
	vscode.commands.registerCommand('chinstrap.originations.tests.refresh', (_) => originationProvider.refresh());

	new FileExplorer(context);

	const init = vscode.commands.registerCommand('chinstrap.init', async () => {
		await commands.init();
	});

	const initWithSamples = vscode.commands.registerCommand('chinstrap.initWithSamples', async () => {
		await commands.initWithSamples();
	});

	const compile = vscode.commands.registerCommand('chinstrap.compile', async (path: any) => {
		await commands.compile(path);
	});

	const compileAll = vscode.commands.registerCommand('chinstrap.compileAllContracts', async () => {
		await commands.compileAllContracts();
	});

	const test = vscode.commands.registerCommand('chinstrap.test', async (path: any) => {
		await commands.test(path);
	});
	
	const runAllTests = vscode.commands.registerCommand('chinstrap.runAllTests', async () => {
		await commands.runAllTests();
	});

	const origination = vscode.commands.registerCommand('chinstrap.origination', async (path: any) => {
		await commands.originate(path);
	});

	const startSandbox = vscode.commands.registerCommand('chinstrap.startSandbox', async () => {
		await commands.startSandbox();
	});

	const stopSandbox = vscode.commands.registerCommand('chinstrap.stopSandbox', async () => {
		await commands.stopSandbox();
	});

	context.subscriptions.push(init);
	context.subscriptions.push(initWithSamples);
	context.subscriptions.push(compile);
	context.subscriptions.push(compileAll);
	context.subscriptions.push(test);
	context.subscriptions.push(runAllTests);
	context.subscriptions.push(origination);
	context.subscriptions.push(startSandbox);
	context.subscriptions.push(stopSandbox);

	getOutputChannel().append("Loaded Chinstrap extension.")
}

export function deactivate() {
	for (const watcherList of memoryState.configWatchers.values()) {
		for (const watcher of watcherList) {
			watcher.dispose();
		}
	}
	memoryState.configWatchers.clear();
}
