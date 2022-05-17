import * as _ from "lodash";
import { DefaultPortModel } from "@projectstorm/react-diagrams";
import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";

export interface OptionProps {
	conditions?: string[];
	args?: [string[]];
	text: string;
}

export class Option implements OptionProps {
	conditions?: string[];
	args?: [string[]];
	text: string;

	constructor(conditions?: any, args?: any, text?: any) {
		this.conditions = conditions || [""];
		this.args = args || [];
		this.text = text || "";
	}

	serialize(): any {
		return {
			conditions: this.conditions,
			args: this.args,
			text: this.text,
		};
	}
}
export interface OptionNodeModelOptions extends BaseNodeModelOptions {
	options?: Option[];
}

export interface OptionNodeModelGenerics extends BaseNodeModelGenerics<OptionNodeModelOptions> {}

export class OptionNodeModel extends BaseNodeModel<OptionNodeModelGenerics> {
	constructor(name: string, text: string);
	constructor(options?: OptionNodeModelOptions);
	constructor(options: any = {}, text?: string, defaultOptions?: Option[]) {
		if (typeof options === "string") {
			options = {
				title: options,
				text: text,
				options: defaultOptions,
			};
		}
		super({
			type: "option",
			title: "Select an option.",
			inputs: 1,
			outputs: 2,
			options: defaultOptions || [new Option()],
			...options,
		});
	}

	doClone(lookupTable: {}, clone: any): void {
		super.doClone(lookupTable, clone);
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.options = event.data.options.map((option) => {
			return new Option(option.conditions, option.args, option.text);
		});
	}

	serialize(): any {
		return {
			...super.serialize(),
			options: _.map(this.options?.options, (option) => {
				return option.serialize();
			}),
		};
	}

	getInPorts(): DefaultPortModel[] {
		return this.portsIn;
	}

	getOutPorts(): DefaultPortModel[] {
		return this.portsOut;
	}
}
