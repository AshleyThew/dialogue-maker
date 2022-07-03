import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { DefaultPortModel } from "@projectstorm/react-diagrams";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";
import { StartFactory } from "./StartNodeFactory";

export interface StartNodeModelOptions extends BaseNodeModelOptions {}

export interface StartNodeModelGenerics extends BaseNodeModelGenerics<StartNodeModelOptions> {}

export class StartNodeModel extends BaseNodeModel<StartNodeModelGenerics> {
	constructor(options?: StartNodeModelOptions);
	constructor(options: any = {}) {
		if (typeof options === "string") {
			options = {
				title: options,
			};
		}
		super({
			type: "start",
			title: "Start",
			editableTitle: true,
			inputs: 0,
			outputs: 1,
			...options,
		});
	}

	deserialize(event: DeserializeEvent<this>): void {
		super.deserialize(event);
		this.options.editableTitle = event.data.title !== "Start";
		this.options.color = StartFactory.options.color;
	}

	clone(lookupTable?: { [s: string]: any }) {
		return undefined;
	}

	getInPorts(): DefaultPortModel[] {
		return this.portsIn;
	}

	getOutPorts(): DefaultPortModel[] {
		return this.portsOut;
	}
}
