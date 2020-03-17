class SunTimeline extends DeviceTimeline {
    private stateTimeline: any;
    private elevationGraph: any;

    constructor(identifier: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);
        this.components = [];
        this.components.push(new SunStateComponent(this, this.getMainAttributeContainer(), 'Sun'));
       // this.components.push(new ContinuousGraphComponent(this, this.getOtherAttributesContainer(), "Elevation ", "elevation"));
    }

    adaptElevationChangesToGraph(changeItems: any []): any [] {
        if(changeItems.length == 0) return [];
        let items = [];

        for(let i = 0; i < changeItems.length; i++) {
            let thisElevation = changeItems[i]["attributes"]["elevation"];
            let thisTime = changeItems[i]["last_updated"];

            items.push({ x: thisTime, y: thisElevation, group: 1 });
        }

        return items;
    }
}