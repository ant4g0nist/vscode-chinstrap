import { exec, spawn, ExecException } from 'child_process';
import path = require('path');
import * as vscode from 'vscode';
import { getConfig, logMessage, logToSameLine, OutputLevel } from '../commons';

enum Required {
    Chinstrap = "chinstrap --help",
    Docker = "docker --help"
};

export const checkRequired = async () => {
    //check chinstrap
    exec(Required.Chinstrap, (error: ExecException | null, stdout: string, stderr: string) => {
        if (stderr) {
            logMessage("Chinstrap not installed", OutputLevel.INFO);
            vscode.window.showErrorMessage("Chinstrap not installed");
        }
    });

    //check docker
    exec(Required.Docker, (error: ExecException | null, stdout: string, stderr: string) => {
        if (stderr) {
            logMessage(stderr, OutputLevel.ERROR);
            vscode.window.showErrorMessage(stderr);
        }
    });
};

//init
export const init = async () => {
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    exec(`chinstrap init`, {
        cwd: rootPath
    }, (error: ExecException | null, stdout: string, stderr: string) => {
        vscode.window.showErrorMessage(error?.message as string)
        if (stderr) {
            let msg = `Chinstrap project initialization failed: ${stderr ? stderr : stdout}`;
            logMessage(msg, OutputLevel.ERROR);
            vscode.window.showErrorMessage(msg);
        }

        else {
            const msg = "Chinstrap project initializated. Happy Hacking :)"
            logMessage(msg, OutputLevel.INFO);
            vscode.window.showInformationMessage(msg);
        }
    });
}

export const initWithSamples = async () => {
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    exec(`chinstrap init -s`, {
        cwd: rootPath
    }, (error: ExecException | null, stdout: string, stderr: string) => {
        vscode.window.showErrorMessage(error?.message as string)
        if (stderr) {
            let msg = `Chinstrap project initialization failed: ${stderr ? stderr : stdout}`;
            logMessage(msg, OutputLevel.ERROR);
            vscode.window.showErrorMessage(msg);
        }

        else {
            const msg = "Chinstrap project initializated. Happy Hacking :)"
            logMessage(msg, OutputLevel.INFO);
            vscode.window.showInformationMessage(msg);
        }
    });
}

//compile
export const compile = async (contract: string) => {
    const basename = path.basename(contract);
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    vscode.window.showInformationMessage(`Compiling ${basename}`);
    logMessage(`Compiling ${basename}`, OutputLevel.INFO)

    let compile = spawn('chinstrap', ['compile','-c', `contracts/${basename}`], {
        cwd: rootPath
    })

    compile.stdout.on('data', function (data: any) {
        logMessage(data, OutputLevel.NONE);
    });

    compile.stderr.on('data', function (data: any) {
        logMessage(data, OutputLevel.ERROR);
    });

    await new Promise( (resolve) => {
        compile.on('close', resolve)
    })
}

//compile
export const compileAllContracts = async () => {
    
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    vscode.window.showInformationMessage(`Compiling contracts`);

    let compile = spawn('chinstrap', ['compile'], {
        cwd: rootPath
    })

    compile.stdout.on('data', function (data: any) {
        logMessage(data, OutputLevel.NONE);
    });

    compile.stderr.on('data', function (data: any) {
        logMessage(data, OutputLevel.ERROR);
    });

    await new Promise( (resolve) => {
        compile.on('close', resolve)
    })
}


export const test = async (test: string) => {
    const basename = path.basename(test);
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    vscode.window.showInformationMessage(`Running test ${basename}`);

    let child = spawn('chinstrap', ['test','-t', `tests/${basename}`], {
        cwd: rootPath
    })

    child.stdout.on('data', function (data: any) {
        logMessage(data, OutputLevel.NONE);
    });

    child.stderr.on('data', function (data: any) {
        const msg = `Test failed! Check Outputs:Chinstrap tab for detailed error message.`;
        logMessage(data, OutputLevel.ERROR);
        vscode.window.showErrorMessage(msg);
    });

    await new Promise( (resolve) => {
        child.on('close', resolve)
    })
}

export const runAllTests = async () => {
    
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    vscode.window.showInformationMessage(`Running tests`);

    let child = spawn('chinstrap', ['test'], {
        cwd: rootPath
    })

    child.stdout.on('data', function (data: any) {
        logMessage(data, OutputLevel.NONE);
    });

    child.stderr.on('data', function (data: any) {
        const msg = `Tests failed! Check Outputs:Chinstrap tab for detailed error message.`;
        logMessage(data, OutputLevel.ERROR);
        vscode.window.showErrorMessage(msg);
    });

    await new Promise( (resolve) => {
        child.on('close', resolve)
    })
}

export const originate = async (origination: string) => {
    const basename = path.basename(origination);
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    vscode.window.showInformationMessage(`Running Origination ${basename}`);

    let child = spawn('chinstrap', ['origination','-o', `originations/${basename}`], {
        cwd: rootPath
    })

    child.stdout.on('data', function (data: any) {
        logMessage(data, OutputLevel.NONE);
    });

    child.stderr.on('data', function (data: any) {
        const msg = `Origination failed! Check Outputs:Chinstrap tab for detailed error message.`;
        logMessage(data, OutputLevel.ERROR);
        vscode.window.showErrorMessage(msg);
    });

    await new Promise( (resolve) => {
        child.on('close', resolve)
    })
}

export const startSandbox = async () => {
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    vscode.window.showInformationMessage(`Starting sandbox...`);

    let config = getConfig(`${rootPath}/chinstrap-config.yml`)

    // let i = 0;
    // const result = await vscode.window.showQuickPick(['jakarta', 'ithaca', 'hangzhou'], {
    // 	placeHolder: 'jakarta, ithaca or hangzhou',
    // 	// onDidSelectItem: item => vscode.window.showInformationMessage(`Focus ${++i}: ${item}`)
    // });
    // vscode.window.showInformationMessage(`Got: ${result}`);
    const port = await getInputBox("20000", 'For example: 20000');

    let child = spawn('chinstrap', ['sandbox','-p', 'Jakarta', '-o', `${port}`, '-c', '5'], {
        cwd: rootPath
    })

    child.stdout.on('data', function (data: any) {
        logMessage(data, OutputLevel.NONE);
    });

    child.stderr.on('data', function (data: any) {
        const msg = `Starting Sandbox failed! Check Outputs:Chinstrap tab for detailed error message.`;
        logMessage(data, OutputLevel.ERROR);
        vscode.window.showErrorMessage(msg);
    });

    await new Promise( (resolve) => {
        child.on('close', resolve)
    })
}

export const stopSandbox = async () => {
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    vscode.window.showInformationMessage(`Halting the sandbox...`);

    exec(`chinstrap sandbox -s`, {
        cwd: rootPath
    }, (error: ExecException | null, stdout: string, stderr: string) => {
        if (stderr || stdout.indexOf(' Failed!') !== -1) {
            let msg = `Sandbox halt failed: ${stderr ? stderr : stdout}`;
            logMessage(msg, OutputLevel.ERROR);
            vscode.window.showErrorMessage(msg);
        }

        else
            vscode.window.showInformationMessage(`Sandbox halted`);
    });
}

export async function getInputBox(value: string, placeHolder: string) {
    const result = await vscode.window.showInputBox({
        value: value,
        placeHolder: placeHolder,
        validateInput: (text: string) => {
            return isNaN(text as unknown as number) ? text : null
        }
    });
    return result
}