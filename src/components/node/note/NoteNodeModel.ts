import { DefaultPortModel } from "@projectstorm/react-diagrams";
import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";

export interface NoteNodeModelOptions extends BaseNodeModelOptions {
	text?: string;
}

export interface NoteNodeModelGenerics extends BaseNodeModelGenerics<NoteNodeModelOptions> {}

export class NoteNodeModel extends BaseNodeModel<NoteNodeModelGenerics> {
	constructor(name: string, text: string);
	constructor(options?: NoteNodeModelOptions);
	constructor(options: any = {}, text?: string) {
		if (typeof options === "string") {
			options = {
				title: options,
				text: text,
			};
		}
		super({
			type: "note",
			title: "Note",
			text: "",
			inputs: 0,
			outputs: 0,
			...options,
		});
	}

	doClone(lookupTable: {}, clone: any): void {
		super.doClone(lookupTable, clone);
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.text = event.data.text;
	}

	serialize(): any {
		return {
			...super.serialize(),
			text: this.options.text,
		};
	}

	getInPorts(): DefaultPortModel[] {
		return this.portsIn;
	}

	getOutPorts(): DefaultPortModel[] {
		return this.portsOut;
	}

	getText(): string {
		return this.options.text;
	}
}
