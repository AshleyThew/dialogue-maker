import './App.css';
import { Application } from './Application';
import { BodyWidget } from './components/BodyWidget';

function App() {
	var app = new Application();

	return (
		<div className="App">
			<BodyWidget app={app}></BodyWidget>
		</div>
	);
}

export default App;
