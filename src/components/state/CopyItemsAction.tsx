import { KeyboardEvent } from "react";
import * as _ from "lodash";
import { Action, ActionEvent, BaseModel, InputType } from "@projectstorm/react-canvas-core";
import { DiagramEngine, DiagramModel, LinkModel, NodeModel } from "@projectstorm/react-diagrams";

export interface CopyItemsActionOptions {
	keyCodes?: number[];
	modifiers?: {
		ctrlKey?: boolean;
		shiftKey?: boolean;
		altKey?: boolean;
		metaKey?: boolean;
	};
}

export class CopyItemsAction extends Action<DiagramEngine> {
	constructor(options: CopyItemsActionOptions = {}) {
		const keyCodes = options.keyCodes || [67];
		const modifiers = {
			ctrlKey: true,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			...options.modifiers,
		};

		super({
			type: InputType.KEY_DOWN,
			fire: (event: ActionEvent<KeyboardEvent>) => {
				const { keyCode, ctrlKey, shiftKey, altKey, metaKey } = event.event;

				if (keyCodes.indexOf(keyCode) !== -1 && _.isEqual({ ctrlKey, shiftKey, altKey, metaKey }, modifiers)) {
					let model = this.engine.getModel();
					if (model.getSelectedEntities()) {
						event.event.preventDefault();

						var startX = undefined,
							startY = undefined;
						_.forEach(model.getSelectedEntities(), (item: BaseModel<any>) => {
							if (item instanceof NodeModel) {
								if (startX === undefined) {
									startX = item.getX();
									startY = item.getY();
								} else {
									startX = Math.min(startX, item.getX());
									startY = Math.min(startY, item.getY());
								}
							}
						});
						let itemMap = {};
						var newModel = new DiagramModel();
						_.forEach(model.getSelectedEntities(), (item: BaseModel<any>) => {
							let newItem = item.clone(itemMap);
							if (!newItem) {
								return;
							}
							item.setSelected(false);

							// offset the nodes slightly
							if (newItem instanceof NodeModel) {
								newItem.setPosition(newItem.getX() - startX, newItem.getY() - startY);
								newModel.addNode(newItem);
							} else if (newItem instanceof LinkModel) {
								newModel.addLink(newItem);
							}
						});

						navigator.clipboard.writeText(JSON.stringify(newModel.serialize()));
						this.engine.repaintCanvas();
					}
				}
			},
		});
	}
}
