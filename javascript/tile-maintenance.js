/*
 *
 *  Awesome New Tab Page
 *    http://antp.co/
 *    Copyright 2011+ Michael Hart (http://h4r7.me/).
 *
 *  Want to make it even more awesome?
 *    https://github.com/michaelhart/Awesome-New-Tab-Page/
 *
 *  Tile Maintenance
 *    JavaScript essential for "stitching" together, creating, updating,
 *    and removing various tile types.
 *
 *  Licensed under GPL v3:
 *    http://www.gnu.org/licenses/gpl-3.0.txt
 *
 */

var gradient = ", -webkit-gradient( linear, right bottom, left top, color-stop(1, rgba(255, 255, 255, .04)), color-stop(0, rgba(255, 255, 255, 0.35)) )";
var amazon_regex = new RegExp("amazon\.(com|cn|co\.uk|at|fr|de|it|co\.jp|es)[/]{0,1}[\?]{0,1}");

var resize_template = '<div class="resize-tile"> \
    <div class="resize-tile-top"></div> \
    <div class="resize-tile-bottom"></div> \
    <div class="resize-tile-left"></div> \
    <div class="resize-tile-right"></div> \
  </div>';

function stitch(type, id, name, url, img, height, width, top, left, poke) {
  widgets = JSON.parse(localStorage.getItem("widgets"));

  if(!type || !height || !width) {
      return console.error("stitch", "Type, height, or width missing.");
  }

  if(!url) {
    if( typeof(stock_widgets[id]) !== "undefined" ) {
      url = stock_widgets[id].appLaunchUrl;
    } else {
      delete widgets[id];
      localStorageSync(false);
      return console.error("stitch", "Not stock & no URL. Widget '"+id+"' deleted.");
    }
  }

  if(type === "app" || type === "shortcut") {
    if ( typeof(widgets[id]) !== "object" ) {
      return console.error("stitch", id, "Tile storage discrepancy; tile not in storage.")
    }

    if ( widgets[id].color ) {
      var background_color = widgets[id].color;
    } else {
      var new_background_color = palette[Math.floor(Math.random() * palette.length)];
      var background_color = new_background_color;
      widgets[id].color = new_background_color;
      localStorageSync(false);
    }

    var name_show = (widgets[id].name_show === false) ? "opacity-0" : "";

    if ( widgets[id].shortcut_background_transparent
      && widgets[id].shortcut_background_transparent === true) {
      background_color = "transparent";
      use_gradient = "";
    } else {
      use_gradient = gradient;
    }

    if(type === "app"
      && typeof(stock_widgets[id]) !== "undefined"
      && typeof(stock_widgets[id].img) !== "undefined" ) {
      img = stock_widgets[id].img;
    }
  }

  if ( height > 3 ) { height = 3; console.warn("stitch", "Max height exceeded. Defaulted to max.") }
  if ( width  > 3 ) { width  = 3; console.warn("stitch", "Max width exceeded. Defaulted to max." ) }

  if ( type === "widget-drawer" ) {
    if ( typeof(poke) === "object"
      && poke[0] && poke[0] === 2
      && poke[1] && poke[1] === true
      && poke[2] && typeof(poke[2]) === "object" ) {
      var resize_enabled = true;
    }
  }

  if ( type === "iframe" || type === "app" || type === "shortcut" ) {

    if ( typeof(widgets[id]) === "object" ) {
      if ( widgets[id].resize !== "true" ) {
        if ( type === "app" || type === "shortcut" ) {
          widgets[id].resize = true;
          widgets[id].v2 =  {
                              "min_width" : 1,
                              "max_width" : 2,
                              "min_height": 1,
                              "max_height": 2
                            }
          localStorageSync(false);
        }
      }
    }

    if ( widgets[id].resize === true ) {
      var resize_enabled = true;

      var poke = {};
      poke.min_height = widgets[id].min_height;
      poke.max_height = widgets[id].max_height;
      poke.min_width  = widgets[id].min_width ;
      poke.max_width  = widgets[id].max_width ;

    }
  }

  if(img === "id") {
    img = "chrome://extension-icon/" + id + "/128/0";
  }

  if (type === "app-drawer") {
    // Use Amazon country TLD preference
    if( url && (url).match(amazon_regex) ) {
      if ( localStorage.getItem("amazon-locale") !== null
        && localStorage.getItem("amazon-locale") !== ""
        && typeof(localStorage.getItem("amazon-locale")) !== "undefined") {
        url = "http://www." + localStorage.getItem("amazon-locale") + "/?tag=sntp-20";
      } else {
        url = "http://www.amazon.com/?tag=sntp-20";
      }
    }
  }

  if ( typeof(name) !== "string" ) {
      console.warn("stitch", "Name not string for widget '"+id+"'.");
      name = "";
  } else {
    name = $.trim( name.replace(/\[antp\]/i, "") );
  }

  if ( type !== "app"
    && type !== "shortcut"
    && type !== "widget-drawer"
    && type !== "app-drawer"
    && type !== "iframe" ) {
    return console.error("stitch", "Invalid type.", type);
  }

  var stitch = $("<div></div>")
    .attr("id", id)
    .addClass("widget")
    .attr({
      "tile-width" : width,
      "tile-height": height,
      "tile-init-top"   : top,
      "tile-init-left"  : left
    })

  if ( type === "app")          $(stitch).addClass("app");
  if ( type === "shortcut" )    $(stitch).addClass("app shortcut");
  if ( type === "widget-drawer"
    || type === "app-drawer" )  $(stitch).addClass("app drawer-app ui-2 ilb");

  if ( type === "app" || type === "shortcut" || type === "iframe" )
    $(stitch).css("position", "absolute")

  if ( type === "app" || type === "shortcut" ) {
    $(stitch).css({
      "background-image": "url("+encodeURI(img)+")"+use_gradient,
      "background-color": background_color
    })
  }

  if ( type === "widget-drawer" || type === "app-drawer" ) {


    $(stitch).attr({"app-source": "from-drawer"});

    if        ( type === "widget-drawer" ) {
      $(stitch).attr({
        "tile-widget"     : "true",
        "tile-widget-src" : url,
        "tile-stock"      : id,
        "tile-poke"       : poke[0]
      });
    } else if ( type === "app-drawer" ) {
      $(stitch).attr({
        "tile-width" : 1,
        "tile-height": 1
      });
    }
  }

  if ( type === "app" || type === "shortcut" ) {
    $(stitch).append(
      $("<div></div>").addClass("app-name "+name_show).html(name),
      $("<a/>").attr("href", url)
    );
  }

  if (type === "iframe") {
    $(stitch).append(
      $("<iframe></iframe>").attr({
        "src"         : url,
        "scrolling"   : "no",
        "frameborder" : "0",
        "align"       : "center",
        "height"      : "100%",
        "width"       : "100%"
      })
    );
  }

  if ( type === "app-drawer" || type === "widget-drawer" ) {
    $(stitch).append(
      $("<img>").addClass("ui-2 ilb")
        .attr("src", img)
    );

    $(stitch).append(
      $("<div></div").addClass("ui-2 drawer-app-name ilb")
        .html(name)
    );

    if ( type === "app-drawer") {
      $(stitch).find("img,.drawer-app-name")
        .addClass("url")
        .attr("url", url)
    }

    if (type === "widget-drawer") {
      $(stitch).append(
        $("<div></div").addClass("ui-2 drawer-app-wh ilb")
          .html(width + " Wide, " + height + " Tall")
      );

      if ( resize_enabled === true ) {
        $(stitch).attr({
          "resize"      : poke[1],
          "min_height"  : poke[2].min_height,
          "max_height"  : poke[2].max_height,
          "min_width"   : poke[2].min_width,
          "max_width"   : poke[2].max_width,
        });
      }
    }

    if ( $.inArray(id, ["webstore", "amazon", "fandango", "facebook", "twitter", "mgmiemnjjchgkmgbeljfocdjjnpjnmcg"]) === -1 ) {
      $(stitch).append(
        $("<div></div").addClass("ui-2 drawer-app-uninstall ilb")
          .html("Uninstall")
      );
    }
  }

  if ( type === "app" || type === "shortcut"  || type === "iframe" ) {
    $(stitch).append(
      $("<div></div").addClass("iframe-mask hidden")
    );

    $(stitch).find(".iframe-mask").append(
      $("<div></div").attr("id", "delete")
    );

    if ( type === "app" || type === "shortcut" ) {
      $(stitch).find(".iframe-mask").append(
        $("<div></div").attr("id", "shortcut-edit"),
        resize_template
      );
    }

    if ( type === "iframe" ) {
      if ( resize_enabled === true ) {
        $(stitch).find(".iframe-mask").append(
          resize_template
        );
      }
    }

  }

  return stitch;
}

