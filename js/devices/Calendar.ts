class Calendar extends Device {
    constructor(mainController: IoTController, identifier: string) {
        super(mainController, identifier);
    }

    initState(newWindowState: MainWindowState) {
    }

    showState(IoTState, newWindowState: MainWindowState) {
        if(IoTState["state"] == "on") {
      //      (newWindowState.getWidgetState(this.getHTMLID() + "_state") as LabelState).value = "busy (" + IoTState["attributes"]["message"] + ")";
        } else {
      //      (newWindowState.getWidgetState(this.getHTMLID() + "_state") as LabelState).value = "available";
        }


     //   (newWindowState.getWidgetState(this.getHTMLID() + "_state") as LabelState).value = IoTState["state"];
     //   (newWindowState.getWidgetState(this.getHTMLID() + "_message") as LabelState).value = IoTState["attributes"]["message"];
     //   (newWindowState.getWidgetState(this.getHTMLID() + "_start") as LabelState).value = IoTState["attributes"]["start_time"];
      //  (newWindowState.getWidgetState(this.getHTMLID() + "_end") as LabelState).value = IoTState["attributes"]["end_time"];
    }

    previewState(IoTState, newWindowState: MainWindowState) {

    }

    drawStateHistoryItem(changeItem): JQuery {
        let date = new Date(changeItem["last_updated"]);
        let htmlContainer = $("#" + this.getHTMLID() + "_history");
        let element = null;

        if(changeItem["state"] == "on") {
            element = $('<p class="log_item">' + dateToString(date) + ": [start]</p>");
        } else {
            element = $('<p class="log_item">' + dateToString(date) + ": [end]</p>");
        }

      //  htmlContainer.append(element);

        return element;
    }

    protected drawStateFutureItem(changeItem): JQuery {
        let date = new Date(changeItem["last_updated"]);
        let htmlContainer = $("#" + this.getHTMLID() + "_future");
        let element = null;

        if(changeItem["state"] == "on") {
            element = $('<p class="log_item">' + dateToString(date) + ": [start] " + changeItem["attributes"]["message"] + " </p>");
        } else {
            element = $('<p class="log_item">' + dateToString(date) + ": [end] " + changeItem["attributes"]["message"] + " </p>");
        }

      //  htmlContainer.append(element);

        return element;
    }

    drawEventLogItem(eventItem) {

    }

    drawChangePredictionItem(changeItem) {

    }

    drawEventPredictionItem(eventItem) {

    }
}