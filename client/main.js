var csInterface = new CSInterface();
loadUniversalJSXLibraries();
loadJSX(csInterface.hostEnvironment.appName + '/host.jsx');
window.Event = new Vue();

csInterface.addEventListener('browser.goto', function(evt) {
  console.log('Caught console')
  console.log(evt);
  var link = evt.data;
  if (/^www/.test(link)) {
    link = 'https:\/\/' + link;
  }
  console.log(link)
  Event.$emit('submitLink', link);
});

csInterface.addEventListener('browser.favorite', function (evt) {
  console.log('Caught favorite')
  // console.log(evt);
  // var link = evt.data;
  // if (/^www/.test(link)) {
  //   link = 'https:\/\/' + link;
  // }
  // console.log(link)
  Event.$emit('submitLink', this.$root.favorite);
});

Vue.component('protobrowser', {
  template: `
    <div class="appGrid" @mouseover="wakeApp" @mouseout="sleepApp">
      <event-manager />
      <stylizer />
      <screen>
        <top>
          <browser-input />
        </top>
        <browser-window />
      </screen>
    </div>
  `,
  data() {
    return {
      wakeOnly: true,
      showConsole: true,
    }
  },
  computed: {
    // showConsole: function () { return this.$root.showConsole },
  },
  methods: {
    wakeApp() {
      this.$root.wake();
      Event.$emit('startStats');
    },
    sleepApp() {
      if (this.wakeOnly) {
        this.wakeApp();
        Event.$emit('clearStats');
      } else {
        this.$root.sleep();
        Event.$emit('clearStats');
      }
    }
  }
})
Vue.component('screen', { template: `<div class="screen"><slot></slot></div>` })
Vue.component('top', { template: `<div class="appTop"><slot></slot></div>` })
Vue.component('bottom', { template: `<div class="appBottom"><slot></slot></div>` })

Vue.component('browser-window', {
  template: `
    <div class="browser-wrap">
      <iframe v-if="!alt"
        :src="masterLink" 
        style="border: 0; width: 96vw; height: 80vh;">
      </iframe>
      <div v-if="alt" class='embed-container'>
        <iframe :src="masterLink" 
          frameborder='0' 
          allowfullscreen>
        </iframe>
      </div>
    </div>
  `,
  data() {
    return {
      alt: true,
    }
  },
  computed: {
    masterLink: function() {
      return this.$root.source;
    },
    winW: function() { return this.$root.winW },
    winH: function () { return this.$root.winH },
  },
  mounted() {
    Event.$on('resizeIframe', this.resizeIframe);
  },
  methods: {
    resizeIframe(obj) {
      var contentwindow = obj.contentWindow.document;
      var width = obj.contentWindow.document.body.scrollWidth;
      // obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
      console.log(contentwindow);
      console.log(width);
    },
  }
})

Vue.component('browser-input', {
  template: `
    <div v-if="show" class="wrap-input">
      <div class="icon-wrap">
        <icon type="user"></icon>
      </div>
      <div class="icon-wrap">
        <icon type="favorite"></icon>
      </div>
      <input 
        :class="getClass()"
        @keyup.enter="submitAddress(msg)"
        v-model="msg" 
        spellcheck="false"
        :placeholder="placeholder""/>
        <div v-if="!alt" class="coord-grid">
          <input 
            :class="getMiniClass()"
            @keyup.enter="submitWidth(winW)"
            v-model="winW" 
            :placeholder="winH""/>
          <input 
            :class="getMiniClass()"
            @keyup.enter="submitHeight(winH)"
            v-model="winH" 
            :placeholder="winW""/>
        </div>
    </div>
  `,
  data() {
    return {
      msg: '',
      alt: true,
      placeholder: 'address',
      winW: 100,
      winH: 100,
    }
  },
  computed: {
    isWake: function() {
      return this.$root.isWake;
    },
    show: function() {
      return this.$root.showSource;
    }
  },
  mounted() {
    // console.log(this.msg)
    this.setSize();
    this.msg = this.$root.source;
    Event.$on('submitLink', this.submitAddress);
    csInterface.addEventListener('browser.goto', this.submitAddress);
  },
  methods: {
    setSize() {
      this.winW = this.$root.winW;
      this.winH = this.$root.winH;
    },
    submitWidth(msg) {
      this.winW = msg;
    },
    submitHeight(msg) {
      this.winH = msg;
    },
    updateMsg(msg) {
      this.msg = msg;
      this.$root.source = msg;
      Event.$emit('windowChange');
    },
    getClass() {
      return this.isWake ? 'input-active' : 'input-idle'
    },
    getMiniClass() {
      return this.isWake ? 'input-active' : 'input-idle'
    },
    submitAddress(msg) {
      if (msg.length) {
        this.updateMsg(msg);
        this.$root.dispatchEvent('browser.load', msg);
      }
    }
  }
})