// Renders widgets from localStorage
function placeWidgets() {
  if(JSON.parse(localStorage.getItem("widgets")) === null) {
    localStorage.setItem("widgets", JSON.stringify( stock_widgets ));
  }

  widgets = JSON.parse(localStorage.getItem("widgets"));

  $.each(widgets, function(id, widget) {
    if(widget.type === "iframe" && widget.size[0] <= 3 && widget.size[1] <= 3) {

      $(stitch(
        /*  Type: str [app, widget, app-drawer, widget-drawer]*/  "iframe",
        /*  Ext. ID: str [mgmiemnjjchgkmgbeljfocdjjnpjnmcg]   */  id,
        /*  Ext. Name: str [Awesome New Tab Page]             */  widget.name,
        /*  URL: str, can be iframe or app url                */  widget.path,
        /*  Img: str, full path or [id]                       */  "id",
        /*  Height: int [1, 2, 3]                             */  widget.size[0],
        /*  Width: int [1, 2, 3]                              */  widget.size[1],
        /*  Top: int                                          */  widget.where[0],
        /*  Left: int                                         */  widget.where[1],
        /*  Poke: int                                         */  null
      )).appendTo("#widget-holder");
    }

    if(widget.isApp === true) {
      img = false;
      if( id === ("webstore") ) {
        img = "app.webstore.png";
      }

      $(stitch(
        /*  Type: str [app, widget, app-drawer, widget-drawer]*/  "app",
        /*  Ext. ID: str [mgmiemnjjchgkmgbeljfocdjjnpjnmcg]   */  id,
        /*  Ext. Name: str [Awesome New Tab Page]             */  widget.name,
        /*  URL: str, can be iframe or app url                */  widget.url ,
        /*  Img: str, full path or [id]                       */  ( img || "id" ),
        /*  Height: int [1, 2, 3]                             */  widget.size[0],
        /*  Width: int [1, 2, 3]                              */  widget.size[1],
        /*  Top: int                                          */  widget.where[0],
        /*  Left: int                                         */  widget.where[1],
        /*  Poke: int                                         */  null
      )).appendTo("#widget-holder");
    }

    if(widget.type === "shortcut") {

      $(stitch(
        /*  Type: str [app, widget, app-drawer, widget-drawer]*/  "shortcut",
        /*  Ext. ID: str [mgmiemnjjchgkmgbeljfocdjjnpjnmcg]   */  id,
        /*  Ext. Name: str [Awesome New Tab Page]             */  widget.name,
        /*  URL: str, can be iframe or app url                */  widget.appLaunchUrl,
        /*  Img: str, full path or [id]                       */  widget.img,
        /*  Height: int [1, 2, 3]                             */  widget.size[0],
        /*  Width: int [1, 2, 3]                              */  widget.size[1],
        /*  Top: int                                          */  widget.where[0],
        /*  Left: int                                         */  widget.where[1],
        /*  Poke: int                                         */  null
      )).appendTo("#widget-holder");
    }

  });

  setStuff();
}

