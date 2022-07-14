import { KeyboardEvent } from "react";
import * as _ from "lodash";
import { Action, ActionEvent, InputType, Toolkit } from "@projectstorm/react-canvas-core";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { BaseNodeModel } from "../node/base";

export interface PasteItemsActionOptions {
	keyCodes?: number[];
	modifiers?: {
		ctrlKey?: boolean;
		shiftKey?: boolean;
		altKey?: boolean;
		metaKey?: boolean;
	};
}

export class PasteItemsAction extends Action<DiagramEngine> {
	constructor(options: PasteItemsActionOptions = {}) {
		const keyCodes = options.keyCodes || [86];
		const modifiers = {
			ctrlKey: true,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			...options.modifiers,
		};

		super({
			type: InputType.KEY_DOWN,
			fire: async (event: ActionEvent<KeyboardEvent>) => {
				const { keyCode, ctrlKey, shiftKey, altKey, metaKey } = event.event;

				if (keyCodes.indexOf(keyCode) !== -1 && _.isEqual({ ctrlKey, shiftKey, altKey, metaKey }, modifiers)) {
					let model = this.engine.getModel();
					if (document.activeElement instanceof HTMLBodyElement) {
						var entities = model.getSelectedEntities();
						var offsetX = 0;
						var offsetY = 0;
						if (entities.length === 1) {
							const entity = entities[0];
							if (entity instanceof BaseNodeModel) {
								const box = entity.getBoundingBox();
								offsetX = entity.getX();
								offsetY = entity.getY() + box.getHeight() + 10;
							}
						}
						entities.forEach((entity) => entity.setSelected(false));
						await navigator.clipboard.readText().then((data) => {
							try {
								const dialogue = JSON.parse(data);
								if (dialogue?.layers.length === 2) {
									event.event.preventDefault();
									const model = this.engine.getModel();
									var newModel = new DiagramModel();
									newModel.deserializeModel(dialogue, this.engine);

									var serialString = JSON.stringify(newModel.serialize());

									const oldIds = newModel.getNodes().map((node) => node.getOptions().id);

									const newIds = [];

									while (newIds.length < oldIds.length) {
										const id = Toolkit.UID();
										if (id in oldIds || id in newIds) {
											continue;
										}
										newIds.push(id);
									}

									oldIds.forEach((v, k) => {
										serialString = serialString.replaceAll(v, newIds[k]);
									});

									newModel = new DiagramModel();
									newModel.deserializeModel(JSON.parse(serialString), this.engine);

									newModel.getNodes().forEach((node) => {
										if (node instanceof BaseNodeModel) {
											const { x, y } = node.getPosition();
											node.setPosition(x + offsetX, y + offsetY);
											model.addNode(node);
										}
									});
									this.engine.repaintCanvas();
								}
							} catch (error) {}
						});
					}
				}
			},
		});
	}
}
