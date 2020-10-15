class BusStopTimeline extends DeviceTimeline {
    constructor(mainController: IoTController, identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new BusPassageComponent(mainController, this, this.getMainAttributeContainer(),friendlyName, "passage"));
    }

   /* adaptStateChangesToTimeline(changeItems: any []): any [] {
        let items = [];
        let itemIndex = 1;

        if(changeItems.length == 0) return [];

        let uniqueBusses = {};

        for(let i = 0; i < changeItems.length; i++) {
            let time = null;
            let thisBusNumber = changeItems[i]["attributes"]["line_number_public"];
            let thisFinalDestination = changeItems[i]["attributes"]["final_destination"];
            let thisScheduledTime = changeItems[i]["attributes"]["due_at_schedule"];
            let thisRealTime = changeItems[i]["attributes"]["due_at_realtime"];

            if(thisRealTime != null) {
                time = thisRealTime;
            } else {
                time = thisScheduledTime;
            }

            if(time != null) {
                let identifier = thisBusNumber + thisFinalDestination + thisScheduledTime;

                uniqueBusses[identifier] = {
                    busNumber: thisBusNumber,
                    finalDestination: thisFinalDestination,
                    time: time
                };
            }
        }

        for(let busName in uniqueBusses) {


            itemIndex++;
        }

        return items;
    } */
}