import * as React from "react";
import { Application } from "../../../Application";
import { AllNodeFactories } from "../../node";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { DialogueSidebar } from "./DialogueSidebar";
import styled from "@emotion/styled";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../../node/base";
import { showOpenFilePicker } from "file-system-access";
import { DiagramModel } from "@projectstorm/react-diagrams";
import { DialogueContext, DialogueContextInterface } from "../../DialogueContext";
import { DropdownInput } from "../../editor/Inputs";
import { Tray } from "./Tray";
import { StartFactory } from "../../node/start/StartNodeFactory";
import { confirmAlert } from "react-confirm-alert"; // Import
import { EditableInput } from "../../editor/Inputs";
import { Editor } from "./Editor";
import { createLabels } from "../../../utils/Utils";
import { parse } from "secure-json-parse";

namespace S {
	export const Body = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100%;
	`;

	export const Header = styled.div`
		display: flex;
		background: rgb(30, 30, 30);
		flex-grow: 0;
		flex-shrink: 0;
		color: white;
		font-family: Helvetica, Arial, sans-serif;
		padding: 10px;
		align-items: center;
	`;

	export const Content = styled.div`
		display: flex;
		flex-grow: 1;
	`;

	export const Layer = styled.div`
		position: relative;
		flex-grow: 1;
	`;

	export const Toolbar = styled.div`
		background: black;
		padding: 5px;
		display: flex;
		flex-shrink: 0;
	`;

	export const DemoButton = styled.button<{ hover?; background? }>`
		background: ${(props) => props.background || "rgb(60, 60, 60)"};
		font-size: 14px;
		padding: 5px 10px;
		border: none;
		color: white;
		outline: none;
		cursor: pointer;
		margin: 2px;
		border-radius: 3px;

		&:hover {
			background: ${(props) => props.hover || "rgb(0, 192, 255)"};
		}
	`;

	export const CustomUI = styled.div`
		text-align: center;
		width: fit-content;
		min-width: 40vw;
		padding: 40px;
		background: #28bae6;
		box-shadow: 0 20px 75px rgba(0, 0, 0, 0.23);
		color: #fff;

		> h1 {
			margin-top: 0;
		}

		> button {
			width: 160px;
			padding: 10px;
			border: 1px solid #fff;
			margin: 10px;
			cursor: pointer;
			background: none;
			color: #fff;
			font-size: 14px;
		}
	`;
}

const loadFile = async (app: Application, context: DialogueContextInterface) => {
	var fileHandle: FileSystemFileHandle[];
	try {
		fileHandle = await showOpenFilePicker({
			multiple: false,
			types: [{ accept: { "json/*": [".json"] } }],
		});
	} catch (error) {
		return;
	}

	fileHandle[0].getFile().then((file) => {
		file.text().then((data) => {
			loadData(app, data, context);
			document.title = `${file.name.replace(".json", "")} - Dialogue Maker`
		});
	});
};

const loadGithub = async (app: Application, location: string, context: DialogueContextInterface) => {
	fetch(`https://raw.githubusercontent.com/${context.repo}/dialogue/regions/${location}.json`)
		.then((data) => data.text())
		.then((data) => loadData(app, data, context))
		.then(() => {
			var names = location.split("/");
			var name = names[names.length-1];
			document.title = `${name} - Dialogue Maker`
		})
		.catch((err) => {
			console.log(err);
		});
};

const deserializeModel = (app: Application, model: any, context: DialogueContextInterface): DiagramModel => {
	var newModel = new DiagramModel();
	newModel.deserializeModel(model, app.getDiagramEngine());
	newModel.getNodes().forEach((node) => {
		if (node instanceof BaseNodeModel) {
			node.fix(context);
		}
	});
	return newModel;
};

const loadData = (app: Application, data: string, context: DialogueContextInterface): void => {
	clear(app, context);
	setTimeout(() => {
		const model = parse(data);

		let trees = {};
		if (model.trees) {
			Object.entries(model.trees).forEach((entry) => {
				const [key, value] = entry;
				trees[key] = deserializeModel(app, value, context);
			});
			delete model["trees"];
		}
		const newModel = deserializeModel(app, model, context);

		app.setModel(newModel, trees);
		context.setApp(app);
	}, 100);
};

const saveFile = async (app: Application) => {
	var fileHandle: FileSystemFileHandle;
	try {
		fileHandle = await showSaveFilePicker({ types: [{ accept: { "json/*": [".json"] } }] });
	} catch (error) {
		return;
	}
	const output = app.getModel().serialize() as any;
	const trees = { ...app.getTrees() };
	output.trees = {};
	Object.entries(trees).forEach((entry) => {
		const [key, value] = entry;
		output.trees[key] = value.serialize();
	});

	fileHandle.createWritable().then((stream) => {
		stream.write(JSON.stringify(output, null, 2));
		stream.close();
	});
};

