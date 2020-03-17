class Light extends Device {
    constructor(mainController: IoTController, identifier: string) {
        super(mainController, identifier);
    }
    
    protected drawStateFutureItem(changeItem: any): JQuery {
        let date = new Date(changeItem["last_updated"]);
        let htmlContainer = $("#" + this.getHTMLID() + "_future");

        let logItem = $('<p class="log_item">'+ timeToString(date) + ": " + changeItem["state"] + " (brightness: " + changeItem["attributes"]["brightness"] + ")</p>");

     //   htmlContainer.append(logItem);

        return logItem;
    }


    initState(newWindowState: MainWindowState) {
    //    newWindowState.getWidgetState(this.getHTMLID() + "_on").enabled = false;
    //    newWindowState.getWidgetState(this.getHTMLID() + "_off").enabled = false;
    }

    showState(IoTState, newWindowState: MainWindowState) {
   //     newWindowState.getWidgetState(this.getHTMLID() + "_on").enabled = IoTState["state"] != "on";
    //    newWindowState.getWidgetState(this.getHTMLID() + "_off").enabled = IoTState["state"] == "on";
    }

    previewState(IoTState, newWindowState: MainWindowState) {
   //     newWindowState.getWidgetState(this.getHTMLID() + "_on").enabled = IoTState["state"] != "on";
   //     newWindowState.getWidgetState(this.getHTMLID() + "_off").enabled = IoTState["state"] == "on";
    }

    turnOn() {
    //    this.currentState["state"] = "on";
     //   this.currentState["attributes"]["brightness"] = 254;
     //   this.submitNewState(this.currentState);
    }

    turnOff() {
    //    this.currentState["state"] = "off";
    //    this.submitNewState(this.currentState);
    }

    submitNewState(newState) {
        $.ajax({
            url:            "http://localhost:8080/IntelligibleIoT_war_exploded_war_exploded/api/states/" + this.identifier,
            type:           "PUT",
            data:           JSON.stringify(newState),
            contentType:    'application/json',
            dataType:       'json'
        });
    }

    drawStateHistoryItem(changeItem): JQuery {
        let date = new Date(changeItem["last_updated"]);
        let htmlContainer = $("#" + this.getHTMLID() + "_history");

        let logItem = $('<p class="log_item">'+ timeToString(date) + ": " + changeItem["state"] + " (brightness: " + changeItem["attributes"]["brightness"] + ")</p>");

      //  htmlContainer.append(logItem);

        return logItem;
    }

    drawEventLogItem(eventItem) {

    }

    drawChangePredictionItem(changeItem) {

    }

    drawEventPredictionItem(eventItem) {

    }


    adaptChangesToTimeline(changeItems: any []): any [] {
        return [];
    }

    initVisualisation() {
    }

    reAlign(range) {
    }
}