// Adds shortcut to localStorage
function addShortcut(widget, top, left) {
  try {
    widgets = JSON.parse(localStorage.getItem("widgets"));

    widgets[widget] = {
      where: [top,left],
      size: [1,1],
      type: "shortcut",
      isApp: false,
      name: "Google",
      id: widget,
      img: "core.shortcut.blank2.png",
      appLaunchUrl: "http://www.google.com/"
    };

    localStorageSync(false);
  }
  catch (err) {
    _e(6);
  }
}

// Updates shortcut placement
function updateWidget(obj) {
  if ( typeof(obj.id) !== "string" ) return;

  widgets = JSON.parse(localStorage.getItem("widgets"));
  if ( !widgets[obj.id] ) return;

  if ( obj.top !== undefined )
    widgets[obj.id].where[0] = obj.top;
  if ( obj.left !== undefined )
    widgets[obj.id].where[1] = obj.left;


  if ( obj.height !== undefined ) {
    if ( $.inArray( parseInt(obj.height), [1, 2, 3] ) !== -1 ) {
      widgets[obj.id].size[0] = parseInt(obj.height);
    }
  }
  if (  obj.width !== undefined ) {
    if ( $.inArray( parseInt(obj.width ), [1, 2, 3] ) !== -1 ) {
      widgets[obj.id].size[1] = parseInt(obj.width );
    }
  }

  localStorageSync();
}

