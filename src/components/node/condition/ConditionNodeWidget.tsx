import * as React from "react";
import * as _ from "lodash";
import { BaseNodeProps, BaseNodeWidget, S } from "../base";
import { ConditionNodeModel } from "./ConditionNodeModel";
import { ConditionBlock } from "../../editor/Condition";
import { EditableInput } from "../../editor/Inputs";

export interface ConditionNodeProps extends BaseNodeProps<ConditionNodeModel> {}

export class ConditionNodeWidget extends BaseNodeWidget<ConditionNodeProps> {
	render() {
		return super.construct(
			<>
				{this.props.node.getOptions().conditions.map((condition, index) => {
					return (
						<div key={`o${index}`}>
							{index !== 0 && <hr style={{ margin: "0 0", background: "black", border: "0px", height: "1px" }} />}
							<div style={{ color: "black", display: "flex", justifyContent: "space-between" }}>
								<ConditionBlock option={condition} remove={undefined} allowActionable={true} />
								{/* <div style={{ color: "white", display: "flex", alignItems: "center" }}>
									<S.PortOut engine={this.props.engine}>
										<S.PortsContainer>{this.generatePort(this.props.node.getOutPorts()[index])}</S.PortsContainer>
									</S.PortOut>
								</div> */}
							</div>
						</div>
					);
				})}
			</>
		);
	}

	renderHeader(): JSX.Element {
		return (
			<EditableInput
				style={{ width: "100%", color: "black", background: "transparent" }}
				value={this.props.node.getOptions().title}
				setValue={(value) => (this.props.node.getOptions().title = value)}
				editable={this.props.node.getOptions().editableTitle}
			/>
		);
	}

	renderInPorts(): JSX.Element {
		return (
			<div style={{ display: "flex", alignItems: "center" }}>
				{this.props.node.getInPorts().length && (
					<S.PortIn engine={this.props.engine}>
						<S.PortsContainer>{_.map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
					</S.PortIn>
				)}
			</div>
		);
	}
}