Vue.component('icon', {
  props: {
    detail: String,
    type: String,
    parent: String,
    which: String,
    canceller: String,
  },
  template: `
    <div 
      :class="type == 'cancel' ? 'icon-cancel' : 'icon'" 
      @mouseover="hover = true" 
      @mouseout="hover = false" 
      @click="testBtn(type)">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
        <title>{{detail}}</title>
        <polygon v-if="type == 'cursor'" :style="iconColor" points="13.29 44.41 25.48 32.37 42.51 32.37 13.29 3 13.29 44.41"/>
        <path v-if="type == 'key'" :style="iconColor" d="M42,46H8.05A4,4,0,0,1,4,42V8.05A4,4,0,0,1,8.05,4H42a4,4,0,0,1,4,4.05V42A4,4,0,0,1,42,46ZM29.57,29.11,32.23,37h3.44L27.17,12H23.28L14.82,37h3.32l2.59-7.84ZM21.4,26.59l2.44-7.21c.48-1.51.89-3,1.25-4.51h.08c.37,1.44.74,2.92,1.29,4.55l2.44,7.17Z"/>
        <path v-if="type == 'user'" :style="iconColor" d="M34,16a9,9,0,1,1-9-9A9,9,0,0,1,34,16Zm8.06,25.74-2.41-8.43A8.72,8.72,0,0,0,31.27,27H18.73a8.72,8.72,0,0,0-8.38,6.31L7.94,41.74A2.55,2.55,0,0,0,10.39,45H39.61A2.55,2.55,0,0,0,42.06,41.74Z"/>
        <path v-if="type == 'listener'" :style="iconColor" d="M19,17H9V7H19ZM31,7V17H41V7Zm0,14a6,6,0,0,1-6,6,6,6,0,0,1-6-6V19H9v8a16,16,0,0,0,32,0V19H31Z"/>
        <path v-if="type == 'sender'" :style="iconColor" d="M34.76,22.47h-6.4a1.18,1.18,0,0,1-1.11-1.56L32.57,5.55a.47.47,0,0,0-.81-.45L15.14,26.27a1.22,1.22,0,0,0,1,2h6.36a1.18,1.18,0,0,1,1.11,1.57L18.33,44.45a.48.48,0,0,0,.82.45L35.7,24.45A1.22,1.22,0,0,0,34.76,22.47Z"/>
        <path v-if="type == 'cancel'"  :style="iconColor" d="M29.24,25,41.12,13.12a3,3,0,0,0-4.24-4.24L25,20.76,13.12,8.88a3,3,0,0,0-4.24,4.24L20.76,25,8.88,36.88a3,3,0,0,0,0,4.24,3,3,0,0,0,4.24,0L25,29.24,36.88,41.12a3,3,0,0,0,4.24,0,3,3,0,0,0,0-4.24Z"/>
        <path v-if="type == 'favorite'"  :style="iconColor" d="M25,43.75,8.38,27.13A11.5,11.5,0,0,1,24.65,10.87l.35.35.35-.35A11.5,11.5,0,0,1,41.62,27.13Z"/>
        <path v-if="type == 'infi'"  :style="iconColor" d="M35.5,34.92a9.93,9.93,0,0,1-7-2.9L25,28.54,21.52,32a9.93,9.93,0,1,1,0-14L25,21.46,28.48,18a9.93,9.93,0,1,1,7,16.94Zm-7-9.92L32,28.48a4.92,4.92,0,1,0,0-7Zm-14-4.92A4.92,4.92,0,1,0,18,28.48L21.46,25,18,21.52A4.91,4.91,0,0,0,14.5,20.08Z"/>
        <path v-if="type == 'download'"  :style="iconColor" d="M40.5,39v5H8.5V39ZM37.58,22.58l-3.53-3.53-7,7V5.5H22V26.09l-7-7-3.53,3.53L24.5,35.66Z"/>
      </svg>
    </div>
  `,
  data() {
    return {
      hover: false,
    }
  },
  computed: {
    iconColor: function () {
      if (this.$root.isWake) {
        if (this.hover) {
          return `fill: ${this.$root.getCSS('color-selection')}`;
        } else {
          return `fill: ${this.$root.getCSS('color-icon')}`;
        }
      } else {
        return `fill: ${this.$root.getCSS('color-text-disabled')}`;
      }
    }
  },
  methods: {
    testBtn(type) {
      if (type == 'user') {
        Event.$emit('submitLink', this.$root.homepage);
      } else if (type == 'favorite') {
        Event.$emit('submitLink', this.$root.favorite);
      }
    }
  }
})

