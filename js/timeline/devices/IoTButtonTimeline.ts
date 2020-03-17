class IoTButtonTimeline extends DeviceTimeline {
    constructor(identifier: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);


        this.components = [];
        //this.components.push(new AxisComponent(this, this.getMainAttributeContainer(), '<img src="img/button.png" class="thumbnail"/> Button'));
    }

    adaptStateChangesToTimeline(changeItems: any []): any [] {
        let items = [];

        // TODO: Change to events

        items.push({
            id: 1,
            group: 1,
            content: "Clicked",
            start: new Date(),
            end: new Date(),
            type: 'range'
        }, {
            id: 2,
                group: 1,
                content: "Clicked",
            end: new Date(),
            start: new Date(new Date().getTime() + 20000),
                type: 'range'
        });

        return items;
    }
}