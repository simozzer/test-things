describe('Test the setup of the test framework', function () {

    /* These aren't strict tests, this unit has been hammered together to try and hit every code branch
    in the grid control (etc) to produce coverage stats to help removing redundant code. */

    "use strict";

    //------------------------------------------------------
    var testContainerDiv, grid;

    beforeAll(function () {
        jQuery.sap.registerModulePath("sap.com.alloc", "../../sap/com/alloc/");
        jQuery.sap.require("sap.com.alloc.controls.PCMVirtualGrid");
    });


    beforeEach(function (done) {

        // set timeout added to workaround issue where test framework is hanging https://github.com/jasmine/jasmine/issues/1327
        window.setTimeout(function () {

            // create a div to hold any visual controls that we render
            testContainerDiv = document.createElement('div');
            var sDivId = 'gridtestcontain_' + new Date().getTime();
            testContainerDiv.id = sDivId;
            document.body.appendChild(testContainerDiv);

            done();
        }, 0);
    });

    afterEach(function () {
        document.body.removeChild(testContainerDiv);
        grid = null;
    });

    it('Test stuff is accessible to test script', function () {
        expect(sap).toBeDefined();

        expect(grid).toBeUndefined();

        jQuery.sap.require("sap.com.alloc.controls.ModelSchema");
        expect(sap.com.alloc.controls.ModelSchema).toBeDefined();


        jQuery.sap.require("sap.com.alloc.controls.PCMSession");
        expect(sap.com.alloc.controls.PCMSession.toBeDefined);

    });

    it('render a small grid in the dom', function (done) {

        fixture.setBase("unit_tests/fixtures");

        var oSchema = fixture.load("modelSchema.json");

        sap.com.alloc.controls.ModelSchema._oSchema['testModel'] = sap.com.alloc.controls.ModelSchema._getIndexedSchema(oSchema);

        grid = new sap.com.alloc.controls.PCMVirtualGrid({
            modelName: 'testModel',
            dataFetchTimeout: 0,
            width: "200px",
            height: "200px",
            allValuesRendered: function (oEvent) {
                var oGrid = oEvent.getSource();
                if (oGrid._allValuesRenderedPassCount === 0) {
                    oGrid._allValuesRenderedPassCount++;

                    var aPivotDimensions = oGrid.getPivotDimensions();
                    expect(aPivotDimensions).toBeDefined();
                    expect(aPivotDimensions.length).toEqual(4);

                    // text getting an expansion context
                    var colRowItem = oGrid.getRows().getSubItems()[0];
                    var oContext = oGrid.getExpansionContext(colRowItem);
                    expect(oContext).toBeDefined();
                    done();
                }
            }

        });
        grid._allValuesRenderedPassCount = 0;


        spyOn(sap.com.alloc.controls.PCMSession, "getGridValues").and.callFake(function (oRequest, fnSuccess) {
            var oVals = fixture.load("smallGridValues_0.json");
            fnSuccess(oVals);
        });

        expect(grid).toBeDefined();


        var oViewData = fixture.load("smallViewData.json");
        grid._loadFetchedView(oViewData);
        grid.placeAt(testContainerDiv.id);
    });

    it('rotate a small grid in the dom', function (done) {

        fixture.setBase("unit_tests/fixtures");

        var oSchema = fixture.load("modelSchema.json");

        sap.com.alloc.controls.ModelSchema._oSchema['testModel'] = sap.com.alloc.controls.ModelSchema._getIndexedSchema(oSchema);

        grid = new sap.com.alloc.controls.PCMVirtualGrid({
            modelName: 'testModel',
            dataFetchTimeout: 0,
            width: "200px",
            height: "200px",
            allValuesRendered: function (oEvent) {
                var oGrid = oEvent.getSource();
                if (oGrid._allValuesRenderedPassCount === 0) {
                    oGrid._allValuesRenderedPassCount++;

                    var aPivotDimensions = oGrid.getPivotDimensions();
                    expect(aPivotDimensions).toBeDefined();
                    expect(aPivotDimensions.length).toEqual(4);

                    // text getting an expansion context
                    var colRowItem = oGrid.getRows().getSubItems()[0];
                    var oContext = oGrid.getExpansionContext(colRowItem);
                    expect(oContext).toBeDefined();

                    grid.rotate();

                    setTimeout(function(){
                        done();
                    },0);

                }
            }

        });
        grid._allValuesRenderedPassCount = 0;


        spyOn(sap.com.alloc.controls.PCMSession, "getGridValues").and.callFake(function (oRequest, fnSuccess) {
            var oVals = fixture.load("smallGridValues_0.json");
            fnSuccess(oVals);
        });

        expect(grid).toBeDefined();


        var oViewData = fixture.load("smallViewData.json");
        grid._loadFetchedView(oViewData);
        grid.placeAt(testContainerDiv.id);

    });



    it('render a large, scrollable, grid in the dom', function (done) {

        fixture.setBase("unit_tests/fixtures");

        var oSchema = fixture.load("modelSchema.json");

        sap.com.alloc.controls.ModelSchema._oSchema['testModel'] = sap.com.alloc.controls.ModelSchema._getIndexedSchema(oSchema);

        grid = new sap.com.alloc.controls.PCMVirtualGrid({
            modelName: 'testModel',
            dataFetchTimeout: 0,
            width: "600px",
            height: "600px",
            allValuesRendered: function (oEvent) {
                var oGrid = oEvent.getSource();

                // guard against running 'expect' after termination of spec
                if (oGrid._allValuesRenderedPassCount === 0) {
                    expect(oGrid).toBeDefined();

                    oGrid._allValuesRenderedPassCount++;

                    // inner grid should have vertical and horizontal scroll bars
                    var oInnerGrid = oGrid.getAggregation("_virtualGrid");
                    expect(oInnerGrid).toBeDefined();

                    var iLastRowIndex = oInnerGrid._getLastVisibleRowIndex();
                    var iLastColIndex = oInnerGrid._getLastVisibleColumnIndex();

                    expect(iLastRowIndex).toBeLessThan(oGrid.getRows().getColumnList().length);
                    expect(iLastColIndex).toBeLessThan(oGrid.getColumns().getColumnList().length);

                    //TODO:: look for code triggered by scroll

                    // force a scroll
                    $(oInnerGrid._oInnerDiv).scrollTop(40);
                    $(oInnerGrid._oInnerDiv).trigger("scroll");


                    // wait a bit for scroll and rotate code to run
                    window.setTimeout(function () {
                        done();
                    }, 200)

                }
            }
        });
        grid._allValuesRenderedPassCount = 0;

        spyOn(sap.com.alloc.controls.PCMSession, "getGridValues").and.callFake(function (oRequest, fnSuccess) {

            // Mock up some values to return
            var aValues = [];
            for (var i = 0; i < oRequest.dataRequest.cells.length; i++) {
                var oValue = {
                    cellIndex: oRequest.dataRequest.cells[i].cellIndex,
                    value: 99,
                    hasMemo: false,
                    canEdit: false
                };
                aValues.push(oValue);
            }
            var oResult = {
                viewAspect: oRequest.dataRequest.viewAspectId,
                values: aValues,
                identifierValues: []
            };

            fnSuccess(oResult);
        });

        expect(grid).toBeDefined();


        var oViewData = fixture.load("bigViewData.json");
        grid._loadFetchedView(oViewData);
        grid.placeAt(testContainerDiv.id);
    });


    it('render a grid with formula in the dom', function (done) {

        fixture.setBase("unit_tests/fixtures");

        var oSchema = fixture.load("modelSchema.json");

        sap.com.alloc.controls.ModelSchema._oSchema['testModel'] = sap.com.alloc.controls.ModelSchema._getIndexedSchema(oSchema);

        grid = new sap.com.alloc.controls.PCMVirtualGrid({
            modelName: 'testModel',
            dataFetchTimeout: 0,
            width: "200px",
            height: "200px",
            allValuesRendered: function (oEvent) {
                var oGrid = oEvent.getSource();
                if (oGrid._allValuesRenderedPassCount === 0) {
                    oGrid._allValuesRenderedPassCount++;

                    var aPivotDimensions = oGrid.getPivotDimensions();
                    expect(aPivotDimensions).toBeDefined();
                    expect(aPivotDimensions.length).toEqual(4);
                    done();
                }
            }

        });
        grid._allValuesRenderedPassCount = 0;


        spyOn(sap.com.alloc.controls.PCMSession, "getGridValues").and.callFake(function (oRequest, fnSuccess) {
            var oVals = fixture.load("formulaGridValues.json");
            fnSuccess(oVals);
        });

        expect(grid).toBeDefined();


        var oViewData = fixture.load("gridLayoutWithFormula.json");
        grid._loadFetchedView(oViewData);
        grid.placeAt(testContainerDiv.id);
    });


    it('render a grid with expansion items in the dom', function (done) {

        fixture.setBase("unit_tests/fixtures");

        var oSchema = fixture.load("modelSchema.json");

        sap.com.alloc.controls.ModelSchema._oSchema['testModel'] = sap.com.alloc.controls.ModelSchema._getIndexedSchema(oSchema);

        spyOn(sap.com.alloc.controls.PCMSession,'getParentChild').and.callFake(function(sModelName, iDimId, iItemId, iContextType, oExpansionContext){
            var oPC = fixture.load("parentChild_" + iDimId + "_" + iItemId + ".json");
            return {
                responseJSON: oPC
            };
        });

        grid = new sap.com.alloc.controls.PCMVirtualGrid({
            modelName: 'testModel',
            dataFetchTimeout: 0,
            width: "500px",
            height: "500px",
            allValuesRendered: function (oEvent) {
                var oGrid = oEvent.getSource();

                if (oGrid._allValuesRenderedPassCount === 0) {

                    // find a specific expansion widget in the vertical axis and click it.
                    var aVertExpansionHeaders = $('#' + oGrid.getId() + ' .pcmgridvaxiscontain .pcmtableheaderinner');
                    expect(aVertExpansionHeaders).toBeDefined();

                    var oHeaderToCollapse = aVertExpansionHeaders[3];
                    var oCollapseWidget = $(oHeaderToCollapse).find("[data-expstate]");
                    expect(oCollapseWidget.length).toEqual(1);
                    expect(oCollapseWidget.html()).toEqual('-');
                    var oEvent;

                    var iRebindPassCount = 0;


                    oGrid._axisRenderedCount = 0;
                    oGrid.attachAfterAxesRendered(function(){


                            switch (this._axisRenderedCount) {
                                case 0:
                                    // test that item has been collapsed
                                    expect(this.getRows().getColumnCount()).toEqual(5);

                                    var oExpandWidget = $('#' + this.getId() + ' .pcmgridvaxiscontain .pcmtableheaderinner [data-expstate="collapsed"]')[0];

                                    var oEvent = document.createEvent("MouseEvents");
                                    oEvent.initEvent("click", true, false);
                                    if (!oExpandWidget.dispatchEvent(oEvent, false, true)) {
                                        throw "Could not dispatch event";
                                    }
                                    break;

                                case 1:
                                    // test that item has been expanded
                                    expect(this.getRows().getColumnCount()).toEqual(15);

                                    // collapse an item in the 2nd level of the vertical header
                                    var oExpandWidget = $('#' + this.getId() + ' .pcmgridvaxiscontain .pcmtableheaderinner [data-expstate="expanded"]')[0];

                                    var oEvent = document.createEvent("MouseEvents");
                                    oEvent.initEvent("click", true, false);
                                    if (!oExpandWidget.dispatchEvent(oEvent, false, true)) {
                                        throw "Could not dispatch event";
                                    }

                                    break;
                                case 2 :
                                    // test that item has been collapsed
                                    expect(this.getRows().getColumnCount()).toEqual(11);
                                    //re-expand the item
                                    // collapse an item in the 2nd level of the vertical header
                                    var oExpandWidget = $('#' + this.getId() + ' .pcmgridvaxiscontain .pcmtableheaderinner [data-expstate="collapsed"]')[0];

                                    var oEvent = document.createEvent("MouseEvents");
                                    oEvent.initEvent("click", true, false);
                                    if (!oExpandWidget.dispatchEvent(oEvent, false, true)) {
                                        throw "Could not dispatch event";
                                    }

                                    break;
                                case 3:
                                    // test that item has been collapsed
                                    expect(this.getRows().getColumnCount()).toEqual(15);
                                    done();
                                default:
                                    break;
                            }

                            this._axisRenderedCount++;

                    },oGrid);


                    expect(oGrid.getRows().getColumnList().length).toEqual(15); // number of row before collapse
                    oEvent = document.createEvent("MouseEvents");
                    oEvent.initEvent("click",true,false)
                    if (!oCollapseWidget[0].dispatchEvent(oEvent)) {
                        throw "Could not dispatch event";
                    }
                }
                oGrid._allValuesRenderedPassCount++;
            }

        });
        grid._allValuesRenderedPassCount = 0;

        spyOn(sap.com.alloc.controls.PCMSession, "getGridValues").and.callFake(function (oRequest, fnSuccess) {
            var oVals = fixture.load("expandingGridValues.json");
            fnSuccess(oVals);
        });

        expect(grid).toBeDefined();


        var oViewData = fixture.load("expandingView.json");
        grid._loadFetchedView(oViewData);
        grid.placeAt(testContainerDiv.id);
    });



    it('test range selection', function (done) {
        fixture.setBase("unit_tests/fixtures");

        var oSchema = fixture.load("modelSchema.json");

        sap.com.alloc.controls.ModelSchema._oSchema['testModel'] = sap.com.alloc.controls.ModelSchema._getIndexedSchema(oSchema);

        grid = new sap.com.alloc.controls.PCMVirtualGrid({
            modelName: 'testModel',
            dataFetchTimeout: 0,
            width: "200px",
            height: "200px",
            cellsSelected : function(oEvent) {
                var oGrid = oEvent.getSource();
                var selectedCellInfo = oGrid.getSelectedCellInfo();
                expect(selectedCellInfo).toBeDefined();
                done();

            },
            allValuesRendered: function (oEvent) {
                var oGrid = oEvent.getSource();
                if (oGrid._allValuesRenderedPassCount === 0) {


                    var aPivotDimensions = oGrid.getPivotDimensions();
                    expect(aPivotDimensions).toBeDefined();
                    expect(aPivotDimensions.length).toEqual(4);

                    // text getting an expansion context
                    var colRowItem = oGrid.getRows().getSubItems()[0];
                    var oContext = oGrid.getExpansionContext(colRowItem);
                    expect(oContext).toBeDefined();

                    // get all the rendered cells
                    var aGridCells = $(oGrid.getDomRef()).find(".pcmgridcell");
                    expect(aGridCells).toBeDefined();
                    expect(aGridCells.length).toBeGreaterThan(2);

                    var fnOrigMouseMove = oGrid._handleRangeSelectionMouseMove;
                    spyOn(sap.com.alloc.controls.PCMVirtualGrid.prototype,"_handleRangeSelectionMouseMove").and.callFake(function(){
                        fnOrigMouseMove.apply(oGrid,arguments);

                        var oDragDiv = $("div.pcmtabledragrect");

                        var oMouseUpEv = new MouseEvent("mouseup",{target: oDragDiv[0], clientX:500, clientY : 500});
                        oDragDiv[0].dispatchEvent(oMouseUpEv);
                    });



                    var fnOrigMouseDown = oGrid._handleRangeSelectionMouseDown;

                    spyOn(sap.com.alloc.controls.PCMVirtualGrid.prototype,"_handleRangeSelectionMouseDown").and.callFake(function(){
                        // make sure mouse down code is called
                        fnOrigMouseDown.apply(oGrid,arguments);




                        // fire a mouse move event
                        var aGridCells = $(oGrid.getDomRef()).find(".pcmgridcell");
                        expect(aGridCells).toBeDefined();
                        expect(aGridCells.length).toBeGreaterThan(2);
                        var oCell = aGridCells[0];
                        var oMouseMoveEvent = new MouseEvent("mousemove",{target: oCell, clientX: 500, clientY : 500});// Don't forget the target!!!!
                        oCell.dispatchEvent(oMouseMoveEvent);
                    });


                    // perform a drag to select a cell
                    //

                    var oCell = aGridCells[0];

                    var oEvent = new MouseEvent("mousedown",{target: oCell, clientX: 0, clientY :0});

                    // TODO:: investigate This line should not be needed!!!
                    oGrid.rebindRangeSelectionEvents();

                    oCell.dispatchEvent(oEvent);




                } else {
                    if (window.console && window.console.log) {
                        window.console.log('painted again' + oGrid._allValuesRenderedPassCount);
                    }
                    // grid has been rotated
                    done();
                }

                oGrid._allValuesRenderedPassCount++;
            }

        });
        grid._allValuesRenderedPassCount = 0;
        grid.setEnableRangeSelect(true);


        spyOn(sap.com.alloc.controls.PCMSession, "getGridValues").and.callFake(function (oRequest, fnSuccess) {
            var oVals = fixture.load("smallGridValues_0.json");
            fnSuccess(oVals);
        });

        expect(grid).toBeDefined();


        var oViewData = fixture.load("smallViewData.json");
        grid._loadFetchedView(oViewData);
        grid.placeAt(testContainerDiv.id);
    });




});