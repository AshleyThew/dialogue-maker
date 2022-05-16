import { DefaultPortModel } from "@projectstorm/react-diagrams";
import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";

export interface OptionNodeModelOptions extends BaseNodeModelOptions {
	text?: string;
}

export interface OptionNodeModelGenerics extends BaseNodeModelGenerics<OptionNodeModelOptions> {}

export class OptionNodeModel extends BaseNodeModel<OptionNodeModelGenerics> {
	constructor(name: string, text: string);
	constructor(options?: OptionNodeModelOptions);
	constructor(options: any = {}, text?: string) {
		if (typeof options === "string") {
			options = {
				title: options,
				text: text,
			};
		}
		super({
			type: "option",
			title: "Select an option.",
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
