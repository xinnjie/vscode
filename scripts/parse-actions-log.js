/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const fs = require('fs');

function parseActionsFromLog(logFilePath) {
    if (!fs.existsSync(logFilePath)) {
        console.error(`❌ File not found: ${logFilePath}`);
        process.exit(1);
    }

    const content = fs.readFileSync(logFilePath, 'utf-8');
    const lines = content.split('\n');

    const actions = [];
    const editorActions = [];
    const actionMap = new Map();
    const editorActionMap = new Map();

    let action2Count = 0;
    let editorActionCount = 0;

    for (const line of lines) {
        // Match [ACTION2] logs
        const action2Match = line.match(/\[ACTION2\]\s+(\{.+\})/);
        if (action2Match) {
            try {
                const actionData = JSON.parse(action2Match[1]);
                if (actionData.id && !actionMap.has(actionData.id)) {
                    actionData.type = 'ACTION2';
                    actions.push(actionData);
                    actionMap.set(actionData.id, true);
                    action2Count++;
                }
            } catch (e) {
                console.error(`⚠️  Failed to parse ACTION2: ${line.substring(0, 100)}`);
            }
            continue;
        }

        // Match [EDITOR_ACTION] logs
        const editorActionMatch = line.match(/\[EDITOR_ACTION\]\s+(\{.+\})/);
        if (editorActionMatch) {
            try {
                const actionData = JSON.parse(editorActionMatch[1]);
                if (actionData.id && !editorActionMap.has(actionData.id)) {
                    actionData.type = 'EDITOR_ACTION';
                    editorActions.push(actionData);
                    editorActionMap.set(actionData.id, true);
                    editorActionCount++;
                }
            } catch (e) {
                console.error(`⚠️  Failed to parse EDITOR_ACTION: ${line.substring(0, 100)}`);
            }
        }
    }

    console.error(`✓ Parsed ${action2Count} ACTION2 entries`);
    console.error(`✓ Parsed ${editorActionCount} EDITOR_ACTION entries`);

    return {
        actions,
        editorActions,
        all: [...actions, ...editorActions]
    };
}

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Usage: node parse-actions-log.js <log file path>');
        console.error('');
        console.error('Example:');
        console.error('  node scripts/parse-actions-log.js /tmp/vscode.log');
        console.error('');
        console.error('Output: JSON array of all actions (ACTION2 + EDITOR_ACTION) to stdout');
        process.exit(1);
    }

    const logFilePath = args[0];
    const result = parseActionsFromLog(logFilePath);

    if (result.all.length === 0) {
        console.error('❌ No action data found');
        process.exit(1);
    }

    console.error(`\n📊 Total output: ${result.all.length} entries\n`);
    console.log(JSON.stringify(result.all, null, 2));
}

if (require.main === module) {
    main();
}
