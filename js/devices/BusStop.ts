class BusStop extends Device {
    constructor(mainController: IoTController, identifier: string) {
        super(mainController, identifier);
    }

    initState(newWindowState: MainWindowState) {
    }

    showState(IoTState, newWindowState: MainWindowState) {

    }

    previewState(IoTState, newWindowState: MainWindowState) {

    }

    drawStateHistoryItem(changeItem): JQuery {
        return null;
    }

    protected drawStateFutureItem(changeItem): JQuery {
        return null;
    }

    drawEventLogItem(eventItem) {

    }

    drawChangePredictionItem(changeItem) {

    }

    drawEventPredictionItem(eventItem) {

    }
}