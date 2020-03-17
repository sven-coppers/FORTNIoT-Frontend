abstract class Device {
    public mainController: IoTController;
    public identifier: string;
    currentState: any;

    protected constructor(mainController: IoTController, identifier: string) {
        this.mainController = mainController;
        this.identifier = identifier;
        this.currentState = null;
    }

    getHTMLID(): string {
        return this.identifier.substring(this.identifier.indexOf(".") + 1, this.identifier.length);
    }

    abstract initState(newWindowState: MainWindowState);


    redrawVisualisation(deviceChanges) {//TODO
         };


    public setState(IoTState, newWindowState: MainWindowState) {
        this.currentState = IoTState;
       // this.showState(IoTState, newWindowState);
    }

    abstract showState(IoTState, newWindowState: MainWindowState);

    abstract previewState(IoTState, newWindowState: MainWindowState);

    public addStateHistoryItem(changeItem) {
        // TODO: Replace with behavior for timelines instead of log items

        //let container = this.drawStateHistoryItem(changeItem);
      /*  container.addClass(changeItem["context"]["id"]);

        container.click(function() {
            $(".log_item").removeClass("selected");
            $(this).addClass("selected");
        });

        container.hover(function() {
            $("." + changeItem["context"]["id"]).addClass("highlighted");
        }, function() {
            $(".log_item").removeClass( "highlighted");
        }); */
    }

    protected abstract drawStateHistoryItem(changeItem): JQuery;

    public addStateFutureItem(changeItem) {
        let container = this.drawStateFutureItem(changeItem);
    }

    protected abstract drawStateFutureItem(changeItem): JQuery;
    protected abstract drawEventLogItem(eventItem);
    protected abstract drawChangePredictionItem(changeItem);
    protected abstract drawEventPredictionItem(eventItem);


    protected addContextsToElement(element: JQuery, contexts: string[]) {
        for(let context of contexts) {
            element.addClass(context);
        }
    }
}