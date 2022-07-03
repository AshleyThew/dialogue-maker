import { DefaultPortModel } from "@projectstorm/react-diagrams";
import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";
import { DialogueFactory } from "./DialogueNodeFactory";

export interface DialogueNodeModelOptions extends BaseNodeModelOptions {
	text?: string;
}

export interface DialogueNodeModelGenerics extends BaseNodeModelGenerics<DialogueNodeModelOptions> {}

export class DialogueNodeModel extends BaseNodeModel<DialogueNodeModelGenerics> {
	constructor(name: string, text: string);
	constructor(options?: DialogueNodeModelOptions);
	constructor(options: any = {}, text?: string) {
		if (typeof options === "string") {
			options = {
				title: options,
				text: text,
			};
		}
		super({
			type: "dialogue",
			title: "Untitled",
			text: "",
			inputs: 1,
			outputs: 1,
			...options,
		});
	}

	doClone(lookupTable: {}, clone: any): void {
		super.doClone(lookupTable, clone);
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.text = event.data.text;
		this.options.color = DialogueFactory.options.color;
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