Vue.component('event-manager', {
  template: `
    <div 
      v-keydown-outside="onKeyDownOutside"
      v-keyup-outside="onKeyUpOutside"
      v-mousemove-outside="onMouseMove"
      v-mouseup-outside="onMouseUp"
      v-mousedown-outside="onMouseDown"
      v-click-outside="onClickOutside">
    </div>
  `,
  data() {
    return {
      activeList: [
        { name: 'Ctrl' },
        { name: 'Shift' },
        { name: 'Alt' },
      ],
      Shift: false,
      Ctrl: false,
      Alt: false,
      wasDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
    }
  },
  mounted() {
    var self = this;
    this.activeMods();
    this.handleResize(null);
    window.addEventListener('resize', this.handleResize);
    csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, self.appThemeChanged);
    this.appThemeChanged();
  },
  computed: {
    mouseX: function () { return this.$root.mouseX; },
    mouseY: function () { return this.$root.mouseY; },
  },
  methods: {
    setPanelCSSHeight() {
      this.$root.setCSS('evt-height', `${this.$root.panelHeight - 50}px`);
      this.$root.setCSS('panel-height', `${this.$root.panelHeight - 20}px`);
    },
    appThemeChanged(event) {
      var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
      console.log('Detected theme change')
      Event.$emit('findTheme', skinInfo);
    },
    handleResize(evt) {
      if (this.$root.activeApp == 'AEFT') {
        // console.log(`w: ${this.panelWidth}, h: ${this.panelHeight}`);
        this.$root.panelWidth = document.documentElement.clientWidth;
        this.$root.panelHeight = document.documentElement.clientHeight;
        // this.setPanelCSSHeight();
        // console.log(evt);
      } else {
        this.$root.panelWidth = document.documentElement.clientWidth;
        this.$root.panelHeight = document.documentElement.clientHeight;
        this.setPanelCSSHeight();
      }
    },
    activeMods() {
      var mirror = [], child = {};
      if (this.Ctrl)
        child = { name: 'Ctrl', key: 0 }, mirror.push(child);
      if (this.Shift) {
        child = { name: 'Shift', key: 1 }
        mirror.push(child);
      }
      if (this.Alt) {
        child = { name: 'Alt', key: 2 }
        mirror.push(child);
      }
      this.activeList = mirror;
    },
    clearMods() {
      this.Shift = false, this.Alt = false, this.Ctrl = false;
      this.activeList = [];
    },
    updateMods() {
      this.Ctrl = this.$root.Ctrl, this.Shift = this.$root.Shift, this.Alt = this.$root.Alt;
      this.activeMods();
    },
    onMouseDown(e, el) {
      this.$root.isDragging = true, this.wasDragging = false;
      this.lastMouseX = this.$root.mouseX, this.lastMouseY = this.$root.mouseY;
    },
    onMouseUp(e, el) {
      if (this.$root.isDragging) {
        if (((this.lastMouseX <= this.$root.mouseX + 6) && (this.lastMouseX >= this.$root.mouseX - 6)) && ((this.lastMouseY <= this.$root.mouseY + 6) && (this.lastMouseY >= this.$root.mouseY - 6))) {
          this.wasDragging = false;
        } else {
          Event.$emit('newAction', 'Click/Drag');
          this.wasDragging = true;
          // this.$root.gesture = `Dragged from [${this.lastMouseX}, ${this.lastMouseY}] to [${this.mouseX}, ${this.mouseY}]`
        }
        this.$root.isDragging = false;
      } else {
        // Event.$emit('newAction', 'Drag release');
      }
    },
    onMouseMove(e, el) {
      this.$root.mouseX = e.clientX, this.$root.mouseY = e.clientY;
      if (this.$root.isDragging) {
        Event.$emit('newAction', 'Click-drag')
      } else {
        if (((this.lastMouseX <= this.$root.mouseX + 6) && (this.lastMouseX >= this.$root.mouseX - 6)) && ((this.lastMouseY <= this.$root.mouseY + 6) && (this.lastMouseY >= this.$root.mouseY - 6))) {
          //
        } else {
          Event.$emit('newAction', 'Mouse move');
        }
      }
      this.$root.parseModifiers(e);
    },
    onClickOutside(e, el) {
      if (!this.wasDragging) {
        Event.$emit('newAction', 'Mouse click');
      }
    },
    onKeyDownOutside(e, el) {
      this.$root.parseModifiers(e);
      Event.$emit('keypress', e.key);
      Event.$emit('newAction', 'keyDown');
    },
    onKeyUpOutside(e, el) {
      this.$root.parseModifiers(e);
      Event.$emit('keypress', e.key);
      Event.$emit('newAction', 'keyUp');
    },
  },
  computed: {
    isDefault: function () { return this.$root.isDefault },
  },
})