// Add widget to localStorage then refresh
function addWidget(obj) {

  widgets = JSON.parse(localStorage.getItem("widgets"));

  if ( typeof(obj.height) === "undefined" || parseInt(obj.height) === "NaN" )
    obj.height = 1;
  else
    if      ( parseInt(obj.height) > TILE_MAX_HEIGHT )
      obj.height = TILE_MAX_HEIGHT;
    else if ( parseInt(obj.height) < TILE_MIN_HEIGHT )
      obj.height = TILE_MIN_HEIGHT;
    else
      obj.height = parseInt(obj.height);

  if ( typeof(obj.width ) === "undefined" || parseInt(obj.width ) === "NaN" )
    obj.width  = 1;
  else
    if      ( parseInt(obj.width ) > TILE_MAX_WIDTH )
      obj.width  = TILE_MAX_WIDTH;
    else if ( parseInt(obj.width ) < TILE_MIN_WIDTH )
      obj.width  = TILE_MIN_WIDTH;
    else
      obj.width  = parseInt(obj.width );

  if ( typeof(obj.stock) === "object"
    && obj.is_widget === true ) {
    obj.widget_src = obj.stock.path;
    obj.widget_name = obj.stock.name;
    obj.widget = obj.stock.id;
  } else {
    obj.new_ext_data = extensions.filter(function (ext) { return ext.id === obj.widget; })[0];
    if(obj.is_widget === false) {
      obj.widget_img = "chrome://extension-icon/"+obj.new_ext_data.id+"/128/0";
      obj.appLaunchUrl = obj.new_ext_data.appLaunchUrl;
    } else {
      obj.widget_src = "chrome-extension://"+obj.new_ext_data.id+"/" + obj.src.replace(/\s+/g, '');
    }
    obj.widget_name = obj.new_ext_data.name;
  }

  if ( obj.widget === "mgmiemnjjchgkmgbeljfocdjjnpjnmcg") {
    obj.widget = new_guid();
  }

  if(obj.is_widget === false) {
    widgets[obj.widget] = {
      where: [obj.top,obj.left],
      size: [1,1],
      isApp: true,
      name: obj.widget_name,
      id: obj.widget,
      img: obj.widget_img,
      url: obj.appLaunchUrl,
      appLaunchUrl: obj.appLaunchUrl,
      "resize": true,
      "v2"    : {
        "min_width" : 1,
        "max_width" : 2,
        "min_height": 1,
        "max_height": 2
      }
    };
  }

  if(obj.is_widget === true) {

    if ( obj.poke && parseInt(obj.poke) !== "NaN" ) {
      obj.poke = parseInt(obj.poke);
    } else {
      obj.poke = 1;
    }

    widgets[obj.widget] = {
      "where" : [obj.top,obj.left],
      "size"  : [obj.height,obj.width],
      "type"  : "iframe",
      "isApp" : false,
      "name"  : obj.widget_name,
      "id"    : obj.widget,
      "img"   : obj.widget_img,
      "path"  : obj.widget_src,
      "poke"  : obj.poke,
      "resize": ( obj.resize === "true" ) ? true : false,
      "v2"    : {
        "min_width" : obj.min_width,
        "max_width" : obj.max_width,
        "min_height": obj.min_height,
        "max_height": obj.max_height
      }
    };
  }

  localStorageSync(true);
}

// Delete widget; no refresh
function removeWidget(widget) {
  try {
    delete widgets[widget];

    localStorageSync(false);
  }
  catch (err) {
    _e(4);
  }
}