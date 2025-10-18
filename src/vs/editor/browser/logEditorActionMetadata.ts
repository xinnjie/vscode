/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { processKeybindingObject } from '../../platform/actions/common/logActionMetadata.js';
import { EditorAction, ICommandKeybindingsOptions } from './editorExtensions.js';

export function logEditorActionMetadata(action: EditorAction): void {
	try {
		const titleStr = action.label;
		const preconditionStr = action.precondition
			? (action.precondition.serialize ? action.precondition.serialize() : String(action.precondition))
			: undefined;

		// Extract keybinding info from action's private _kbOpts
		let keybindingInfo: any = undefined;
		const kbOpts = (action as any)._kbOpts as ICommandKeybindingsOptions | ICommandKeybindingsOptions[] | undefined;

		if (kbOpts) {
			const kbOptsArr = Array.isArray(kbOpts) ? kbOpts : [kbOpts];
			keybindingInfo = kbOptsArr.map(kb => {
				const result: any = {
					when: kb.kbExpr?.serialize ? kb.kbExpr.serialize() : kb.kbExpr ? String(kb.kbExpr) : undefined,
					weight: kb.weight,
					...processKeybindingObject(kb)
				};
				return result;
			});

			if (keybindingInfo.length === 1) {
				keybindingInfo = keybindingInfo[0];
			}
		}

		console.log('[EDITOR_ACTION]', JSON.stringify({
			id: action.id,
			label: titleStr,
			alias: action.alias,
			precondition: preconditionStr,
			keybinding: keybindingInfo
		}));
	} catch (e) {
		// Ignore logging errors
	}
}