const clear = async (app: Application, context: DialogueContextInterface) => {
	var newModel = new DiagramModel();
	const node = StartFactory.generateModel(undefined);
	node.setPosition(50, 50);
	node.setPosition(50, 50);
	node.getOptions().editableTitle = false;
	node.setupPorts();
	newModel.addNode(node);
	app.setModel(newModel, {});
	context.setApp(app);
};

const Buttons = (props): JSX.Element => {
	const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
	const context = React.useContext(DialogueContext);
	const [github, setGithub] = React.useState("");

	const show = {refresh: true};

	const clearLocal = () => {
		clear(props.app, context);
		setGithub("");
	};

	const openEditor = () => {
		const alert = {
			customUI: ({ onClose }) => {
				return (
					<S.CustomUI>
						<Editor context={context} ret={alert}/>
						{ show.refresh &&
						<button
							onClick={() => {
								context.refreshStored();
								show.refresh = false;
								openEditor();
							}}
						>
							Refresh
						</button>
						}
						<button
							onClick={() => {
								show.refresh = true;
								onClose();
								forceUpdate();
							}}
						>
							Close
						</button>
					</S.CustomUI>
				);
			},
		}
		confirmAlert(alert);
	};

	const changeGithub = () => {
		confirmAlert({
			customUI: ({ onClose }) => {
				let value = context.repo;
				return (
					<S.CustomUI>
						<h1>Change Values</h1>
						<EditableInput value={value} setValue={(e) => (value = e)} style={{ background: "gray" }} autoFocus />
						<div />
						<button
							onClick={() => {
								context.setRepo(value);
								onClose();
								forceUpdate();
							}}
						>
							Set
						</button>
					</S.CustomUI>
				);
			},
		});
	};

	return (
		<>
			<S.DemoButton hover="rgb(29, 167, 29)" onClick={() => loadFile(props.app, context)}>
				Load
			</S.DemoButton>
			<S.DemoButton onClick={() => saveFile(props.app)}>Save</S.DemoButton>
			<S.DemoButton hover="rgb(248, 19, 19)" onClick={clearLocal}>
				Clear
			</S.DemoButton>
			<S.DemoButton hover="rgb(224, 186, 15)" onClick={openEditor}>
				Edit
			</S.DemoButton>
			<div style={{ marginLeft: "auto" }} />
			<DropdownInput
				values={createLabels(context.sources.dialogues)}
				value={github}
				setValue={(e) => {
					setGithub(e);
					loadGithub(props.app, e, context);
				}}
				placeholder={`Github (${context.sources.dialogues?.length})`}
				width={"200px"}
				right={0}
			/>
			<S.DemoButton onClick={changeGithub}>Change</S.DemoButton>
			{context.sync ? (
				<S.DemoButton background="rgb(214, 248, 19)" hover="rgb(60, 60, 60)" onClick={context.toggleSync}>
					Sync
				</S.DemoButton>
			) : (
				<S.DemoButton background="rgb(60, 60, 60)" hover="rgb(214, 248, 19)" onClick={context.toggleSync}>
					Sync
				</S.DemoButton>
			)}
			;
		</>
	);
};

export class BodyWidget extends React.Component {
	static contextType = DialogueContext;

	state = {
		app: new Application(() => {
			this.forceUpdate();
		}),
	};

	componentDidMount() {
		let value = this.context as any;
		const { app, setApp } = value;
		if (!app) {
			setApp(this.state.app);
		}
	}

	render() {
		return (
			<S.Body>
				{/* <S.Header>
					<div className="title">Dialogue</div>
				</S.Header> */}
				<S.Toolbar>
					<Buttons app={this.state.app} />
				</S.Toolbar>
				<S.Content>
					<Tray app={this.state.app} />
					<S.Layer
						onDrop={(event) => {
							var data = parse(event.dataTransfer.getData("storm-diagram-node"));

							var node: BaseNodeModel<BaseNodeModelGenerics<BaseNodeModelOptions>> = null!;
							const factory = AllNodeFactories.find((factory) => factory.options.id === data.id);
							node = factory.generateModel(undefined);
							node.setupPorts();
							if (data.extra) {
								Object.entries(data.extra).forEach((entry) => {
									const [key, value] = entry;
									node.getOptions()[key] = value;
								});
							}
							sessionStorage.setItem("latest-node", node.getID());

							var point = this.state.app.getDiagramEngine().getRelativeMousePoint(event);
							node.setPosition(point);
							this.state.app.getDiagramEngine().getModel().addNode(node);
							this.state.app.forceUpdate();
						}}
						onDragOver={(event) => {
							event.preventDefault();
						}}
					>
						<DialogueSidebar>
							<CanvasWidget engine={this.state.app.getDiagramEngine()} />
						</DialogueSidebar>
					</S.Layer>
				</S.Content>
			</S.Body>
		);
	}
}