Vue.component('stylizer', {
  template: `
    <div class="stylizer"></div>
  `,
  data() {
    return {
      cssOrder: ['bg', 'icon', 'border', 'button-hover', 'button-active', 'button-disabled', 'text-active', 'text-default', 'text-disabled', 'input-focus', 'input-idle', 'scrollbar', 'scrollbar-thumb', 'scrollbar-thumb-hover', 'scrollbar-thumb-width', 'scrollbar-thumb-radius'],
      activeStyle: [],
      styleList: {
        ILST: {
          lightest: ['#f0f0f0', '#535353', '#dcdcdc', '#f9f9f9', '#bdbdbd', '#e6e6e6', '#484848', '#484848', '#c6c6c6', '#ffffff', '#ffffff', '#fbfbfb', '#dcdcdc', '#a6a6a6', '20px', '20px'],
          light: ['#b8b8b8', '#404040', '#5f5f5f', '#dcdcdc', '#969696', '#b0b0b0', '#101010', '#101010', '#989898', '#e3e3e3', '#e3e3e3', '#c4c4c4', '#a8a8a8', '#7b7b7b', '20px', '10px'],
          dark: ['#535353', '#c2c2c2', '#5f5f5f', '#4a4a4a', '#404040', '#5a5a5a', '#d8d8d8', '#d5d5d5', '#737373', '#ffffff', '#474747', '#4b4b4b', '#606060', '#747474', '20px', '10px'],
          darkest: ['#323232', '#b7b7b7', '#5f5f5f', '#292929', '#1f1f1f', '#393939', '#1b1b1b', '#a1a1a1', '#525252', '#fcfcfc', '#262626', '#2a2a2a', '#383838', '#525252', '20px', '10px'],
        },
      }
    }
  },
  mounted() {
    Event.$on('findTheme', this.findTheme);
  },
  methods: {
    setGradientTheme() {
      console.log('This is an After Effects theme');
      this.$root.setCSS('color-bg', toHex(appSkin.panelBackgroundColor.color));
      this.$root.setCSS('color-scrollbar', toHex(appSkin.panelBackgroundColor.color, -20));
      this.$root.setCSS('color-scrollbar-thumb', toHex(appSkin.panelBackgroundColor.color));
      this.$root.setCSS('color-scrollbar-thumb-hover', toHex(appSkin.panelBackgroundColor.color, 10));
    },
    detectTheme() {
      let app = this.$root.activeApp, theme = this.$root.activeTheme;
    },
    assignTheme() {
      let app = this.$root.activeApp, theme = this.$root.activeTheme;
      for (var i = 0; i < this.cssOrder.length; i++) {
        let prop = this.cssOrder[i], value = this.styleList[app][theme][i];
        if (!/width|radius/.test(prop)) {
          this.$root.setCSS(`color-${prop}`, value);
        } else {
          this.$root.setCSS(prop, value);
        }
      }
    },
    getCSSName(str) {
      if (/\_/gm.test(str))
        str = str.replace(/\_/gm, '-');
      return str;
    },
    findTheme(appSkin) {
      if (this.$root.activeApp !== 'AEFT') {
        if (appSkin.panelBackgroundColor.color.red > 230)
          this.$root.activeTheme = 'lightest';
        else if (appSkin.panelBackgroundColor.color.red > 170)
          this.$root.activeTheme = 'light';
        else if (appSkin.panelBackgroundColor.color.red > 80)
          this.$root.activeTheme = 'dark';
        else
          this.$root.activeTheme = 'darkest';
        this.$root.updateStorage();
      } else {
        this.setGradientTheme();
      }
      this.assignTheme();
    },
  }
})

