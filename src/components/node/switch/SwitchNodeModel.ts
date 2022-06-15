import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";

export interface SwitchNodeModelOptions extends BaseNodeModelOptions {
	switch?: string;
}

export interface SwitchNodeModelGenerics extends BaseNodeModelGenerics<SwitchNodeModelOptions> {
	switch?: string;
}

export class SwitchNodeModel extends BaseNodeModel<SwitchNodeModelGenerics> {
	constructor(options?: SwitchNodeModelOptions);
	constructor(options: any = {}) {
		if (typeof options === "string") {
			options = {
				switch: "",
			};
		}
		super({
			type: "switch",
			title: "Switch",
			editableTitle: false,
			inputs: 1,
			outputs: 0,
			...options,
		});
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.switch = event.data.switch;
	}

	serialize(): any {
		return {
			...super.serialize(),
			switch: this.options.switch,
		};
	}
}
