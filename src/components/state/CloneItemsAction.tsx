import { KeyboardEvent } from "react";
import * as _ from "lodash";
import { Action, ActionEvent, BaseModel, InputType } from "@projectstorm/react-canvas-core";
import { DiagramEngine, NodeModel } from "@projectstorm/react-diagrams";
import { BaseNodeModel } from "../node/base";

export interface CloneItemsActionOptions {
	keyCodes?: number[];
	modifiers?: {
		ctrlKey?: boolean;
		shiftKey?: boolean;
		altKey?: boolean;
		metaKey?: boolean;
	};
	offset?: { x?: number; y?: number };
}

/**
 * Deletes all selected items
 */
export class CloneItemsAction extends Action<DiagramEngine> {
	constructor(options: CloneItemsActionOptions = {}) {
		const keyCodes = options.keyCodes || [68];
		const modifiers = {
			ctrlKey: true,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			...options.modifiers,
		};
		const offset = {
			x: 0,
			y: undefined,
			...options.offset,
		};

		super({
			type: InputType.KEY_DOWN,
			fire: (event: ActionEvent<KeyboardEvent>) => {
				const { keyCode, ctrlKey, shiftKey, altKey, metaKey } = event.event;

				if (keyCodes.indexOf(keyCode) !== -1 && _.isEqual({ ctrlKey, shiftKey, altKey, metaKey }, modifiers)) {
					event.event.preventDefault();
					let model = this.engine.getModel();
					let itemMap = {};
					const entities = model.getSelectedEntities();

					var y = offset.y;
					if (entities.length && y === undefined) {
						const entity = entities[0];
						if (entity instanceof BaseNodeModel) {
							y = entity.getBoundingBox().getHeight() + 10;
						}
					}
					_.forEach(model.getSelectedEntities(), (item: BaseModel<any>) => {
						let newItem = item.clone(itemMap);
						if (!newItem) {
							return;
						}
						item.setSelected(false);

						// offset the nodes slightly

						if (newItem instanceof NodeModel) {
							newItem.setPosition(newItem.getX() + offset.x, newItem.getY() + y);
							model.addNode(newItem);
						}
					});
					this.engine.repaintCanvas();
				}
			},
		});
	}
}
