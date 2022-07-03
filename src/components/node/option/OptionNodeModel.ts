import * as _ from "lodash";
import { DefaultPortModel } from "@projectstorm/react-diagrams";
import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";
import { Conditions, ConditionalProps, ConditionProps } from "../../editor/Condition";
import { DialogueContextInterface } from "../../DialogueContext";
import { OptionFactory } from "./OptionNodeFactory";

export interface OptionProps extends ConditionalProps {
	text: string;
}

export class Option extends Conditions implements OptionProps {
	text: string;

	constructor(conditions?: any, args?: any, text?: any) {
		super(conditions, args);
		this.text = text || "";
	}

	serialize(): any {
		return { ...super.serialize(), text: this.text };
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
			outputs: 1,
			options: defaultOptions || [new Option()],
			...options,
		});
	}

	doClone(lookupTable: {}, clone: any): void {
		super.doClone(lookupTable, clone);
		const data = JSON.parse(JSON.stringify(this.options.options));
		clone.options.options = data.map((option) => {
			return new Option(option.conditions, option.args, option.text);
		});
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.options = event.data.options.map((option) => {
			return new Option(option.conditions, option.args, option.text);
		});
		this.options.color = OptionFactory.options.color;
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

	fix(context: DialogueContextInterface) {
		const { conditions } = context;
		const { options: opts } = this.options;
		opts.forEach((opt) => {
			opt.conditions.forEach((cond, index) => {
				const condition: ConditionProps = conditions.find((condition) => condition.condition === cond);
				while (condition && condition.variables.length && opt.args[index].length < condition.variables.length) {
					opt.args[index].push("");
				}
			});
		});
	}
}
