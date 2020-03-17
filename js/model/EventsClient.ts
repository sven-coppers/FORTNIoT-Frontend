class EventsClient {
    mainController: IoTController;

    constructor(mainController: IoTController) {
        this.mainController = mainController;
    }

    startListening() {
        var oThis = this;
        var source = new EventSource("http://localhost:8080/intelligibleIoT/api/events/stream");

        source.addEventListener("message", function(event) {
            oThis.drawEvent(JSON.parse(event.data));
            document.getElementById("sven_events").innerHTML = event.data;
        });
    }

    drawEvent(event) {
        let date = new Date(event["timestamp"]);
        let identifier = event["identifier"];
        let htmlContainerSelector = identifier.replace("button.", "#");
        let htmlContainer = $(htmlContainerSelector).find(".event_history");

        htmlContainer.append("<p>" + timeToString(date) + ": " + event["action"] + " (" + event["user"] + "@" + event["client"] + ")</p>");
    }

    refresh() {
        let oThis = this;

        $.ajax({
            url:            "http://localhost:8080/intelligibleIoT/api/events/history",
            type:           "GET",
        }).done(function (data) {
            oThis.drawEventLog(data);
        });
    }

    drawEventLog(events) {
        for(let i = events.length - 1; i >= 0; i--) {
            let event = events[i];

            let identifier = event["identifier"];
            this.mainController.devices[identifier].drawEventLogItem(event);
        }
    }
}