import * as React from "react";
import { ActionProps } from "./editor/Action";
import { ConditionProps } from "./editor/Condition";
import { items } from "./sources/items";
import { quest } from "./sources/quest";
import { quests } from "./sources/quests";
import { skills } from "./sources/skills";

export interface DialogueContextInterface {
	conditions: ConditionProps[];
	conditionKeys: any[];
	actions: ActionProps[];
	actionKeys: any[];
	sources: { [key: string]: string[] };
	sourcesKeys: { [key: string]: any[] };
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
		condition: "hasEquipped",
		variables: [
			{ source: "equipmentSlot", type: "list", placeholder: "slot" },
			{ source: "items", type: "list", placeholder: "item" },
		],
	},
	{
		condition: "hasSkill",
		variables: [
			{ source: "skills", type: "list", placeholder: "skill" },
			{ type: "number", placeholder: "level" },
		],
		actionable: true,
	},
	{
		condition: "questStage",
		variables: [
			{ source: "quest", type: "list", placeholder: "quest" },
			{ source: "compare", type: "list", placeholder: "?" },
			{ source: "quest[-2]", type: "list", placeholder: "value" },
		],
	},
	{
		condition: "hasQuestCompleted",
		variables: [{ source: "quest", type: "list", placeholder: "quest" }],
	},
	{
		condition: "hasQuestPoints",
		variables: [{ type: "number", placeholder: "points" }],
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
	equipmentSlot: ["HEAD", "CAPE", "NECK", "AMMUNITION", "BODY", "SHIELD", "LEGS", "HANDS", "FEET", "RING", "WEAPON"],
	skills: skills,
	items: items,
	quest: quest,
	// QUESTS
	...quests,
};

const sourcesKeys = {};

Object.entries(sources).forEach(([key, value]) => {
	sourcesKeys[key] = value.map((val) => ({ label: val, value: val }));
});

export const defaultDialogueContext: DialogueContextInterface = {
	conditions: conditions,
	conditionKeys: conditions.map((cond) => ({ label: cond.condition, value: cond.condition })),
	actions: actions,
	actionKeys: actions.map((act) => ({ label: act.action, value: act.action })),
	sources: sources,
	sourcesKeys: sourcesKeys,
};

export const DialogueContextProvider = (props) => {
	return <DialogueContext.Provider value={defaultDialogueContext}>{props.children}</DialogueContext.Provider>;
};
