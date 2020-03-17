class IoTButton extends Device {
    constructor(mainController: IoTController, identifier: string) {
        super(mainController, identifier);
    }

    initState(newWindowState: MainWindowState) {
    }

    initVisualisation() {
    }

    showState(IoTState, newWindowState: MainWindowState) {
    }

    previewState(IoTState, newWindowState: MainWindowState) {

    }

    previewClick(event, newWindowState) {
        let oThis = this;
        let contentData = {
            "identifier": this.identifier,
            "action": "PRESSED",
            "client": "WEB_CLIENT",
            "user": "USER",
            "timestamp": dateToAPI(new Date())
        };

        // Tijdelijk uitgezet

   /*     $.ajax({
            url:            "http://localhost:8080/IntelligibleIoT_war_exploded_war_exploded/api/events/preview/",
            type:           "POST",
            data:           JSON.stringify(contentData),
            contentType:    'application/json',
            dataType:       'json',
            success:        function (data) {
                oThis.mainController.stateClient.previewIoTState(data);
            }
        }); */
    }

    click(event, newWindowState) {
        let oThis = this;
        let contentData = {
            "identifier": this.identifier,
            "action": "PRESSED",
            "client": "WEB_CLIENT",
            "user": "USER",
            "timestamp": dateToAPI(new Date()),
            "contexts": []
        };
    // Tijdelijk uitgezet

    /*
         $.ajax({
             url:            "http://localhost:8080/IntelligibleIoT_war_exploded_war_exploded/api/events/",
             type:           "POST",
             data:           JSON.stringify(contentData),
             contentType:    'application/json',
             dataType:       'json'
         }); */
 }

 drawStateHistoryItem(changeItem): JQuery {
     return null;
 }

 drawEventLogItem(eventItem) {
     let date = new Date(eventItem["timestamp"]);
     let htmlContainer = $("#" + this.getHTMLID() + "_history");

     let element = $('<p class="log_item">' + timeToString(date) + ": " + eventItem["action"] + " (" + eventItem["user"] + "@" + eventItem["client"] + ")</p>");

  //   htmlContainer.append(element);

     this.addContextsToElement(element, eventItem["contexts"]);
 }

 drawChangePredictionItem(changeItem) {

 }

 drawEventPredictionItem(eventItem) {

 }

 protected drawStateFutureItem(changeItem): JQuery<HTMLElement> {
     return undefined;
 }


    adaptChangesToTimeline(changeItems: any []): any [] {
        return [];
    }

    reAlign(range) {
    }
}