import styled from "@emotion/styled";
import React from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Application } from "../../../Application";
import { NodeFactories } from "../../node";
import { StartFactory } from "../../node/start/StartNodeFactory";
import { StartNodeModel } from "../../node/start/StartNodeModel";
import { TrayItemWidget } from "./TrayItemWidget";
import { confirmAlert } from "react-confirm-alert"; // Import
import { EditableInput } from "../../editor/Inputs";
import { DiagramModel } from "@projectstorm/react-diagrams";

namespace S {
	export const Tray = styled(Tabs)`
		min-width: fit-content;
		width: 20vw;
		max-width: 200px !important;
		min-height: 100%;
		background: rgb(20, 20, 20);
		flex-grow: 0;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;

		.react-tabs__tab-list {
			display: table;
			table-layout: fixed;
			margin-bottom: 0px;
		}

		.react-tabs__tab {
			color: white;
			display: table-cell;
		}
		.react-tabs__tab--selected {
			background: rgb(60, 60, 60);
		}
		.react-tabs__tab--selected::after {
			display: none;
		}
		.react-tabs__tab-panel {
			overflow: scroll;
			overflow-x: auto;
			overflow-y: auto;
			max-height: calc(85vh - 240px);
		}
	`;

	export const Tree = styled.div<{ selected: boolean }>`
		cursor: ${(props) => (props.selected ? "no-drop" : "pointer")};
		background: ${(props) => (props.selected ? "gray" : "pointer")};
		user-select: "none";
		display: inline-block;
		width: 100%;
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

const deleteModel = (app: Application, key: string) => {
	confirmAlert({
		customUI: ({ onClose }) => {
			return (
				<S.CustomUI>
					<h1>Are you sure?</h1>
					<p>You want to delete this tree?</p>

					<button
						onClick={() => {
							const value = app.getTrees()[key];
							delete app.getTrees()[key];
							if (app.getDiagramEngine().getModel() === value) {
								app.getDiagramEngine().setModel(app.getModel());
							}
							app.forceUpdate();
							onClose();
						}}
					>
						Yes, Delete it!
					</button>
					<button onClick={onClose}>No, Hug it!</button>
				</S.CustomUI>
			);
		},
	});
};

const addModel = (app: Application) => {
	confirmAlert({
		customUI: ({ onClose }) => {
			let value = "";

			return (
				<S.CustomUI>
					<h1>Add tree</h1>
					<EditableInput value={value} setValue={(e) => (value = e)} style={{ background: "gray" }} autoFocus />
					<div />
					<button
						onClick={() => {
							if (!app.getTrees()[value]) {
								const newModel = new DiagramModel();
								app.getDiagramEngine().setModel(newModel);
								app.getTrees()[value] = newModel;
								app.forceUpdate();
								onClose();
							}
						}}
					>
						Add
					</button>
				</S.CustomUI>
			);
		},
	});
};

export const Tray = (props: { app: Application }) => {
	const starts = props.app
		.getDiagramEngine()
		.getModel()
		.getNodes()
		.filter((val) => val instanceof StartNodeModel) as StartNodeModel[];
	const hasStart = starts.filter((val) => val.getOptions().title === "Start").length !== 0;
	const size = starts.length;
	const trees = { default: props.app.getModel(), ...props.app.getTrees() };
	return (
		<>
			<S.Tray focusTabOnClick={false}>
				<TabList>
					<Tab>Nodes</Tab>
					<Tab>Trees</Tab>
				</TabList>
				<div
					style={{
						border: "1px solid",
						borderTopWidth: "0px",
						borderColor: "#aaa",
						height: "100%",
						paddingTop: "10px",
					}}
				>
					<TabPanel>
						{
							<TrayItemWidget
								key={"start"}
								model={{ id: "start", extra: { title: hasStart ? `Start-${size}` : "Start", editableTitle: hasStart } }}
								name={"start"}
								color={StartFactory.options.color}
							/>
						}
						{NodeFactories.map((factory) => {
							var options = factory.options;
							return <TrayItemWidget key={options.id} model={{ id: options.id }} name={options.id} color={options.color} />;
						})}
					</TabPanel>
					<TabPanel>
						<div style={{ color: "#ffffff" }}>
							{Object.entries(trees).map((entry, idx) => {
								const [key, value] = entry;
								const selected = props.app.getDiagramEngine().getModel() === value;
								return (
									<div key={idx} style={{ margin: "0 10px" }}>
										<S.Tree
											selected={selected}
											onClick={(e) => {
												e.preventDefault();
												if (!selected) {
													props.app.getDiagramEngine().setModel(value);
													props.app.forceUpdate();
												}
											}}
										>
											{key}
											{key !== "default" && (
												<span
													style={{ float: "right", marginRight: "5px", cursor: "pointer" }}
													onClick={(e) => {
														e.preventDefault();
														deleteModel(props.app, key);
													}}
												>
													X
												</span>
											)}
										</S.Tree>
									</div>
								);
							})}
							<div style={{ margin: "0 10px" }}>
								<span
									style={{ float: "right", marginRight: "5px", cursor: "pointer" }}
									onClick={(e) => {
										addModel(props.app);
									}}
								>
									+
								</span>
							</div>
						</div>
					</TabPanel>
					<div style={{ position: "absolute", bottom: "0", width: "clamp(134px, 20vw, 200px)" }}>
						<div style={{ color: "#ffffff", width: "100%" }}>
							<p style={{ color: "#23f0e5" }}>Shortcuts:</p>
							<p>
								Duplicate: Ctrl + d
								<br />
								Delete: Shift + del
								<br />
								Zoom: Mouse scroll
							</p>
							<p>
								Copyright
								<br />
								MineScape&reg; {new Date().getFullYear()}
								<br />
								<a href={"https://creativecommons.org/licenses/by-nc-nd/4.0/"} target="_blank" rel="noreferrer">
									CC BY-NC-ND 4.0
								</a>
							</p>
						</div>
					</div>
				</div>
			</S.Tray>
		</>
	);
};
