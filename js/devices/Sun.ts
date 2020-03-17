class Sun extends Device {

    constructor(mainController: IoTController, identifier: string) {
        super(mainController, identifier);
    }

    initState(newWindowState: MainWindowState) {
    }

    showState(IoTState, newWindowState: MainWindowState) {
      //  (newWindowState.getWidgetState(this.getHTMLID() + "_state_value") as LabelState).value = IoTState["state"];
      //  (newWindowState.getWidgetState(this.getHTMLID() + "_elevation") as LabelState).value = IoTState["attributes"]["elevation"];
      //  (newWindowState.getWidgetState(this.getHTMLID() + "_rising") as LabelState).value = timeToString(new Date(IoTState["attributes"]["next_rising"]));
       // (newWindowState.getWidgetState(this.getHTMLID() + "_setting") as LabelState).value = timeToString(new Date(IoTState["attributes"]["next_setting"]));
    }

    previewState(IoTState, newWindowState: MainWindowState) {

    }

    drawStateHistoryItem(changeItem): JQuery {
        let date = new Date(changeItem["last_updated"]);
        let htmlContainer = $("#" + this.getHTMLID() + "_history");

        let element = $('<p class="log_item">' + dateToString(date) + ": " + changeItem["state"] + " (elevation: " + changeItem["attributes"]["elevation"] + ")</p>");

    //    htmlContainer.append(element);

        return element;
    }

    protected drawStateFutureItem(changeItem): JQuery {
        let date = new Date(changeItem["last_updated"]);
        let htmlContainer = $("#" + this.getHTMLID() + "_future");

        let element = $('<p class="log_item">' + dateToString(date) + ": " + changeItem["state"] + " (elevation: " + changeItem["attributes"]["elevation"] + ")</p>");

     //   htmlContainer.append(element);

        return element;
    }

    drawEventLogItem(eventItem) {

    }

    drawChangePredictionItem(changeItem) {

    }

    drawEventPredictionItem(eventItem) {

    }
}