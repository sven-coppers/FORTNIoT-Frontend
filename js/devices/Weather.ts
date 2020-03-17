class Weather extends Device {
    constructor(mainController: IoTController, identifier: string) {
        super(mainController, identifier);
    }

    initState(newWindowState: MainWindowState) {
    }

    showState(IoTState, newWindowState: MainWindowState) {
        //$("#weather_icon").attr("src", IoTState["attributes"]["entity_picture"]);
    //    $("#weather_icon").attr("src", 'cases/demo/iot/img/weather/' + IoTState["state"] + '.png');
    //    (newWindowState.getWidgetState("weather_temperature") as LabelState).value = IoTState["attributes"]["temperature"] + '°C';
    //    (newWindowState.getWidgetState("weather_humidity") as LabelState).value = IoTState["attributes"]["humidity"] + '%';
   //     (newWindowState.getWidgetState("weather_wind") as LabelState).value = IoTState["attributes"]["wind_speed"] + ' km/h';
    }

    previewState(IoTState, newWindowState: MainWindowState) {

    }

    drawStateHistoryItem(changeItem): JQuery {
        let date = new Date(changeItem["last_updated"]);
        let htmlContainer = $("#weather_history");

        let element = $('<p class="log_item">' + dateToString(date) + ': <img class="thumbnail" src="img/weather/' + changeItem["state"] + '.png"' + "/> " + changeItem["attributes"]["temperature"] + "°C</p>");

   //     htmlContainer.append(element);

        return element;
    }

    drawStateFutureItem(changeItem): JQuery {
        let date = new Date(changeItem["last_updated"]);
        let htmlContainer = $("#weather_future");

        let element = $('<p class="log_item">' + dateToString(date) + ': <img class="thumbnail" src="img/weather/' + changeItem["state"] + '.png"' + "/> " + changeItem["attributes"]["temperature"] + "°C</p>");

     //   htmlContainer.append(element);

     //   let objDiv = document.getElementById("weather_future");
      //  objDiv.scrollTop = objDiv.scrollHeight;

        return element;
    }

    drawEventLogItem(eventItem) {

    }

    drawChangePredictionItem(changeItem) {

    }

    drawEventPredictionItem(eventItem) {

    }

    initVisualisation() {
    }

    reAlign(range) {
    }
}