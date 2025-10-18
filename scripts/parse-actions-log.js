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
    const actionMap = new Map();

    let parsedCount = 0;
    for (const line of lines) {
        const match = line.match(/\[ACTION2\]\s+(\{.+\})/);
        if (match) {
            try {
                const actionData = JSON.parse(match[1]);
                if (actionData.id && !actionMap.has(actionData.id)) {
                    actions.push(actionData);
                    actionMap.set(actionData.id, true);
                    parsedCount++;
                }
            } catch (e) {
                console.error(`⚠️  Failed to parse: ${line.substring(0, 100)}`);
            }
        }
    }

    return actions;
}

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Usage: node parse-actions-log.js <log file path>');
        console.error('');
        console.error('Example:');
        console.error('  node scripts/parse-actions-log.js /tmp/vscode.log');
        console.error('');
        console.error('Output: JSON array of actions to stdout');
        process.exit(1);
    }

    const logFilePath = args[0];

    const actions = parseActionsFromLog(logFilePath);

    if (actions.length === 0) {
        console.error('❌ No action data found');
        process.exit(1);
    }

    console.log(JSON.stringify(actions, null, 2));
}

if (require.main === module) {
    main();
}
