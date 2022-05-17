import { BaseNodeFactory, BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "./base";
import { ConditionFactory } from "./condition/ConditionNodeFactory";
import { DialogueFactory } from "./dialogue/DialogueNodeFactory";
import { OptionFactory } from "./option/OptionNodeFactory";

export * from "./dialogue/DialogueNodeFactory";
export * from "./dialogue/DialogueNodeModel";
export * from "./dialogue/DialogueNodeWidget";

export * from "./option/OptionNodeFactory";
export * from "./option/OptionNodeModel";
export * from "./option/OptionNodeWidget";

export * from "./condition/ConditionNodeFactory";
export * from "./condition/ConditionNodeModel";
export * from "./condition/ConditionNodeWidget";

export const NodeFactories: BaseNodeFactory<BaseNodeModel<BaseNodeModelGenerics<BaseNodeModelOptions>>>[] = [
	DialogueFactory,
	OptionFactory,
	ConditionFactory,
];
