import { AbstractDisplacementStateEvent, Action, ActionEvent, InputType, State } from "@projectstorm/react-canvas-core";
import { DiagramEngine, LinkModel, PortModel } from "@projectstorm/react-diagrams";
import { MouseEvent } from "react";
import * as _ from "lodash";
import { BaseNodeModel } from "../node/base";

export class DialogueDragNewLinkState extends State<DiagramEngine> {
	port: PortModel;
	link: LinkModel;

	initialX: number;
	initialY: number;
	initialXRelative: number;
	initialYRelative: number;

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

					const { clientX, clientY } = event.event;
					this.handleMoveStart(clientX, clientY);
				},
			})
		);

		this.registerAction(
			new Action({
				type: InputType.MOUSE_MOVE,
				fire: (actionEvent: ActionEvent<React.MouseEvent>) => {
					const { event } = actionEvent;

					if (event.buttons === 0) {
						// If buttons is 0, it means the mouse is not down, the user may have released it
						// outside of the canvas, then we eject the state
						this.link.remove();
						this.engine.repaintCanvas();
						this.eject();

						return;
					}

					const { clientX, clientY } = event;
					this.handleMove(clientX, clientY, event);
				},
			})
		);

		this.registerAction(
			new Action({
				type: InputType.MOUSE_UP,
				fire: (event: ActionEvent<MouseEvent>) => {
					const model = this.engine.getMouseElement(event.event);
					// check to see if we connected to a new port
					var attemptConnect: PortModel;
					if (model instanceof PortModel) {
						attemptConnect = model;
					} else if (model instanceof BaseNodeModel) {
						var ports = model.getInPorts();
						if (ports.length === 1) {
							attemptConnect = ports[0];
						}
					}
					if (attemptConnect) {
						if (this.port.canLinkToPort(attemptConnect)) {
							_.forEach(this.link.getSourcePort().getLinks(), (link) => {
								if (link !== this.link) {
									link.remove();
								}
							});
							this.link.setTargetPort(attemptConnect);
							attemptConnect.reportPosition();
							this.engine.repaintCanvas();
							this.engine.getModel().clearSelection();
							this.eject();
							return;
						}
					}

					this.link.remove();
					this.engine.repaintCanvas();
					this.eject();
				},
			})
		);
	}

	protected handleMoveStart(x: number, y: number): void {
		this.initialX = x;
		this.initialY = y;
		const rel = this.engine.getRelativePoint(x, y);
		this.initialXRelative = rel.x;
		this.initialYRelative = rel.y;
	}

	protected handleMove(x: number, y: number, event: React.MouseEvent | React.TouchEvent): void {
		this.fireMouseMoved({
			displacementX: x - this.initialX,
			displacementY: y - this.initialY,
			virtualDisplacementX: (x - this.initialX) / (this.engine.getModel().getZoomLevel() / 100.0),
			virtualDisplacementY: (y - this.initialY) / (this.engine.getModel().getZoomLevel() / 100.0),
			event,
		});
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
