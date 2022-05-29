import * as React from "react";
import { ActionProps } from "./editor/Action";
import { ConditionProps } from "./editor/Condition";
import { items } from "./sources/items";
import { npcInteraction } from "./sources/npcInteraction";
import { quest } from "./sources/quest";
import { quests } from "./sources/quests";
import { shops } from "./sources/shops";
import { skills } from "./sources/skills";

export interface DialogueContextInterface {
	conditions: ConditionProps[];
	conditionKeys: any[];
	actions: ActionProps[];
	actionKeys: any[];
	sources?: { [key: string]: string[] };
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
		condition: "hasSkillLevel",
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
	{
		condition: "npcInteraction",
		variables: [{ source: "npcInteraction", type: "list", placeholder: "interaction" }],
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
	{
		action: "giveExp",
		variables: [
			{ source: "skills", type: "list", placeholder: "skill" },
			{ type: "number", placeholder: "exp" },
		],
	},
	{
		action: "openShop",
		variables: [{ source: "shops", type: "list", placeholder: "shop" }],
	},
	{
		action: "npcText",
		variables: [{ type: "text", placeholder: "text" }],
	},
	{
		action: "playerText",
		variables: [{ type: "text", placeholder: "text" }],
	},
	{
		action: "message",
		variables: [{ type: "text", placeholder: "message" }],
	},
	{
		action: "openDialogue",
		variables: [{ source: "dialogues", type: "list", placeholder: "dialogue" }],
	},
] as ActionProps[];

const sourcesKeys = {};

export const DialogueContextProvider = (props) => {
	const [sources, setSources] = React.useState({});
	const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

	const defaultDialogueContext: DialogueContextInterface = {
		conditions: conditions,
		conditionKeys: conditions.sort().map((cond) => ({ label: cond.condition, value: cond.condition })),
		actions: actions,
		actionKeys: actions.sort().map((act) => ({ label: act.action, value: act.action })),
		sources: sources,
		sourcesKeys: sourcesKeys,
	};

	React.useEffect(() => {
		Object.entries(sources)
			.sort()
			.forEach(([key, value]) => {
				const val = value as [];
				sourcesKeys[key] = val.map((val) => ({ label: val, value: val }));
			});
		forceUpdate();
	}, [sources]);

	React.useEffect(() => {
		setSources({
			compare: ["<", "<=", "==", ">=", ">"],
			equipmentSlot: ["HEAD", "CAPE", "NECK", "AMMUNITION", "BODY", "SHIELD", "LEGS", "HANDS", "FEET", "RING", "WEAPON"],
			skills,
			items,
			quest,
			shops,
			npcInteraction,
			// QUESTS
			...quests,
		});
		fetch("https://raw.githubusercontent.com/MineScape-me/MineScape/main/dialogue/paths.txt")
			.then((data) => data.text())
			.then((data) => {
				var files = data
					.split("\n")
					.filter((line) => line !== "")
					.map((file) => file.replace("dialogue/regions/", "").replace(".json", ""));
				files = ["", ...files];
				setSources((sources) => ({ ...sources, dialogues: files }));
			})
			.catch((e) => {
				console.log(e);
			});
	}, []);

	return <DialogueContext.Provider value={defaultDialogueContext}>{props.children}</DialogueContext.Provider>;
};
