import * as _ from "lodash";
import { BaseNodeProps, BaseNodeWidget, S } from "../base";
import { RandomNodeModel } from "./RandomNodeModel";

import { C } from "../../editor/Condition";

export interface RandomNodeProps extends BaseNodeProps<RandomNodeModel> {}

export class RandomNodeWidget extends BaseNodeWidget<RandomNodeProps> {
	render() {
		return super.construct(
			<>
				{this.props.node.getOutPorts().map((port, index) => {
					var color = "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));";

					if (_.size(port.getLinks()) === 0) {
						color = "linear-gradient(rgba(170, 14, 14, 0.3), rgba(170, 14, 14, 0.4))";
					}
					return (
						<div key={`p${index}`} style={{ color: "black", display: "flex", justifyContent: "space-between" }}>
							<div style={{ minWidth: "85%" }} />
							{index !== 0 ? (
								<C.DeleteLine
									data-no-drag
									title="Remove condition"
									onClick={() => {
										const outPort = this.props.node.getOutPorts().splice(index, 1)[0];
										_.forEach(outPort.getLinks(), (link) => {
											link.remove();
										});
										this.props.engine.repaintCanvas();
									}}
								>
									&#x268A;
								</C.DeleteLine>
							) : (
								<></>
							)}
							<div style={{ color: "white", display: "flex", alignItems: "center" }}>
								<S.PortOut color={color}>
									<S.PortsContainer>{this.generatePort(port)}</S.PortsContainer>
								</S.PortOut>
							</div>
						</div>
					);
				})}
			</>
		);
	}

	renderHeader(): JSX.Element {
		return (
			<>
				{super.renderHeader()}
				<C.Plus
					data-no-drag
					title="Add option"
					style={{ marginLeft: "2px", marginRight: "0px" }}
					onClick={(e) => {
						this.props.node.addOutPort("❯");
						this.forceUpdate();
					}}
				>
					&#x271A;
				</C.Plus>
			</>
		);
	}

	renderOutPorts(): JSX.Element {
		return undefined;
	}
}
