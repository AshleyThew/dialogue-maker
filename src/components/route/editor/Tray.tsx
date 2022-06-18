import styled from "@emotion/styled";
import React, { useReducer, useRef } from "react";
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

	export const HiddenText = styled.span`
		color: rgba(0, 0, 0, 0) !important;
		cursor: no-drop;
	`;
}

const copyModel = (app: Application, key: string) => {
	confirmAlert({
		customUI: ({ onClose }) => {
			let value = "";

			return (
				<S.CustomUI>
					<h1>Copy tree</h1>
					<EditableInput value={value} setValue={(e) => (value = e)} style={{ background: "gray" }} autoFocus />
					<div />
					<button
						onClick={() => {
							if (value.length > 0 && !app.getTrees()[value]) {
								var tree;
								if (key === "default") {
									tree = app.getModel();
								} else {
									tree = app.getTrees()[key];
								}
								var newModel = new DiagramModel();
								newModel.deserializeModel(tree.serialize(), app.getDiagramEngine());
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

type SpanProps = {
	hidden?: boolean;
	children: any;
	onClick: React.MouseEventHandler<HTMLSpanElement>;
	title?: string;
	style?: React.CSSProperties;
};

const SpanLeft = ({ hidden, children, onClick, title, style }: SpanProps) => {
	if (hidden) {
		return <S.HiddenText style={{ ...style, float: "left", marginLeft: "5px" }}>{children}</S.HiddenText>;
	}
	return (
		<span onClick={onClick} style={{ ...style, float: "left", marginLeft: "5px", cursor: "pointer" }} title={title}>
			{children}
		</span>
	);
};

const SpanRight = ({ hidden, children, onClick, title, style }: SpanProps) => {
	if (hidden) {
		return <S.HiddenText style={{ ...style, float: "right", marginRight: "5px" }}>{children}</S.HiddenText>;
	}
	return (
		<span onClick={onClick} style={{ ...style, float: "right", marginRight: "5px", cursor: "pointer" }} title={title}>
			{children}
		</span>
	);
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
	const ref = useRef(null);
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	const update = () => {
		setTimeout(forceUpdate, 20);
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
								if (value.length > 0 && !app.getTrees()[value]) {
									const newModel = new DiagramModel();
									app.getDiagramEngine().setModel(newModel);
									const node = StartFactory.generateModel(undefined);
									node.setPosition(50, 50);
									node.getOptions().editableTitle = false;
									node.setupPorts();
									newModel.addNode(node);
									app.getTrees()[value] = newModel;
									app.forceUpdate();
									update();
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
								update();
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

	const renameModel = (app: Application, key: string) => {
		confirmAlert({
			customUI: ({ onClose }) => {
				let value = key;

				return (
					<S.CustomUI>
						<h1>Rename tree</h1>
						<EditableInput value={value} setValue={(e) => (value = e)} style={{ background: "gray" }} autoFocus />
						<div />
						<button
							onClick={() => {
								if (value.length > 0 && !app.getTrees()[value]) {
									const model = app.getTrees()[key];
									delete app.getTrees()[key];
									app.getTrees()[value] = model;
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

	window.addEventListener("resize", forceUpdate);
	return (
		<>
			<S.Tray
				focusTabOnClick={false}
				onSelect={(e) => {
					update();
					return true;
				}}
			>
				<div ref={ref} style={{ width: "100%" }}></div>
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
							{Object.entries(trees).map((entry, idx, arr) => {
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
											{
												<>
													<SpanLeft
														hidden={idx <= 1}
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															const trees = props.app.getTrees();
															const keys = Object.keys(trees);

															keys.splice(idx - 1, 1);
															keys.splice(idx - 2, 0, key);

															const clone = { ...trees };
															keys.forEach((key) => {
																delete trees[key];
															});
															keys.forEach((key) => {
																trees[key] = clone[key];
															});
															update();
														}}
														title={"Shift Up"}
													>
														&#x2191;
													</SpanLeft>
													<SpanLeft
														style={{ color: "dodgerblue", marginRight: "5px" }}
														hidden={idx < 1 || idx === arr.length - 1}
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															const trees = props.app.getTrees();
															const keys = Object.keys(trees);

															keys.splice(idx - 1, 1);
															keys.splice(idx, 0, key);

															const clone = { ...trees };
															keys.forEach((key) => {
																delete trees[key];
															});
															keys.forEach((key) => {
																trees[key] = clone[key];
															});
															update();
														}}
														title={"Shift Down"}
													>
														&#x2193;
													</SpanLeft>
													{<span title="Open">{key}</span>}
													<SpanRight
														style={{ color: "indianred" }}
														hidden={key === "default"}
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															deleteModel(props.app, key);
														}}
														title={"Delete"}
													>
														&#x2716;
													</SpanRight>
													<SpanRight
														style={{ color: "seagreen" }}
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															copyModel(props.app, key);
														}}
														title={"Copy"}
													>
														&#x2702;
													</SpanRight>
													<SpanRight
														style={{ color: "dodgerblue", marginLeft: "5px" }}
														hidden={key === "default"}
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															renameModel(props.app, key);
														}}
														title={"Edit"}
													>
														&#x270E;
													</SpanRight>
												</>
											}
										</S.Tree>
									</div>
								);
							})}
							<div style={{ margin: "10px 20px" }}>
								<span
									style={{
										cursor: "pointer",
										width: "100%",
										color: "yellowgreen",
										display: "block",
										border: "solid 1px yellowgreen",
										borderRadius: "5px",
									}}
									onClick={(e) => {
										addModel(props.app);
									}}
								>
									&#x271A;
								</span>
							</div>
						</div>
					</TabPanel>
					<div style={{ position: "absolute", bottom: "0", width: `clamp(134px, 20vw, ${ref.current?.offsetWidth || 200}px)` }}>
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
