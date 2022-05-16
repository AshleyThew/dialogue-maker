import { AbstractDisplacementState, AbstractDisplacementStateEvent, Action, ActionEvent, InputType } from "@projectstorm/react-canvas-core";
import { DiagramEngine, LinkModel, PortModel } from "@projectstorm/react-diagrams";
import { MouseEvent } from "react";
import * as _ from "lodash";

export class DialogueDragNewLinkState extends AbstractDisplacementState<DiagramEngine> {
	port: PortModel;
	link: LinkModel;

	constructor() {
		super({ name: "drag-new-link" });

		this.registerAction(
			new Action({
				type: InputType.MOUSE_DOWN,
				fire: (event: ActionEvent<MouseEvent, PortModel>) => {
					this.port = this.engine.getMouseElement(event.event) as PortModel;
					this.link = this.port.createLinkModel();

					// if no link is given, just eject the state
					if (!this.link) {
						this.eject();
						return;
					}
					this.link.setSelected(true);
					this.link.setSourcePort(this.port);
					this.engine.getModel().addLink(this.link);
					this.port.reportPosition();
				},
			})
		);

		this.registerAction(
			new Action({
				type: InputType.MOUSE_UP,
				fire: (event: ActionEvent<MouseEvent>) => {
					const model = this.engine.getMouseElement(event.event);
					// check to see if we connected to a new port
					if (model instanceof PortModel) {
						if (this.port.canLinkToPort(model)) {
							_.forEach(this.link.getSourcePort().getLinks(), (link) => {
								if (link !== this.link) {
									link.remove();
								}
							});
							this.link.setTargetPort(model);
							model.reportPosition();
							this.engine.repaintCanvas();
							return;
						} else {
							this.link.remove();
							this.engine.repaintCanvas();
							return;
						}
					}

					this.link.remove();
					this.engine.repaintCanvas();
				},
			})
		);
	}

	/**
	 * Calculates the link's far-end point position on mouse move.
	 * In order to be as precise as possible the mouse initialXRelative & initialYRelative are taken into account as well
	 * as the possible engine offset
	 */
	fireMouseMoved(event: AbstractDisplacementStateEvent): any {
		const portPos = this.port.getPosition();
		const zoomLevelPercentage = this.engine.getModel().getZoomLevel() / 100;
		const engineOffsetX = this.engine.getModel().getOffsetX() / zoomLevelPercentage;
		const engineOffsetY = this.engine.getModel().getOffsetY() / zoomLevelPercentage;
		const initialXRelative = this.initialXRelative / zoomLevelPercentage;
		const initialYRelative = this.initialYRelative / zoomLevelPercentage;
		const linkNextX = portPos.x - engineOffsetX + (initialXRelative - portPos.x) + event.virtualDisplacementX;
		const linkNextY = portPos.y - engineOffsetY + (initialYRelative - portPos.y) + event.virtualDisplacementY;

		this.link.getLastPoint().setPosition(linkNextX, linkNextY);
		this.engine.repaintCanvas();
	}
}
