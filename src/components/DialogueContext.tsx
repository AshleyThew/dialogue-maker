import * as React from "react";
import { Application } from "../Application";
import { ActionProps } from "./editor/Action";
import { ConditionProps } from "./editor/Condition";
import * as Sources from "../sources/";
import * as vars from "../vars";
import { parse } from "secure-json-parse";

export interface DialogueContextInterface {
	conditions: ConditionProps[];
	actions: ActionProps[];
	switchs: { [key: string]: string[] };
	sources?: { [key: string]: string[] };
	app: Application;
	setApp: Function;
	repo: string;
	setRepo: (repo: string) => void;
	sync: boolean;
	toggleSync: () => void;
}

export interface DialogueContextExtraInterface {
	extra: {};
	setExtra: (extra: {}) => void;
	def: {};
}

export interface DialogueContextCombined extends DialogueContextInterface, DialogueContextExtraInterface {}

export const DialogueContext = React.createContext<DialogueContextCombined | null>(null);

const { quests, switchs, ...other } = Sources;
const conditions = vars.conditions as ConditionProps[];
const actions = vars.actions as ActionProps[];

export const DialogueContextProvider = (props) => {
	const [sources, setSources] = React.useState({
		...other,
		// QUESTS
		...quests,
	});
	const [repo, setRepo] = React.useState(localStorage.getItem("minescape.repo") || "MineScape-me/MineScape/main");
	const [app, setApp] = React.useState<Application>(null);
	const [webSocket, setWebSocket] = React.useState<WebSocket>(null);
	const [sync, setSync] = React.useState(false);
	const [def, setDefault] = React.useState({});

	var stored = parse(localStorage.getItem("minescape-extra"));
	if (!stored) {
		stored = {};
	}
	const [extra, setExtra] = React.useState<DialogueContextCombined>(stored);

	const context: DialogueContextCombined = {
		conditions,
		actions,
		switchs,
		sources,
		app,
		setApp,
		repo,
		setRepo,
		sync,
		toggleSync: () => {
			setSync((value) => !value);
		},
		extra,
		setExtra: (extra) => {
			localStorage.setItem("minescape-extra", JSON.stringify(extra));
			setExtra(extra as DialogueContextCombined);
		},
		def,
	};

	React.useEffect(() => {
		setDefault(
			parse(JSON.stringify(context))
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const connectToWebsocket = async () => {
		if (app && sync) {
			webSocket?.close();
			const ws = new WebSocket("ws://localhost:21902/");
			setWebSocket(ws);
			const timer = setInterval(() => {
				if (ws.readyState === 1) {
					clearInterval(timer);
					console.log("WebSocket connected.");
				}
			}, 10);
			ws.onmessage = (message) => {
				var data = parse(message.data);
				switch (data.type) {
					case "join":
						console.log(data.message);
						break;
					case "dialogue":
						app.addDialogue(data.title, data.dialogue, data.link);
						break;
					case "option":
						app.addOption(data.options, data.link);
						break;
				}
			};
			ws.onclose = (ev) => {
				console.log(ev);
				clearInterval(timer);
				setSync(false);
				console.log("WebSocket closed.");
			};
			ws.onerror = (event) => {
				ws.close();
			};
		} else {
			webSocket?.close();
		}
	};

	React.useEffect(() => {
		connectToWebsocket();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sync, app]);

	const mergeMap = (merge: {}, extra: {}) => {
		Object.keys(merge).forEach((key) => {
			const val = merge[key];
			const add = extra[key];
			if (typeof val !== "undefined" && typeof add === "undefined") {
				if (Array.isArray(val)) {
					extra[key] = [];
				} else if (typeof val === "object") {
					extra[key] = {};
				}
			}
			if (typeof add !== "undefined" && typeof val !== "undefined") {
				if (Array.isArray(val) && add.length) {
					var set = new Set([...val, ...add]);
					merge[key] = [...set];
				} else if (val instanceof Object && val.constructor === Object) {
					merge[key] = mergeMap(val, add);
				}
			}
		});
		Object.keys(extra).forEach((key) => {
			if (typeof extra[key] !== "undefined" && typeof merge[key] === "undefined") {
				merge[key] = extra[key];
			}
		});
		return merge;
	};

	React.useEffect(() => {
		var stored = parse(localStorage.getItem("minescape-extra"));
		if (!stored) {
			stored = {};
		}
		const { extra: ignore, ...merge } = context;
		mergeMap(merge, stored);
		if (Object.keys(extra).length === 0) {
			setExtra(stored);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [extra, sources, Object.keys(sources).length]);

	React.useEffect(() => {
		fetch(`https://raw.githubusercontent.com/${repo}/dialogue/paths.txt`)
			.then((data) => data.text())
			.then((data) => {
				var github = data
					.split("\n")
					.filter((line) => line !== "")
					.map((file) => file.replace("dialogue/regions/", "").replace(".json", ""))
					.sort();
				var files = [...new Set([...github])];
				setSources((sources) => ({ ...sources, dialogues: files, github: github }));
				setDefault((def: any) => {
					def.sources.dialogues = files;
					def.sources.github = github;
					return def;
				})
			})
			.catch((e) => {
				console.log(e);
			});
		if (repo) {
			localStorage.setItem("minescape.repo", repo);
		}
	}, [repo]);

	return <DialogueContext.Provider value={context}>{props.children}</DialogueContext.Provider>;
};
