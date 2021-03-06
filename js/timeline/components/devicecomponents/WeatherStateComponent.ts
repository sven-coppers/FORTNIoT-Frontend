class WeatherStateComponent extends StateComponent {
    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(mainController, parentDevice, parentElement, label, "weather_state", "weather.png");
    }

    jsonToLabel(json) {
        let icon = json["state"];
        let label = icon;

        if(label === "partlycloudy") {
            label = "partly cloudy"
        }

        label = label.replace("_", " ");

        return '<img class="thumbnail" src="img/devices/weather/' + icon + '.png" /> ' + capitalizeFirstLetter(label);
    }
}