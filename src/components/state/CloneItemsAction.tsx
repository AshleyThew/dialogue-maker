import { KeyboardEvent } from "react";
import * as _ from "lodash";
import { Action, ActionEvent, BaseModel, InputType } from "@projectstorm/react-canvas-core";
import { DiagramEngine, NodeModel } from "@projectstorm/react-diagrams";
import { BaseNodeModel } from "../node/base";
import { Application } from "../../Application";

export interface CloneItemsActionOptions {
	app?: Application;
	keyCodes?: number[];
	modifiers?: {
		ctrlKey?: boolean;
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

				if (keyCodes.indexOf(keyCode) !== -1 && _.isEqual({ ctrlKey, altKey, metaKey }, modifiers)) {
					event.event.preventDefault();
					let model = this.engine.getModel();
					let itemMap = {};
					const entities = model.getSelectedEntities();
					const filtered = entities.filter((entity) => entity instanceof BaseNodeModel).map((entity) => entity as BaseNodeModel<any>);
					filtered.sort((node1, node2) => node2.getPosition().y - node1.getPosition().y);

					var y = offset.y;
					if (filtered.length && y === undefined) {
						y = filtered[0].getBoundingBox().getHeight() + 7;
						y += filtered[0].getPosition().y - filtered[filtered.length - 1].getPosition().y;
					} else {
						y = 50;
					}
					var last: NodeModel = null;
					var first: NodeModel = null;
					_.forEach(model.getSelectedEntities(), (item: BaseModel<any>) => {
						let newItem = item.clone(itemMap);
						if (!newItem) {
							return;
						}
						item.setSelected(false);

						// offset the nodes slightly

						if (newItem instanceof NodeModel) {
							if (!first) {
								first = newItem;
							}
							newItem.setPosition(newItem.getX() + offset.x, newItem.getY() + y);
							model.addNode(newItem);
							last = newItem;
						}
					});
					//console.log(first.getInPorts().length === 0);
					if (shiftKey && first && first instanceof BaseNodeModel && first.getInPorts().length === 1) {
						const latest = sessionStorage.getItem("latest-node");
						if (latest) {
							const lnode = model.getNode(latest);
							if (lnode && lnode instanceof BaseNodeModel && lnode.getOutPorts().length === 1) {
								const outPort = lnode.getOutPorts()[0];
								const inPort = first.getInPorts()[0];
								if (inPort.canLinkToPort(outPort)) {
									const link = outPort.createLinkModel();
									link.setSourcePort(outPort);
									link.setTargetPort(inPort);
									model.addLink(link);
									first.setPosition(lnode.getX(), lnode.getY() + lnode.getBoundingBox().getHeight() + 7);
								}
							}
						}
					}
					if (last) {
						sessionStorage.setItem("latest-node", last.getID());
					}
					this.engine.repaintCanvas();
					options.app.forceUpdate();
				}
			},
		});
	}
}
