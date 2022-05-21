import * as React from "react";
import { ActionProps } from "./editor/Action";
import { ConditionProps } from "./editor/Condition";
import { items } from "./sources/items";
import { quest } from "./sources/quest";
import { quests } from "./sources/quests";

export interface DialogueContextInterface {
	conditions: ConditionProps[];
	keys: string[];
	actions: ActionProps[];
	actionKeys: string[];
	sources: { [key: string]: string[] };
}

export const DialogueContext = React.createContext<DialogueContextInterface | null>(null);

const conditions = [
	{ condition: "", variables: [] },
	{
		condition: "hasItem",
		variables: [
			{ source: "items", type: "list", placeholder: "item" },
			{ type: "number", placeholder: "amount" },
		],
	},
	{
		condition: "takeItem",
		variables: [
			{ source: "items", type: "list", placeholder: "item" },
			{ type: "number", placeholder: "amount" },
		],
		actionable: true,
	},
	{
		condition: "quest",
		variables: [
			{ source: "quest", type: "list", placeholder: "quest" },
			{ source: "compare", type: "list", placeholder: "?" },
			{ source: "quest[-2]", type: "list", placeholder: "value" },
		],
	},
] as ConditionProps[];

const actions = [
	{ action: "", variables: [] },
	{
		action: "takeItem",
		variables: [
			{ source: "items", type: "list", placeholder: "item" },
			{ type: "number", placeholder: "amount" },
		],
	},
	{
		action: "giveItem",
		variables: [
			{ source: "items", type: "list", placeholder: "item" },
			{ type: "number", placeholder: "amount" },
		],
	},
	{
		action: "setQuest",
		variables: [
			{ source: "quest", type: "list", placeholder: "quest" },
			{ source: "quest[-1]", type: "list", placeholder: "value" },
		],
	},
] as ActionProps[];

const sources: { [key: string]: string[] } = {
	compare: ["<", "<=", "==", ">=", ">"],
	items: items,
	quest: quest,
	// QUESTS
	...quests,
};

export const defaultDialogueContext: DialogueContextInterface = {
	conditions: conditions,
	keys: conditions.map((condition) => condition.condition),
	actions: actions,
	actionKeys: actions.map((action) => action.action),
	sources: sources,
};

export const DialogueContextProvider = (props) => {
	return <DialogueContext.Provider value={defaultDialogueContext}>{props.children}</DialogueContext.Provider>;
};
