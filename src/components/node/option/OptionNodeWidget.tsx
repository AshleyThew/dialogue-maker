import * as React from "react";
import * as _ from "lodash";
import { BaseNodeProps, BaseNodeWidget, S } from "../base";
import { Option, OptionNodeModel } from "./OptionNodeModel";
import { EditableInput } from "../../editor/Inputs";
import { C, ConditionBlock } from "../../editor/Condition";

export interface OptionNodeProps extends BaseNodeProps<OptionNodeModel> {}

export class OptionNodeWidget extends BaseNodeWidget<OptionNodeProps> {
	render() {
		return super.construct(
			<>
				{this.props.node.getOptions().options.map((option, index) => {
					const outPort = this.props.node.getOutPorts()[index];
					var remove = () => {
						this.props.node.getOptions().options.splice(index, 1);
						_.forEach(outPort.getLinks(), (link) => {
							link.remove();
						});
						if (this.props.node.getOptions().options.length === 0) {
							this.props.node.addOutPort("❯");
							this.props.node.getOptions().options.push(new Option());
						}
						this.props.engine.repaintCanvas();
					};

					var color = "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));";

					if (_.size(outPort.getLinks()) === 0) {
						color = "linear-gradient(rgba(170, 14, 14, 0.3), rgba(170, 14, 14, 0.4))";
					}

					return (
						<div key={`o${index}-${option.text}`}>
							{index !== 0 && <hr style={{ margin: "0 0", background: "black", border: "0px", height: "1px" }} />}
							<div style={{ color: "black", display: "flex", justifyContent: "space-between" }}>
								<ConditionBlock option={option} remove={remove} allowActionable={false} />
								<div style={{ margin: "5px 2px", width: "1px", backgroundColor: "black" }} />
								<div style={{ color: "white", display: "flex", alignItems: "center" }}>
									<EditableInput
										style={{ margin: "5px 2px" }}
										value={option.text}
										setValue={(value: any) => (option.text = value)}
										placeholder="Text"
									/>
									<S.PortOut color={color} style={{ right: "-24px" }}>
										<S.PortsContainer>{this.generatePort(this.props.node.getOutPorts()[index])}</S.PortsContainer>
									</S.PortOut>
								</div>
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
						this.props.node.getOptions().options.push(new Option());
						this.forceUpdate();
					}}
				>
					&#x271A;
				</C.Plus>
			</>
		);
	}

	renderOutPorts(required?: boolean): JSX.Element {
		return undefined;
	}
}
