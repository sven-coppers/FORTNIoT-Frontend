class HueTimeline extends DeviceTimeline {
    private stateTimeline: any;
    private brightnessGraph: any;
    private colorTimeline: any;

    constructor(mainController: IoTController, identifier: string, deviceName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new StateComponent(mainController, this, this.getMainAttributeContainer(), deviceName, "state", "hue.png"));
       // this.components.push(new DiscreteGraphComponent(this.device.getHTMLID() + '_brightness_graph', this,"Brightness"));
     //   this.components.push(new ColorComponent(this.device.getHTMLID() + '_color_timeline', this));
    }

    adaptBrightnessChangesToGraph(changeItems: any []): any [] {
        if(changeItems.length == 0) return [];
        let items = [];

        let lastTime = changeItems[0]["last_changed"];
        let lastBrightness = changeItems[0]["attributes"]["brightness"];


        items.push({ x: lastTime, y: lastBrightness/ 255.0, group: 1});

        for(let i = 1; i < changeItems.length; i++) {
            let thisBrightness = changeItems[i]["attributes"]["brightness"];
            let thisTime = changeItems[i]["last_changed"];

            if(thisBrightness == lastBrightness) continue;

            let oldPoint = new Date(thisTime);
            oldPoint.setSeconds(oldPoint.getSeconds() - 5);

            items.push({ x: oldPoint, y: lastBrightness / 255.0, group: 1});

            items.push({ x: thisTime, y: thisBrightness/ 255.0, group: 1});

            lastBrightness = thisBrightness;
            lastTime = thisTime;
        }

        let latest = Math.max(Date.parse(lastTime), new Date().getTime());

            items.push({ x: new Date(latest), y: lastBrightness / 255.0, group: 1});

        return items;
    }

    private adaptColorChangesToTimeline(deviceChanges: any[]) {
        if(deviceChanges.length == 0) return [];
        let items = [];

        let lastColor = deviceChanges[0]["attributes"]["rgb_color"];
        let startTime: Date = deviceChanges[0]["last_updated"];
        let endTime: Date = startTime;

        for(let i = 0; i < deviceChanges.length; i++) {
            let thisColor = deviceChanges[i]["attributes"]["rgb_color"];

            if(JSON.stringify(thisColor) !== JSON.stringify(lastColor) || deviceChanges[i]["state"] === "off") {
                endTime = deviceChanges[i]["last_updated"];

                if(thisColor != null) {
                    for(let j = 0; j < 3; j++) {
                        thisColor[j] = 255 * thisColor[j];
                    }

                    items.push({
                        id: i,
                        group: 1,
                        content: '<span class="colored" style="background-color: rgb(' + thisColor + ');">&nbsp;</span>',
                        start: startTime,
                        end: endTime,
                        type: 'range'
                    });
                }

                lastColor = thisColor;
                startTime = endTime;
            }
        }

        return items;
    }
}