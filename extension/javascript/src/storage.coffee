# Awesome New Tab Page
# Copyright 2011-2013 Awesome HQ, LLC & Michael Hart
# All rights reserved.
# http://antp.co http://awesomehq.com

# Chrome Storage functions
  window.storage =
    # keys = string or array of strings; null for all
    # callback = required
    get: (keys, callback) ->
      # Convert string (1 key) to array so that settings can be added
      if typeof keys is "string"
        keys = [ keys ]

      # Add settings
      if keys
        keys.push "settings"

      chrome.storage.local.get keys, (items) ->
        # Process settings and replace
        items.settings_raw = items.settings;
        items.settings = settings.getAll(items.settings);

        if callback
          callback(items)
        else
          console.debug(items)

    # items = object with key/value pairs to update storage with
    # callback = optional
    set: (items, callback) ->
      chrome.storage.local.set items, callback

    # keys = string or array of strings; null for all
    # callback = optional
    remove: (keys, callback) ->
      chrome.storage.local.remove keys, callback

    # callback = optional
    clear: (callback) ->
      console.log "storage.clear"
      chrome.storage.local.clear callback

# Check if there are stored widgets or import from localStorage
  storage.get "tiles", (storage_data) ->
    # If tiles already exist in Chrome Storage, do nothing
    if storage_data.tiles then return

    # If there are tiles in localStorage, set Chrome Storage to localStorage
    if localStorage.getItem("widgets")
      storage.set tiles: JSON.parse(localStorage.getItem("widgets"))
      localStorage.setItem("old_widgets", localStorage.getItem("widgets"))
      localStorage.removeItem("widgets")

# Load widget settings
  window.widgets = JSON.parse(localStorage.getItem("widgets"))

  chrome.management.getAll (data) ->
    window.extensions = data

# START :: Settings
  DEFAULTS =
    lock: true
    buttons: true
    grid: false
    recently_closed: true
    hscroll: true
    scrollbar_bottom: true
    grid_height: null
    grid_width: null

  OLDKEYS =
    grid: "perm-grid"
    buttons: "hideLeftButtons"
    recently_closed: "hideRCTM"
    hscroll: "disableHscroll"
    scrollbar_bottom: "hideScrollbar"
    grid_height: "grid-width"
    grid_width: "grid-height"

  window.settings =
    # obj = object of keys and what to set them to
    # callback = optional
    set: (obj, callback) ->
      storage.get "settings", (callback_data) ->
        storedSettings = callback_data.settings
        for key of obj
          # If key isn't in in DEFAULTS, don't save it
          if typeof DEFAULTS[key] is "undefined"
            if callback then callback(false) else return
          if obj[key] is DEFAULTS[key]
            delete storedSettings[key]
          else
            storedSettings[key] = obj[key]

        storage.set settings: storedSettings, callback

    reset: ->
      storage.remove "settings"

    getAll: (storedSettings) ->
      userSettings = {};
      if not storedSettings
        storedSettings = {};
      for key of DEFAULTS
        if typeof storedSettings[key] isnt "undefined"
          userSettings[key] = storedSettings[key]
        else if OLDKEYS[key] and typeof preference.getNoDefaults(OLDKEYS[key]) is "boolean"
          userSettings[key] = preference.getNoDefaults(OLDKEYS[key])
          # todo: Add preference to Chrome Storage
        else
          userSettings[key] = DEFAULTS[key]
      return userSettings

#
# Old LocalStorage Functions
#

# localStorage shortcuts
  window.store =
    # store.set("key", "obj")
    set: (key, obj) ->
      console.warn "store.set"
      localStorage.setItem key, JSON.stringify(obj)
    # store.get("key")
    get: (key) ->
      console.warn "store.get"
      JSON.parse localStorage.getItem(key)

# START :: Preferences
  LOCALSTORAGE_DEFAULTS = # uses localStorage keys
    "perm-grid": true
    hideScrollbar: false
    disableHscroll: false
    hideLeftButtons: false
    disableHscroll: false
    hideRCTM: false

  window.preference =
    getNoDefaults: (key) ->
      value = localStorage.getItem(key)
      if not value then return null

      yesorno =
        yes: true
        no: false
        true: true
        false: false

      if LOCALSTORAGE_DEFAULTS[key] is yesorno[value] then return null

      # invert a few
      if key is "hideRCTM"
        if typeof yesorno[value] is "boolean" then return !yesorno[value]
      else if key is "disableHscroll"
        if typeof yesorno[value] is "boolean" then return !yesorno[value]
      else if key is "hideScrollbar"
        if typeof yesorno[value] is "boolean" then return !yesorno[value]
      else if key is "hideLeftButtons"
        if typeof yesorno[value] is "boolean" then return !yesorno[value]
      else if key is "perm-grid"
        if typeof yesorno[value] is "boolean" then return !yesorno[value]
      else
        if typeof yesorno[value] is "boolean" then return yesorno[value]

      return null

    get: (key) ->
      console.error "preference.get"
      value = localStorage.getItem(key)
      if not value and LOCALSTORAGE_DEFAULTS[key]
        localStorage.setItem key, LOCALSTORAGE_DEFAULTS[key]
        return LOCALSTORAGE_DEFAULTS[key]
      yesorno =
        yes: true
        no: false
        true: true
        false: false

      if typeof yesorno[value] is "boolean" then return yesorno[value]
      value

    set: (key, value) ->
      console.error "preference.set"
      if value is null
        localStorage.removeItem key
        return
      localStorage.setItem key, value

  # END :: Preferences