var app = new Vue({
  el: '#app',
  data: {
    macOS: false,
    panelWidth: 100,
    panelHeight: 200,
    winW: 200,
    winH: 200,
    persistent: true,
    source: 'https://www.inventsable.cc',
    homepage: 'https://www.inventsable.cc',
    favorite: 'https://illustrator-scripting-guide.readthedocs.io/',
    showSource: true,
    activeApp: csInterface.hostEnvironment.appName,
    activeTheme: 'darkest',
    showConsole: true,
    isWake: false,
    Shift: false,
    Ctrl: false,
    Alt: false,
    context: {
      menu: [
        { id: "refresh", label: "Refresh panel", enabled: true, checkable: false, checked: false, },
        { id: "test", label: "Run test", enabled: true, checkable: false, checked: false, },
        { id: "showSource", label: "Show source", enabled: true, checkable: true, checked: true, },
        { label: "---" },
        { id: "about", label: "Go to Homepage", enabled: true, checkable: false, checked: false, },
      ],
    },
  },
  computed: {
    menuString: function () { return JSON.stringify(this.context); },
    isDefault: function () {
      var result = true;
      if ((this.Shift) | (this.Ctrl) | (this.Alt))
        result = false;
      return result;
    },
  },
  mounted: function () {
    var self = this;
    if (navigator.platform.indexOf('Win') > -1) { this.macOS = false; } else if (navigator.platform.indexOf('Mac') > -1) { this.macOS = true; }
    this.readStorage();
    this.setContextMenu();
  },
  methods: {
    dispatchEvent(name, data) {
      var event = new CSEvent(name, 'APPLICATION');
      event.data = data;
      csInterface.dispatchEvent(event);
    },
    startStorage(storage) {
      // storage.setItem('contextmenu', JSON.stringify(this.context.menu));
    },
    readStorage() {
      var storage = window.localStorage;
      if (!storage.length) {
        console.log('There was no pre-existing session data');
        // this.startStorage();
        this.updateStorage();
      } else {
        console.log('Detected previous session data');
        console.log(storage)
        this.context.menu = JSON.parse(storage.getItem('contextmenu'));
        this.showSource = JSON.parse(storage.getItem('showSource'));
        this.context.menu[2].checked = this.showSource;
      }
      Event.$emit('rebuildEvents');
    },
    updateStorage() {
      var storage = window.localStorage, self = this;
      console.log('Updating local storage')
      storage.setItem('contextmenu', JSON.stringify(self.context.menu));
      storage.setItem('showSource', JSON.stringify(self.showSource));
      console.log(storage)
    },
    setContextMenu() {
      var self = this;
      csInterface.setContextMenuByJSON(self.menuString, self.contextMenuClicked);
    },
    contextMenuClicked(id) {
      var target = this.findMenuItemById(id), parent = this.findMenuItemById(id, true);
      if (id == "refresh") {
        location.reload();
      } else if (id == 'about') {
        console.log('Go to github')
      } else if (id == 'test') {
        loadJSX(csInterface.hostEnvironment.appName + '/host.jsx');
      } else {
        this[id] = !this[id];
        var target = this.findMenuItemById(id);
        target.checked = this[id];
      }
      this.updateStorage();
    },
    findMenuItemById(id, requested = false) {
      var child, parent;
      for (var i = 0; i < this.context.menu.length; i++) {
        for (let [key, value] of Object.entries(this.context.menu[i])) {
          if (key == "menu") {
            parent = this.context.menu[i];
            for (var v = 0; v < value.length; v++) {
              for (let [index, data] of Object.entries(value[v])) {
                if ((index == "id") && (data == id))
                  child = value[v];
              }
            }
          }
          if ((key == "id") && (value == id)) {
            child = this.context.menu[i], parent = 'root';
          }
        }
      }
      return (requested) ? parent : child;
    },
    toggleMenuItemSiblings(parent, exclude, state) {
      if (parent.length) {
        for (var i = 0; i < parent.length; i++) {
          if (parent[i].id !== exclude)
            csInterface.updateContextMenuItem(parent[i].id, true, state);
        }
      }
    },
    parseModifiers(evt) {
      var lastMods = [this.Ctrl, this.Shift, this.Alt]
      if (this.isWake) {
        if (((!this.macOS) && (evt.ctrlKey)) || ((this.macOS) && (evt.metaKey))) {
          this.Ctrl = true;
        } else {
          this.Ctrl = false;
        }
        if (evt.shiftKey)
          this.Shift = true;
        else
          this.Shift = false;
        if (evt.altKey) {
          evt.preventDefault();
          this.Alt = true;
        } else {
          this.Alt = false;
        };
        var thisMods = [this.Ctrl, this.Shift, this.Alt]
        // if (!this.isEqualArray(lastMods, thisMods))
        // console.log(`${thisMods} : ${lastMods}`)
        // Event.$emit('updateModsUI');
      } else {
        // Event.$emit('clearMods');
      }
    },
    flushModifiers() {
      this.Ctrl = false;
      this.Shift = false;
      this.Alt = false;
      Event.$emit('clearMods');
    },
    wake() {
      this.isWake = true;
    },
    sleep() {
      this.isWake = false;
      this.flushModifiers();
    },

    getCSS(prop) {
      return window.getComputedStyle(document.documentElement).getPropertyValue('--' + prop);
    },
    setCSS(prop, data) {
      document.documentElement.style.setProperty('--' + prop, data);
    },
    isEqualArray(array1, array2) {
      array1 = array1.join().split(','), array2 = array2.join().split(',');
      var errors = 0, result;
      for (var i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i])
          errors++;
      }
      if (errors > 0)
        result = false;
      else
        result = true;
      return result;
    },
    removeEmptyValues(keyList, mirror = []) {
      for (var i = 0; i < keyList.length; i++) {
        var targ = keyList[i];
        if ((/\s/.test(targ)) || (targ.length < 6)) {
          // no action
        } else {
          mirror.push(targ);
        }
      }
      return mirror;
    },
    removeDuplicatesInArray(keyList) {
      try {
        var uniq = keyList
          .map((name) => {
            return { count: 1, name: name }
          })
          .reduce((a, b) => {
            a[b.name] = (a[b.name] || 0) + b.count
            return a
          }, {})
        var sorted = Object.keys(uniq).sort((a, b) => uniq[a] < uniq[b])
      } catch (err) {
        sorted = keyList
      } finally {
        return sorted;
      }
    },
  }
});

// Vue.component('test-btn', {
//   props: ['label'],
//   template: `
//     <div
//       class="btn"
//       @click="runTest(label)">
//       {{label}}
//     </div>
//   `,
//   methods: {
//     runTest: function(e) {
//       var targ = this.$root.compi, self = this;
//       try {
//         if (/run/.test(e))
//           csInterface.evalScript(`kickstart()`, self.recolor)
//         else if (/color/.test(e))
//           csInterface.evalScript(`colorcode()`, this.$root.getNames)
//         else if (/reset/.test(e))
//           csInterface.evalScript(`displayColorLabels()`)
//         else
//           csInterface.evalScript(`${e}()`)
//           // console.log('nothing happened');
//       } catch(err) {
//         console.log(err.data);
//       } finally {
//         console.log(`Ran ${e}`);
//       }
//     },
//     recolor: function(e) {
//       var targ = this.$root.compi;
//       csInterface.evalScript(`colorcode()`, this.$root.getNames)
//     }
//   }
// })

// Vue.component('test-toolbar', {
//   template: `
//     <div class="testToolbar">
//       <test-btn label="run"></test-btn>
//       <test-btn label="color"></test-btn>
//       <test-btn label="reset"></test-btn>
//     </div>
//   `,
// })
