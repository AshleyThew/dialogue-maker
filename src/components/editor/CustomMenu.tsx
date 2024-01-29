import React from "react";

import PropTypes from "prop-types";
import VirtualList from "react-tiny-virtual-list";
import { GroupBase, MenuListProps } from "react-select";

const DefaultItemHeight = 16;

export class CustomMenuList extends React.Component<MenuListProps<any, boolean, GroupBase<any>>> {
	static propTypes = {
		options: PropTypes.array.isRequired,
		children: PropTypes.node.isRequired,
		maxHeight: PropTypes.number.isRequired,
		getValue: PropTypes.func.isRequired,
	};

	renderItem = (props: { style: React.CSSProperties; index: React.Key }) => {
		const { children } = this.props;
		if (Array.isArray(children)) {
			return (
				<li style={{ ...props.style }} key={props.index}>
					{children[Number(props.index)]}
				</li>
			);
		}
		return (
			<li key={props.index} className="react-virtualized-menu-placeholder">
				{children}
			</li>
		);
	};

	render() {
		const { children, maxHeight } = this.props;

		const initialOffset = 0;
		const childrenOptions = React.Children.toArray(children);
		const wrapperHeight = maxHeight < childrenOptions.length * DefaultItemHeight ? maxHeight : childrenOptions.length * DefaultItemHeight;

		return (
			<span className="react-virtualized-list-wrapper">
				<VirtualList
					width=""
					height={wrapperHeight + 8}
					scrollOffset={initialOffset}
					itemCount={childrenOptions.length}
					itemSize={DefaultItemHeight}
					renderItem={this.renderItem}
				/>
			</span>
		);
	}
}
