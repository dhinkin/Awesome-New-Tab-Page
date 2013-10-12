/** Awesome New Tab Page
  *   antp.co
  *   Copyright 2011-2013 Michael Hart (h4r7.me)
  * Want to make it even more awesome?
  *   github.antp.co
  *
  * Licensed under GPL v3:
  *   http://www.gnu.org/licenses/gpl-3.0.txt
  *   Further Restrictions:
  *     To make use of or modify the below code in any way:
  *     - You agree to leave this copyright and license notice intact without
  *       modification.
  *     - You agree to mark your modified versions as modified from the original
  *       version.
  *     - You agree not to misrepresent the origin of this material or your
  *       relationship with the authors of this project or the project itself.
  *       You agree not to use the "Awesome New Tab Page" name (or a confusingly
  *       similar name) or logo.
  **/

// Create shortcut on click
function createShortcut(tile) {
  var new_shortcut_id = new_guid();

  storage.get("tiles", function(storage_data) {
    addShortcut(
      new_shortcut_id,
      $(tile).attr("land-top"),
      $(tile).attr("land-left"),
      storage_data);

    setTimeout(function() {
      $("#" + new_shortcut_id).find(".iframe-mask").find("#shortcut-edit").trigger("click");
    }, 100);

    $(tile).removeClass("add-shortcut").removeClass("empty");
  });
}

// Adds shortcut
function addShortcut(widget, top, left, storage_data) {
  widgets = storage_data.tiles;

  widgets[widget] = {
    where: [top,left],
    size: [1,1],
    type: "shortcut",
    isApp: false,
    name: "Google",
    id: widget,
    img: "core.shortcut.blank2.png",
    appLaunchUrl: "https://www.google.com/",
    url: "https://www.google.com/",
    color: palette[Math.floor(Math.random() * palette.length)],
    name_show: true,
    favicon_show: true
  };

  storage.set({tiles: widgets}, function() {
    $(window).trigger("antp-widgets");
  });
}
