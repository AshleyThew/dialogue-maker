import "./App.scss";
import { BodyWidget } from "./components/route/editor/BodyWidget";
import { Routes, Route } from "react-router-dom";

function App() {
	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<BodyWidget />} />
			</Routes>
		</div>
	);
}

export default App;
