/*
 * mapCircleHandler.js
 * Root namespace module
 * Example 	of initialization
 MapCircleHandler.initModule(map);
 */

var MapCircleHandler = function () {
    var start,              end,                     balloon,
        map,		        initModule,              Init,
        chooseRadius,       drawCircle,              left_vertex,
        right_vertex,		top_vertex,				 bottom_vertex,
        center_vertex,      renderDomElements,		 circle,
        createDomElements,	getRadius,				 getCenter,
        bindVertex,			removeButton,			 removeCallback,
        removeCircle,       initEvents,              setBaloonData,
        polyline,           activateEditMode,        getMap;

    /*------------ Private methods--------------------------------*/
    /**
     * Begin Private method /chooseRadius/
     *
     * @example
     * geoObject.editor.events.add( 'vertexdraw', chooseRadius );
     *
     * @param {Object}
     * Event object of Yandex Maps Api 2.0
     * http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Event.xml
     *
     * Action    :
     * Change balloon data: distanse from start point to current mouse position and draw circle with curr radius
     * @returns {none}
     * @throws {none}
     */
    chooseRadius = function ( event ) {
        //debugger;
        if (!start){
            return
        }
        var projection = map.options.get('projection'),
        //Event has only get('globalPixels') method because we stay at editing mode
        //Convert global pixels coords in geo coords
            cursorCoord = projection.fromGlobalPixels(event.get('globalPixels'), map.getZoom());
        //set new calculated distance to ballooon
        var curr_radius = parseInt(ymaps.coordSystem.geo.getDistance(start, cursorCoord));
        start && balloon.setData({content: "Расстояние: " + curr_radius + "м"});
        if (circle) {
            circle.geometry.setRadius(curr_radius);
        }else{
            drawCircle(start, curr_radius, true);
        }
    };
    /**
     * Begin Private method /setBaloonData/
     *
     * @example
     * setBaloonData(event);
     *
     * @param {Object event}
     * Event object of mousemove
     *
     * Action    :
     * Change balloon data: distanse from start point to current mouse position;
     * @returns {none}
     * @throws {none}
     */
    setBaloonData = function (e) {
        var pane = $(circle.geometry.getMap().panes.get('controls').getElement()),
            offset = pane.offset(),
            globalPixels = map.panes.get('controls').fromClientPixels([e.pageX - offset.left, e.pageY - offset.top]),
            geo = map.options.get('projection').fromGlobalPixels(globalPixels, map.getZoom()),
            new_radius = Math.round(ymaps.coordSystem.geo.getDistance(circle.geometry.getCoordinates(), geo));
        !balloon.isOpen() && balloon.open(circle.geometry.getCoordinates());
        balloon.setData({content: "Расстояние: " + new_radius + "м"});
    };
    /**
     * Begin Private method /drawCircle/
     *
     * @example
     * drawCircle([23.43535, 57.234345], 100);
     *
     * @param center - center in geo coordinates, where will be draw a circle
     * @param radius - float radius of the circle in metres
     * Action    :
     * Create circle geometry object of circle, init all events and add it to map;
     * http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/geometry.Circle.xml
     * @returns {none}
     * @throws {none}
     */
    drawCircle = function ( center, radius, withoutEvents) {
        circle && map.geoObjects.remove(circle);
        circle && removeCircle();
        console.log(center, radius);
        circle = new ymaps.Circle([
            center,
            radius
        ], {
            balloonContent: "Радиус круга " + parseInt(radius) + "м"
        }, {
            draggable: false,
            fillColor: "#d03636",
            strokeColor: "#ff0000",
            strokeOpacity: 0.8,
            fillOpacity: 0.1,
            strokeWidth: 1
        });
        map.geoObjects.add(circle);
        if (!withoutEvents) {
            map.events.add('actionbegin', function () {
                $(map.panes.get('controls').getElement()).find('.point').hide();
            });
            map.events.add('actionend', function () {
                renderDomElements();
                $(map.panes.get('controls').getElement()).find('.point').show();
            });

            center_vertex || createDomElements();
            renderDomElements();

            removeButton = removeButton || new ymaps.control.Button({
                    data: {
                        content: 'Удалить область',
                        title: 'Нажмите, чтобы удалить область.'
                    },
                    options: {
                        selectOnClick: false,
                        maxWidth: [130, 130, 130]
                    }
                });
            removeButton.events.add('click', function () {
                removeCircle();
                removeCallback && removeCallback();
            });
            map.controls.add(removeButton, {top: 5, right: 5});
        };
    };

    /**
     * Begin Private method /removeCircle/
     *
     * @example
     * removeCircle();
     *
     * Action    :
     * Delete circle from map, delete DOM elements for edit, clear all needed circle variables;
     * @returns {none}
     * @throws {none}
     */
    removeCircle = function () {
        map && $(map.panes.get('controls').getElement()).find('.point').remove();
        center_vertex = null;
        map.geoObjects.remove(circle);
        map.controls.remove(removeButton);
        removeButton = null;
        circle = null;
        start = null;
    };


    /**
     * Begin Private method /createDomElements/
     *
     * @example
     * createDomElements()
     *
     * Action    :
     * Create, stylize, bind events and append DOM elements to circle pane.
     * @returns {none}
     * @throws {none}
     */
    createDomElements = function () {
        var $pane = $(map.panes.get('controls').getElement()),
            css = {
                position: 'absolute',
                width: 10,
                height: 10,
                marginLeft: -6,
                marginTop: -6,
                backgroundColor: 'white',
                border: '1px solid black',
                cursor: 'pointer',
                zIndex: 999
            };
        left_vertex = (left_vertex || $('<div class="point"></div>'))
            .css(css).
            appendTo($pane);
        bindVertex(left_vertex, $pane);

        right_vertex = (right_vertex || $('<div class="point"></div>'))
            .css(css).
            appendTo($pane);
        bindVertex(right_vertex, $pane);

        top_vertex = (top_vertex || $('<div class="point"></div>'))
            .css(css).
            appendTo($pane);
        bindVertex(top_vertex, $pane);

        bottom_vertex = (bottom_vertex || $('<div class="point"></div>'))
            .css(css).
            appendTo($pane);
        bindVertex(bottom_vertex, $pane);

        center_vertex = (center_vertex || $('<div class="point"></div>'))
            .css(css)
            .css('border-radius', 90)
            .appendTo($pane)
            .bind('mousedown', function(e) {
                $(document).bind('mousemove', function( e ) {
                    e.stopPropagation();
                    var offset = $pane.offset(),
                        globalPixels = map.panes.get('controls').fromClientPixels([e.pageX - offset.left, e.pageY - offset.top]),
                        geo = map.options.get('projection').fromGlobalPixels(globalPixels, map.getZoom());
                    circle.geometry.setCoordinates(geo);
                    renderDomElements();
                }).
                bind('mouseup', function(e) {
                    $(this).unbind('mousemove mouseup');
                    document.ondragstart = document.body.onselectstart = null;
                    $(this).css('backgroundColor', 'white');
                });
            });
    };

    /**
     * Begin Private method /bindVertex/
     *
     * @example
     * bindVertex(vertex, pane)
     *
     * @param vertex - DOM element to bind mousemove event
     * @param pane - pane of geometry
     * Action    :
     * Bind events to drag vertex and resize circle
     * @returns {none}
     * @throws {none}
     */
    bindVertex = function (vertex, pane) {
        vertex.bind('mouseenter', function(e) {
            $(this).css('backgroundColor', 'yellow')
        }).
        bind('mouseleave', function(e) {
            $(this).css('backgroundColor', 'white')
        }).
        bind('mousedown', function(e) {
            $(document).bind('mousemove', function( e ) {
                e.stopPropagation();
                var offset = pane.offset(),
                    globalPixels = map.panes.get('controls').fromClientPixels([e.pageX - offset.left, e.pageY - offset.top]),
                    geo = map.options.get('projection').fromGlobalPixels(globalPixels, map.getZoom()),
                    new_radius = ymaps.coordSystem.geo.getDistance(circle.geometry.getCoordinates(), geo);
                circle.geometry.setRadius(new_radius);
                renderDomElements(circle);
                setBaloonData(e);
            }).
            bind('mouseup', function(e) {
                balloon.close();
                $(this).unbind('mousemove mouseup');
                document.ondragstart = document.body.onselectstart = null;
                $(this).css('backgroundColor', 'white');
            });
            document.ondragstart = document.body.onselectstart = function() {return false};
            $(this).css('backgroundColor', 'yellow');
        });
    };




    /**
     * Begin Private method /renderDomElements/
     *
     * @example
     * renderDomElements()
     *
     * Action    :
     * Redraw DOM elements after circle drag or resize, or after map drag
     * @returns {none}
     * @throws {none}
     */
    renderDomElements = function () {
        setTimeout(function () {
            var pane = map.panes.get('controls');
            if (circle == null) {
                return;
            }
            var pixelGeometry = circle.geometry.getPixelGeometry(),
                centerGlobal = pixelGeometry.getCoordinates(),
                centerClient = pane.toClientPixels(centerGlobal),
                boundsGlobal = pixelGeometry.getBounds(),

                vertexGlobalLeft = [boundsGlobal[0][0], centerGlobal[1]],
                vertexClientLeft = pane.toClientPixels(vertexGlobalLeft),

                vertexGlobalRight = [boundsGlobal[1][0], centerGlobal[1]],
                vertexClientRight = pane.toClientPixels(vertexGlobalRight),

                vertexGlobalTop = [centerGlobal[0], boundsGlobal[0][1]],
                vertexClientTop = pane.toClientPixels(vertexGlobalTop),

                vertexGlobalBottom = [centerGlobal[0], boundsGlobal[1][1]],
                vertexClientBottom = pane.toClientPixels(vertexGlobalBottom);

            left_vertex.css({left: vertexClientLeft[0]+'px', top: vertexClientLeft[1]+'px'});
            right_vertex.css({left: vertexClientRight[0]+'px', top: vertexClientRight[1]+'px'});
            top_vertex.css({left: vertexClientTop[0]+'px', top: vertexClientTop[1]+'px'});
            bottom_vertex.css({left: vertexClientBottom[0]+'px', top: vertexClientBottom[1]+'px'});
            center_vertex.css({left: centerClient[0]+'px', top: centerClient[1]+'px'});
        }, 0);

    };

    activateEditMode = function (e) {

        (circle && !e) && removeCircle();
        if(polyline){
            polyline.editor.startEditing();
            polyline.editor.startDrawing();
        }

    };

    /**
     * Init object
     * Contains init functions
     */
    Init = {
        /**
         * Begin Private method /events/
         *
         * @example
         * Init.events();
         *
         * Action    :
         * Initialize map events to add ability to switch app to drawing mode
         * @returns {none}
         * @throws {none}
         */
        events: function () {
            Init.makePolyline();
            //map.events.once('click', activateEditMode);
            activateEditMode();
        },
        makePolyline: function () {
            //polyline for start drawing circle
            polyline = new ymaps.GeoObject({
                geometry: {type: "LineString"}
            });

            //add polyline.editor event (fire before when add new vertex)
            polyline.editor.events.add('vertexdraw', chooseRadius);

            //balloon for display distance
            balloon = new ymaps.Balloon(map);
            balloon.options.setParent(map.options);
            balloon.setData({content: "Расстояние: 0м"});

            //add polyline.editor vertexadd event (fire after vertex add)
            polyline.editor.events.add('vertexadd', function ( e ) {
                console.log(e);
                (!e.get('vertexIndex') && circle) && removeCircle();
                // debugger;
                if (!start) {
                    start = polyline.geometry.get(0);
                    balloon.open(start);
                }else if (!end){
                    end = polyline.geometry.get(1);
                    map.geoObjects.remove(polyline);
                    var radius = ymaps.coordSystem.geo.getDistance(start, end);
                    //draw circle
                    console.log(start)
                    drawCircle(start, radius);
                    balloon.close();
                    start = null;
                    end = null;
                    polyline.editor.stopEditing();
                    polyline.editor.stopDrawing();
                    Init.makePolyline();
                    activateEditMode(true);
                }
                e.stopImmediatePropagation();
                e.preventDefault();
            });

            map.geoObjects.add(polyline);
        },
        controls: function () {
            var searchControl = map.controls.get('searchControl');
            searchControl.events.add('resultselect', function (e) {
                var pos = searchControl.state.get('results')[e.get('index')].geometry.getCoordinates();
                map.panTo(pos);
                window.mark = searchControl.state.get('results')[e.get('index')];
                window.mark.options.set('preset', 'twirl#redIcon');
                circle && removeCircle();
                setTimeout(function() {
                    var zoom = 40;
                    var iter = 18 - map.getZoom();
                    for (var i = 0; i <= iter; i++) {
                        zoom *= 2;
                    }
                    drawCircle(pos, zoom);
                }, 100);
            });
        }
    };

    /**
     * Begin Public method /getRadius/
     *
     * @example
     * drawCircle([23.43535, 57.234345], 100);
     *
     * @returns Radius of current circle in metres
     * @throws {Error} If the circle is not added.
     */
    getRadius = function () {
        if ( !circle ) {
            //  throw new  Error("Error: Circle is not defined");
        } else
            return circle.geometry.getRadius();
    };
    /**
     * Begin Public method /getCenter/
     *
     * @example
     * mapCircleHandler.getCenter()
     *
     * @returns Center of current circle in geocoordinates.
     * @throws {Error} If the circle is not added.
     */
    getCenter = function () {
        if ( !circle ) {
            //   throw new  Error("Error: Circle is not defined");
        }
        else
            return circle.geometry.getCoordinates();
    };

    /**
     * Begin Public method /getMap/
     *
     * @example
     * mapCircleHandler.getMap()
     */
    getMap = function () {
        return map;
    };

    /**
     * Begin Public method /initModule/
     *
     * @example
     * MapCircleHandler.initModule( myYandexMap );
     *
     * Purpose   :
     * Adding the ability to draw maps
     *
     * @param {Object}
     * A main yandex map object (api 2.0)
     * map (example: map = new ymaps.Map(...)).
     *
     * Action    :
     * Initialize event handlers related t draw circles
     * @returns {none}
     * @throws {none}
     */
    initModule = function ( ymap, opts ) {
        removeCallback = opts ? opts.onMapDelete : null;
        map = ymap;
        if(opts.initEvents !== false && opts.initEvents !== 0) {
            Init.events();
        }
        if(opts && opts.initSearch) {
            Init.controls();
        }
    };


    getRemoveButton = function ( ) {
        return removeButton;
    }

    return { initModule: initModule, getRadius: getRadius, getMap: getMap, getCenter: getCenter, drawCircle:drawCircle, map:map, getRemoveButton:getRemoveButton, initEvents: initEvents  };
};