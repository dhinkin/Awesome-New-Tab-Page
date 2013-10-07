# localStorage shortcuts
  window.store =
    # store.set("key", "obj")
    set: (key, obj) ->
      console.log "store.set"
      localStorage.setItem key, JSON.stringify(obj)
    # store.get("key")
    get: (key) ->
      console.log "store.get"
      JSON.parse localStorage.getItem(key)

# Check if there are stored widgets
  if localStorage.getItem("widgets") is null

    # If not, use stock widgets
    store.set "widgets", stock_widgets

# Load widget settings
  window.widgets = JSON.parse(localStorage.getItem("widgets"))

  chrome.management.getAll (data) ->
    window.extensions = data

# Save changes to the widgets variable in localStorage & optionally refresh
  window.localStorageSync = (refresh) ->
    localStorage.setItem "widgets", JSON.stringify(widgets)
    $(window).trigger "antp-widgets" if refresh is true

# START :: Preferences
  DEFAULTS = # uses localStorage keys
    "perm-grid": false
    hideScrollbar: false
    hideLeftButtons: false
    disableHscroll: false
    hideRCTM: false

  window.preference =
    get: (key) ->
      value = localStorage.getItem(key)
      if not value and DEFAULTS[key]
        localStorage.setItem key, DEFAULTS[key]
        return DEFAULTS[key]
      yesorno =
        yes: true
        no: false
        true: true
        false: false

      return yesorno[value]  if typeof yesorno[value] is "boolean"
      value

    set: (key, value) ->
      if value is null
        localStorage.removeItem key
        return
      localStorage.setItem key, value

  # END :: Preferences
