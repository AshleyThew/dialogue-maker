import * as React from "react";
import * as _ from "lodash";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import styled from "@emotion/styled";
import { BaseNodeModelOptions, BaseNodeModel, BaseNodeModelGenerics } from ".";
import { DefaultPortLabel } from "@projectstorm/react-diagrams";
import { EditableInput } from "../../editor/Inputs";

export type BaseNodeProps<T> = {
	node: T;
	engine: DiagramEngine;
};
export namespace S {
	export const Node = styled.div<{ background: string; selected: boolean }>`
		background-color: ${(p) => p.background};
		border-radius: 5px;
		font-family: sans-serif;
		color: white;
		border: solid 2px black;
		overflow: visible;
		font-size: 11px;
		border: solid 2px ${(p) => (p.selected ? "rgb(0,192,255)" : "black")};
	`;

	export const Title = styled.div`
		display: flex;
		white-space: nowrap;
		margin: auto;
		justify-content: center;
		width: 90%;
	`;

	export const TitleName = styled.input`
		background: rgba(187, 187, 187, 0.3);
		flex-grow: 1;
		padding: 5px 5px;
		border: none;
		width: 100%;
	`;

	export const PortIn = styled.div<{ engine?: DiagramEngine }>`
		display: inline-block;
		position: relative;
		left: -18px;
		margin-right: -18px;
		height: 17px;
		background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));

		&:hover .port div {
			background: rgb(108, 145, 0);
		}
	`;

	export const PortOut = styled.div<{ engine?: DiagramEngine }>`
		display: inline-block;
		position: relative;
		right: -18px;
		margin-left: -18px;
		height: 17px;
		background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));

		&:hover .port div {
			background: "rgb(192, 255, 0)";
		}
	`;

	export const NodeContent = styled.td`
		width: 100%;
	`;

	export const PortsContainer = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;

		&:first-of-type {
			margin-right: 10px;
		}

		&:only-child {
			margin-right: 0px;
		}
	`;
}

export abstract class BaseNodeWidget<T extends BaseNodeProps<BaseNodeModel<BaseNodeModelGenerics<BaseNodeModelOptions>>>> extends React.Component<T> {
	generatePort = (port) => {
		return <DefaultPortLabel engine={this.props.engine} port={port} key={port.getID()} />;
	};

	construct(children): React.ReactNode {
		return (
			<S.Node
				data-default-node-name={this.props.node.getOptions().title}
				selected={this.props.node.isSelected()}
				background={this.props.node.getOptions().color}
			>
				<S.Title style={{ display: "flex", alignItems: "center" }}>{this.renderHeader()}</S.Title>
				{children && (
					<table>
						<tbody>
							<tr>
								<td style={{ verticalAlign: "top" }}>{this.renderInPorts()}</td>
								<S.NodeContent>{children}</S.NodeContent>
								<td style={{ verticalAlign: "sub" }}>{this.renderOutPorts()}</td>
							</tr>
						</tbody>
					</table>
				)}
			</S.Node>
		);
	}

	renderHeader(): JSX.Element {
		const style = { width: "100%", color: "black" };
		if (!this.props.node.getOptions().editableTitle) {
			style["background"] = "transparent";
		}
		return (
			<EditableInput
				style={style}
				value={this.props.node.getOptions().title}
				setValue={(value) => (this.props.node.getOptions().title = value)}
				editable={this.props.node.getOptions().editableTitle}
			/>
		);
	}

	renderInPorts(): JSX.Element {
		return (
			this.props.node.getInPorts().length && (
				<S.PortIn engine={this.props.engine}>
					<S.PortsContainer>{_.map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
				</S.PortIn>
			)
		);
	}

	renderOutPorts(): JSX.Element {
		return (
			this.props.node.getOutPorts().length && (
				<S.PortOut engine={this.props.engine}>
					<S.PortsContainer>{_.map(this.props.node.getOutPorts(), this.generatePort)}</S.PortsContainer>
				</S.PortOut>
			)
		);
	}
}
