import { action, observable, makeObservable } from 'mobx';
import NodeModel from '../diagram/models/NodeModel';
import clientFactory, {
  Client,
} from '../clients/ClientFactory';
import { showNotification } from '../utils/Notifications';
import { Page, Inspector, InspectorMode } from '../types';

interface Metadata {
  running: boolean;
  page: Page;
  activeInspector: Inspector;
  requestOpenNodeModal: string;
  stories: any[];
  activeStory: string;
  client: Client;
}

export class Store {
  results;

  diagram = {
    engine: null,
    availableNodes: [],
    refresh: 0,
    nodeSerial: 1,
  };

  metadata: Metadata = {
    running: false,
    page: 'Workbench',
    activeInspector: {
      nodeId: null,
      mode: 'Table',
    },
    requestOpenNodeModal: null,
    stories: [],
    activeStory: '',
    client: clientFactory((window as any).config),
  };

  constructor() {
    makeObservable(this, {
      // Observables
      diagram: observable,
      metadata: observable,

      // Setters
      addNode: action.bound,
      clearResults: action.bound,
      increaseNodeSerial: action.bound,
      goToInspector: action.bound,
			navigateDiagram: action.bound,
      openNodeModal: action.bound,
      refreshDiagram: action.bound,
      resetOpenNodeModalRequest: action.bound,
      setActiveInspector: action.bound,
      setActiveInspectorMode: action.bound,
      setActiveStory: action.bound,
      setAvailableNodes: action.bound,
      setEngine: action.bound,
      setPage: action.bound,
      setResults: action.bound,
      setNotRunning: action.bound,
      setRunning: action.bound,
      setStories: action.bound,
      setDiagramLocked: action.bound,

      // Notifications
      showRunFail: action.bound,
      showRunSuccessful: action.bound,
    });
  }

  addNode(data) {
    delete data.id; // TODO remove id at availableNodes prep

    this.diagram.engine.model.addNode(
      new NodeModel({
        serial: this.diagram.nodeSerial++,
        ...data,
      }),
    );

    this.refreshDiagram();
  }

  goToInspector(id) {
    this.metadata.activeInspector.nodeId = id;
    this.metadata.page = 'Inspector';
  }

  nodesWithInspectables() {
    // React diagram is not observable outside of its own context
    // Reference the refresh counter to ensure we have the latest data
    this.diagram.refresh;

    // Get all nodes with features
    return this.diagram.engine.model
      .getNodes()
      .filter((node) => node.isInspectable());
  }

  openNodeModal(nodeId: string): void {
    this.metadata.requestOpenNodeModal = nodeId;
    this.refreshDiagram();
  }

  resetOpenNodeModalRequest(): void {
    this.metadata.requestOpenNodeModal = null;
  }

  refreshDiagram() {
    this.diagram.refresh++;
  }

  increaseNodeSerial() {
    this.diagram.nodeSerial++;
  }

  setActiveStory(story) {
    this.metadata.activeStory = story;
  }

  setActiveInspector(nodeId) {
    this.metadata.activeInspector.nodeId = nodeId;
  }

  setActiveInspectorMode(mode: InspectorMode) {
    this.metadata.activeInspector.mode = mode;
  }

  setAvailableNodes(nodes) {
    this.diagram.availableNodes = nodes;
  }

  setEngine(engine) {
    this.diagram.engine = engine;
  }

  setPage(name) {
    this.diagram.engine.model.clearLinkLabels();
    const alreadyOnPage = this.metadata.page == name;
    this.metadata.page =
      alreadyOnPage && name !== 'Inspector'
        ? 'Workbench'
        : name;
  }

  setResults(results) {
    this.results = results;
  }

  setNotRunning() {
    setTimeout(() => {
      this.metadata.running = false;
    }, 500);
  }

  clearResults() {
    this.diagram.engine.model.clearNodeFeatures();
    this.diagram.engine.model.clearLinkLabels();
    this.refreshDiagram();
  }

  setRunning() {
    this.metadata.running = true;
  }

  setStories(stories) {
    this.metadata.stories = stories;
  }

  showRunFail(error) {
    showNotification({
      message: 'Crap! Could not run story! Check console.',
      type: 'error',
    });
  }

  showRunSuccessful() {
    showNotification({
      message: 'Successfully ran story!',
      type: 'success',
    });
  }
	
	navigateDiagram(direction: {x: number, y: number}) {
		
		const selection = this.diagram.engine.model.getSelectedEntities()

		if (selection.length !== 1 || !(selection[0] instanceof NodeModel)) return

		const current = selection[0]
		const currentPosition = current.getPosition()

		this.diagram.engine.model.clearSelection()
		
		const candidates = this.diagram.engine.model.getNodes().filter(candidate => candidate.options.id != current.options.id)

		const sorted = candidates.sort((n1, n2) => {
			const distanceN1 = (n1.getPosition().x - currentPosition.x) * direction.x 
			const distanceN2 = (n2.getPosition().x - currentPosition.x) * direction.x 

			if(distanceN1 > distanceN2) return 1;
			if(distanceN1 < distanceN2) return -1;
		})

		if(sorted.length) {
			sorted[0].setSelected(true)
		}
	}

  setDiagramLocked(locked: boolean) {
    this.diagram.engine.model.setLocked(locked);
    const state = this.diagram.engine
      .getStateMachine()
      .getCurrentState();
    if (state.dragCanvas !== undefined) {
      state.dragCanvas.config.allowDrag = !locked;
    }
  }
}

export const RootStore = ((window as any).store =
  new Store());
