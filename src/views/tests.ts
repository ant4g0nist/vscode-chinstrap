import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getConfig } from '../commons'
import * as glob from 'glob';


export class TestsProvider implements vscode.TreeDataProvider<Test> {
    private contracts: any

    constructor(private workspaceRoot: any) { }

    getTreeItem(element: Test): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
        treeItem.command = { command: 'chinstrap.test', title: "Run the test", arguments: [element.path], };
        treeItem.contextValue = element.uri;
        return treeItem;
    }

    getChildren(element?: Test): Thenable<Test[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No Chinstrap project in empty workspace');
            return Promise.resolve([]);
        }

        if (element) {
            return Promise.resolve(
                this.getContractsFromPath(
                    path.join(this.workspaceRoot, 'chinstrap-config.yml')
                )
            );
        } else {
            const chinstrapConfig = path.join(this.workspaceRoot, 'chinstrap-config.yml');
            if (this.pathExists(chinstrapConfig)) {
                return Promise.resolve(this.getContractsFromPath(chinstrapConfig));
            } else
                vscode.window.showInformationMessage('Workspace has no Chinstrap config');
            return Promise.resolve([]);
        }
    }

    /**
     * Given the path to package.json, read all its dependencies and devDependencies.
     */
    private getContractsFromPath(chinstrapConfigPath: string): Test[] {
        if (this.pathExists(chinstrapConfigPath)) {
            const config = getConfig(chinstrapConfigPath)
            if (!config.network) {
                vscode.window.showInformationMessage("No network configured in Chinstrap");
                return [];
            }

            if (!config.compiler) {
                vscode.window.showInformationMessage("No compiler configured in Chinstrap");
                return [];
            }

            let ext: string = "py"

            if (config.compiler.lang == "jsligo")
                ext = "jsligo"
            else if (config.compiler.lang == "reasonligo")
                ext = "religo"
            else if (config.compiler.lang == "cameligo")
                ext = "mligo"
            else if (config.compiler.lang == "pascaligo")
                ext = "ligo"

            this.contracts = glob.sync(this.workspaceRoot + `/tests/*.${ext}`);

            const contracts = (modulePath: string): Test => {
                let moduleName = path.basename(modulePath)
                if (this.pathExists(path.join(modulePath))) {
                    return new Test(
                        moduleName,
                        modulePath,
                        vscode.TreeItemCollapsibleState.None
                    );
                } else {
                    return new Test(moduleName, modulePath, vscode.TreeItemCollapsibleState.None);
                }
            }
            return Object.keys(this.contracts).map(dep => contracts(this.contracts[dep]))
        } else {
            return [];
        }
    }

    private pathExists(p: string): boolean {
        try {
            fs.accessSync(p);
        } catch (err) {
            return false;
        }
        return true;
    }


    private _onDidChangeTreeData: vscode.EventEmitter<Test | undefined | null | void> = new vscode
        .EventEmitter<
            Test | undefined | null | void
        >();
    readonly onDidChangeTreeData: vscode.Event<Test | undefined | null | void> =
        this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

}

class Test extends vscode.TreeItem {
    path: string = ""
    constructor(
        public readonly label: string,
        public readonly uri: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.path = uri
    }

    iconPath = {
        light: path.join(__filename, 'img', 'icon.png'),
        dark: path.join(__filename, 'img', 'icon.png')
    };
}