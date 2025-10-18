/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ICommandAction } from '../../action/common/action.js';
import { IKeybindingRule } from '../../keybinding/common/keybindingsRegistry.js';
import { decodeKeybinding, KeyCodeChord } from '../../../base/common/keybindings.js';
import { KeyCodeUtils } from '../../../base/common/keyCodes.js';
import { OperatingSystem } from '../../../base/common/platform.js';

type OneOrN<T> = T | readonly T[];

export function logActionMetadata(command: ICommandAction, keybinding: OneOrN<Omit<IKeybindingRule, 'id'>> | undefined): void {
	try {
		const titleStr = typeof command.title === 'string'
			? command.title
			: (command.title as any)?.value || (command.title as any)?.original || String(command.title);

		const preconditionStr = command.precondition
			? (command.precondition.serialize ? command.precondition.serialize() : String(command.precondition))
			: undefined;

		// Extract keybinding info
		let keybindingInfo: any = undefined;
		if (keybinding) {
			if (Array.isArray(keybinding)) {
				keybindingInfo = keybinding.map(kb => {
					const result: any = {
						when: kb.when?.serialize ? kb.when.serialize() : kb.when ? String(kb.when) : undefined,
						...processKeybindingObject(kb as any)
					};
					return result;
				});
			} else {
				const kb = keybinding as Omit<IKeybindingRule, 'id'>;
				keybindingInfo = {
					when: kb.when?.serialize ? kb.when.serialize() : kb.when ? String(kb.when) : undefined,
					...processKeybindingObject(kb as any)
				};
			}
		}

		console.log('[ACTION2]', JSON.stringify({
			id: command.id,
			title: titleStr,
			precondition: preconditionStr,
			category: typeof command.category === 'string' ? command.category : (command.category as any)?.value,
			keybinding: keybindingInfo
		}));
	} catch (e) {
		// Ignore logging errors
	}
}

export function keybindingToString(kb: number | number[] | undefined, os: OperatingSystem): string | undefined {
	if (!kb) {
		return undefined;
	}
	const decoded = decodeKeybinding(kb, os);
	if (!decoded) {
		return undefined;
	}

	const parts: string[] = [];
	for (const chord of decoded.chords) {
		if (chord instanceof KeyCodeChord) {
			const modifiers: string[] = [];
			if (chord.ctrlKey) { modifiers.push('Ctrl'); }
			if (chord.shiftKey) { modifiers.push('Shift'); }
			if (chord.altKey) { modifiers.push('Alt'); }
			if (chord.metaKey) { modifiers.push(os === OperatingSystem.Macintosh ? 'Cmd' : 'Win'); }
			const keyName = KeyCodeUtils.toString(chord.keyCode);
			if (keyName) { modifiers.push(keyName); }
			parts.push(modifiers.join('+'));
		}
	}
	return parts.join(' ');
}

interface KeybindingObject {
	primary?: number | number[];
	secondary?: number[];
	win?: { primary?: number | number[]; secondary?: number[] };
	linux?: { primary?: number | number[]; secondary?: number[] };
	mac?: { primary?: number | number[]; secondary?: number[] };
}

/**
 * Process a keybinding object and extract platform-specific keybinding strings
 */
export function processKeybindingObject(kb: KeybindingObject): { primary?: any; secondary?: any } {
	const result: { primary?: any; secondary?: any } = {};

	if (kb.primary || kb.win?.primary || kb.linux?.primary || kb.mac?.primary) {
		result.primary = {
			win: keybindingToString(kb.win?.primary || kb.primary, OperatingSystem.Windows),
			linux: keybindingToString(kb.linux?.primary || kb.primary, OperatingSystem.Linux),
			mac: keybindingToString(kb.mac?.primary || kb.primary, OperatingSystem.Macintosh)
		};
	}

	if (kb.secondary || kb.win?.secondary || kb.linux?.secondary || kb.mac?.secondary) {
		const winSecondary = kb.win?.secondary || kb.secondary;
		const linuxSecondary = kb.linux?.secondary || kb.secondary;
		const macSecondary = kb.mac?.secondary || kb.secondary;

		result.secondary = {
			win: winSecondary ? winSecondary.map(k => keybindingToString(k, OperatingSystem.Windows)).filter(Boolean) : undefined,
			linux: linuxSecondary ? linuxSecondary.map(k => keybindingToString(k, OperatingSystem.Linux)).filter(Boolean) : undefined,
			mac: macSecondary ? macSecondary.map(k => keybindingToString(k, OperatingSystem.Macintosh)).filter(Boolean) : undefined
		};
	}

	return result;
}
