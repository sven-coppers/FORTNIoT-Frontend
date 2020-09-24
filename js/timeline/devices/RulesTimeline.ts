class RulesTimeline extends DeviceTimeline {
    constructor(containerTimeline: Timeline) {
        super(containerTimeline, "all_rules");

        this.components = [];
        this.components.push(new RulesComponent(this, this.getMainAttributeContainer(), "no label"));
    }

  /*  initHTML() {
        let html = "";

        html += '<div class="timeline_device device">';
        html += '   <div class="timeline_device_main_attribute" id="all_rules_axis_timeline">';
        html += '   </div>';
        html += '</div>';

        $(".timeline_wrapper").append(html);
    } */

    initVis() {

    }

}