var csInterface = new CSInterface();
loadUniversalJSXLibraries();
loadJSX(csInterface.hostEnvironment.appName + '/host.jsx');
window.Event = new Vue();

const EventList = [
  { listenTo: 'debug.on', sendTo: 'debugModeOn', package: false, },
  { listenTo: 'debug.off', sendTo: 'debugModeOff', package: false, },
  {
    listenTo: 'browser.goto',
    sendTo: 'submitLink',
    package: true,
  },
];

for (var e = 0; e < EventList.length; e++) {
  var event = EventList[e];
  csInterface.addEventListener(event.listenTo, function(evt) {
    if (event.package) {
      if (event.listenTo == 'browser.goto') {
        let link = evt.data;
        if (/^www/.test(link))
          link = 'https:\/\/' + link;
        Event.$emit(event.sendTo, link);
      }
    } else {
      Event.$emit(event.sendTo);
    }
  });
}

// csInterface.addEventListener('debug.on', function (evt) {
//   console.log('Caught debug')
//   Event.$emit('debugModeOn');
// });
// csInterface.addEventListener('debug.off', function (evt) {
//   console.log('Caught debug')
//   Event.$emit('debugModeOff');
// });

// csInterface.addEventListener('browser.goto', function(evt) {
//   var link = evt.data;
//   if (/^www/.test(link))
//     link = 'https:\/\/' + link;
//   Event.$emit('submitLink', link);
// });

// csInterface.addEventListener('browser.favorite', function (evt) {
//   console.log('Caught favorite')
//   Event.$emit('submitLink', this.$root.favorite);
// });

Vue.component('protobrowser', {
  template: `
    <div class="appGrid" @mouseover="wakeApp" @mouseout="sleepApp">
      <event-manager />
      <stylizer />
      <screen>
        <top>
          <notification v-if="hasNotification" :model="notification" />
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
      hasNotification: false,
      notification: {
        data: 'test update',
        details: '',
        notes: [
          "dummy text 1",
          "dummy text 2",
          "dummy text 3"
        ],
        preview: 'https://via.placeholder.com/960x540/434343/b7b7b7',
      }
    }
  },
  computed: {
    debugMode: function() { return this.$root.debugMode },
    isWake: function () { return this.$root.isWake },
  },
  methods: {
    checkDebug() {
      if ((this.isWake) && (this.debugMode)) {
        let selection = this.$root.getCSS('color-selection');
        this.$root.setCSS('color-debug', selection);
      } else {
        this.$root.setCSS('color-debug', 'transparent');
      }
      // if ((this.isWake) && (this.debugMode))
        // return `border: 1.35px solid ${this.$root.getCSS('color-selection')}`;
      // else
        // return `border: 1.35px solid transparent`;
    },
    wakeApp() {
      this.$root.wake();
      this.$root.dispatchEvent('debug.target', this.$root.name);
      if (this.debugMode) {
        // console.log('Attempting to send debug.link')
        this.$root.dispatchEvent('debug.link', 'Can start to read')
      } else {
        // console.log('Not in debug mode')
      }
      this.checkDebug();
      Event.$emit('startStats');
    },
    sleepApp() {
      if (this.wakeOnly) {
        this.wakeApp();
        Event.$emit('clearStats');
      } else {
        this.$root.sleep();
        if (this.debugMode) {
          console.log('Attempting to send debug.unlink')
          this.$root.dispatchEvent('debug.target', '');
          this.$root.dispatchEvent('debug.unlink', 'Can no longer read')
        } else {
          console.log('Not in debug mode')
        }
        Event.$emit('clearStats');
      }
      this.checkDebug();
    },
    showNotification() { if (this.$root.notificationsEnabled) { this.hasNotification = true; } },
    hideNotification() { this.$root.notificationsEnabled = false, this.hasNotification = false; },
    constructUpdate(msg) { this.notification = JSON.parse(msg); },
  },
  mounted() {
    Event.$on('showNotification', this.showNotification);
    Event.$on('hideNotification', this.hideNotification);
    Event.$on('promptUpdate', this.constructUpdate);
  },
})
Vue.component('screen', { template: `<div class="screen"><slot></slot></div>` })
Vue.component('top', { template: `<div class="appTop"><slot></slot></div>` })
Vue.component('bottom', { template: `<div class="appBottom"><slot></slot></div>` })

Vue.component('notification-icon', {
  props: {
    type: String,
  },
  template: `
    <div 
      :class="type == 'cancel' ? 'note-icon' : 'note-icon'" 
      @mouseover="hover = true" 
      @mouseout="hover = false" 
      @click="doAction"
      v-if="type !== 'none'">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
        <path v-if="type == 'cancel'" :style="iconColor" d="M29.24,25,41.12,13.12a3,3,0,0,0-4.24-4.24L25,20.76,13.12,8.88a3,3,0,0,0-4.24,4.24L20.76,25,8.88,36.88a3,3,0,0,0,0,4.24,3,3,0,0,0,4.24,0L25,29.24,36.88,41.12a3,3,0,0,0,4.24,0,3,3,0,0,0,0-4.24Z"/>
        <path v-if="type == 'arrowRight'" :style="iconColor" d="M18,42a3,3,0,0,1-2.12-.88,3,3,0,0,1,0-4.24L27.76,25,15.88,13.12a3,3,0,0,1,4.24-4.24l14,14a3,3,0,0,1,0,4.24l-14,14A3,3,0,0,1,18,42Z"/>
        <path v-if="type == 'arrowUp'" :style="iconColor" d="M39,35a3,3,0,0,1-2.12-.88L25,22.24,13.12,34.12a3,3,0,1,1-4.24-4.24l14-14a3,3,0,0,1,4.24,0l14,14a3,3,0,0,1,0,4.24A3,3,0,0,1,39,35Z"/>
        <path v-if="type == 'arrowLeft'" :style="iconColor" d="M32,42a3,3,0,0,1-2.12-.88l-14-14a3,3,0,0,1,0-4.24l14-14a3,3,0,1,1,4.24,4.24L22.24,25,34.12,36.88a3,3,0,0,1,0,4.24A3,3,0,0,1,32,42Z"/>
        <path v-if="type == 'arrowDown'" :style="iconColor" d="M25,35a3,3,0,0,1-2.12-.88l-14-14a3,3,0,1,1,4.24-4.24L25,27.76,36.88,15.88a3,3,0,1,1,4.24,4.24l-14,14A3,3,0,0,1,25,35Z"/>
        <path v-if="type == 'menu'" :style="iconColor" d="M40,28H10a3,3,0,0,1,0-6H40a3,3,0,0,1,0,6Zm3-16a3,3,0,0,0-3-3H10a3,3,0,0,0,0,6H40A3,3,0,0,0,43,12Zm0,26a3,3,0,0,0-3-3H10a3,3,0,0,0,0,6H40A3,3,0,0,0,43,38Z"/>
        <path v-if="type == 'info'" :style="iconColor" d="M25,4A21,21,0,1,0,46,25,21,21,0,0,0,25,4Zm0,35a3,3,0,1,1,3-3A3,3,0,0,1,25,39Zm1.52-9h-3L21.91,12.37a3.1,3.1,0,1,1,6.18,0Z"/>
        <path v-if="type == 'home'" :style="iconColor" d="M45.79,26.74l-1.56,1.89a.9.9,0,0,1-1.26.12L26.57,15.17a1.66,1.66,0,0,0-2.14,0L8,28.75a.9.9,0,0,1-1.26-.12L5.21,26.74a.89.89,0,0,1,.12-1.27L23.16,10.71a3.68,3.68,0,0,1,4.65,0l6.54,5.42V10.31a.74.74,0,0,1,.74-.74h3.48a.74.74,0,0,1,.74.74V20.2l6.36,5.27A.89.89,0,0,1,45.79,26.74Zm-12.15-2.3-7.38-5.91a1.23,1.23,0,0,0-1.52,0l-7.38,5.91-5.92,4.73a1.2,1.2,0,0,0-.45.95V40.78a.65.65,0,0,0,.65.65H21a.66.66,0,0,0,.66-.65v-7.9a.65.65,0,0,1,.65-.65H28a.66.66,0,0,1,.66.65v7.9a.65.65,0,0,0,.65.65h9.31a.66.66,0,0,0,.66-.65V29.56a1.23,1.23,0,0,0-.46-1Z"/>
      </svg>
    </div>
  `,
  data() {
    return {
      hover: false,
    }
  },
  computed: {
    iconColor: function () { return (this.$root.isWake) ? `fill: ${this.$root.getCSS('color-note-icon')}` : `fill: ${this.$root.getCSS('color-text-disabled')}`; }
  },
  methods: {
    doAction() {
      // console.log(`Clicked on ${this.type}`)
    }
  }
})

Vue.component('notification', {
  props: {
    model: Object,
  },
  template: `
    <div class="global-notification">
      <div class="global-notification-wrap">
        <div v-if="!alt" class="note-display">
          <notification-icon type="info" />
        </div>
        <div v-if="isLarge" class="note-header">
          <a @click="goToHome" v-if="!hasDetails && !nullified" class="global-notification-text">{{model.data}}</a>
          <a @click="goToHome" v-if="hasDetails && !nullified" class="global-notification-text">{{fulldetails}}</a>
          <span v-if="nullified" class="global-notification-text">No updates</span>
        </div>
        <div class="note-cancel" @click="killNote">
          <notification-icon type="cancel" />
        </div>
      </div>
      <ul v-if="hasDetails && !nullified" class="note-list">
          <li v-for="(item,key) in model.notes" v-if="!isSmall" class="note-list-note">{{item}}</li>
          <notification-icon v-for="(item,key) in model.notes" v-if="isSmall" type="info" :title="item" :key="key" />
      </ul>
      <div v-if="hasDetails && !nullified"" class="note-preview">
        <div @click="goToHome" :style="getPreviewStyle(model.preview)"></div>
      </div>
      <div v-if="!nullified"" class="global-notification-wrap">
        <div class="global-notification-toggle" @click="toggleTray" :style="styleTray()">
          <notification-icon :type="hasDetails ? 'none' : 'arrowDown'" />
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      alt: true,
      hasDetails: false,
      msg: 'Hello notification',
    }
  },
  computed: {
    fulldetails: function () { return `${this.$root.rootName} ${this.model.details}` },
    nullified: function () { return !this.$root.needsUpdate },
    isSmall: function () { return this.$root.isSmall },
    isMedium: function () { return this.$root.isMedium },
    isLarge: function () { return this.$root.isLarge },
    anchorLink: function () { return `https://www.inventsable.cc#${this.$root.rootName}`; },
  },
  methods: {
    goToHome() { cep.util.openURLInDefaultBrowser(this.anchorLink); },
    styleTray() {
      if (this.hasDetails) {
        if (this.isLarge) {
          return `width: calc(100% - 3rem);`;
        } else {
          return `width: 100%;`;
        }
      } else {
        return `width: 100%;`;
      }
    },
    getPreviewStyle(img) { return `cursor:pointer; background-image: url(${img}); background-size: contain; background-repeat: norepeat; background-color: ${this.$root.getCSS('color-note-dark')}`; },
    toggleTray(el) { this.hasDetails = !this.hasDetails; },
    killNote() {
      Event.$emit('hideNotification');
      const targ = this.$root.findMenuItemById('notificationsEnabled');
      targ.checked = false;
      this.$root.setContextMenu();
    },
    nullifyUpdate() {
      // this.nullified = true;
    },
  },
  mounted() {
    Event.$on('nullUpdate', this.nullifyUpdate);
  }
})

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
    Event.$on('newAction', this.checkDebugAction);
    Event.$on('keypress', this.checkDebugKeypress);
  },
  computed: {
    isDefault: function () { return this.$root.isDefault },
    mouseX: function () { return this.$root.mouseX; },
    mouseY: function () { return this.$root.mouseY; },
    hasCtrl: function () { return this.$root.Ctrl ? 'Ctrl' : false; },
    hasShift: function () { return this.$root.Shift ? 'Shift' : false; },
    hasAlt: function () { return this.$root.Alt ? 'Alt' : false; },
  },
  methods: {
    checkDebugAction(msg) {
      if (this.$root.debugMode) {
        console.log(`Debug action is ${msg}`)
        this.$root.lastAction = msg;
        this.$root.dispatchEvent('debug.listen', JSON.stringify(this.$root.clone));
      }
    },
    checkDebugKeypress(e) {
      if (this.$root.debugMode) {
        console.log(`Debug keypress is ${e.key}`)
        this.getLastKey(e.key);
        this.$root.dispatchEvent('debug.listen', JSON.stringify(this.$root.clone));
      }
    },
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
        this.$root.panelWidth = document.documentElement.clientWidth;
        this.$root.panelHeight = document.documentElement.clientHeight;
      } else {
        this.$root.panelWidth = document.documentElement.clientWidth;
        this.$root.panelHeight = document.documentElement.clientHeight;
        this.setPanelCSSHeight();
        if (this.$root.debugMode) {
          this.$root.dispatchEvent('debug.listen', JSON.stringify(this.$root.clone));
        }
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
      Event.$emit('newAction', 'Mouse click');
    },
    onMouseUp(e, el) {
      if (this.$root.isDragging) {
        if (((this.lastMouseX <= this.$root.mouseX + 6) && (this.lastMouseX >= this.$root.mouseX - 6)) && ((this.lastMouseY <= this.$root.mouseY + 6) && (this.lastMouseY >= this.$root.mouseY - 6))) {
          this.wasDragging = false;
        } else {
          Event.$emit('newAction', 'Click/Drag');
          this.wasDragging = true;
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
      console.log(`${this.$root.mouseX}, ${this.$root.mouseY}`)
    },
    onClickOutside(e, el) {
      if (!this.wasDragging) {
        Event.$emit('newAction', 'Mouse click');
      }
    },
    onKeyDownOutside(e, el) {
      this.$root.parseModifiers(e);
      this.checkDebugKeypress(e);
      Event.$emit('newAction', 'keyDown');
    },
    onKeyUpOutside(e, el) {
      this.$root.parseModifiers(e);
      this.checkDebugKeypress(e);
      Event.$emit('newAction', 'keyUp');
    },
    getLastKey(msg) {
      if (/Control/.test(msg)) {
        msg = 'Ctrl'
      }
      if (msg !== this.lastKey) {
        if (((this.$root.isDefault) && (msg !== 'Unidentified')) || ((msg == 'Ctrl') || (msg == 'Shift') || (msg == 'Alt'))) {
          if ((msg == 'Ctrl') || (msg == 'Shift') || (msg == 'Alt')) {
            var stack = []
            if (this.hasCtrl)
              stack.push(this.hasCtrl)
            if (this.hasShift)
              stack.push(this.hasShift)
            if (this.hasAlt)
              stack.push(this.hasAlt)

            if (stack.length) {
              console.log('Had length')
              this.lastKey = stack.join('+')
            } else {
              console.log('No length')
              this.lastKey = msg;
            }
          } else {
            this.lastKey = msg;
          }
        } else if (msg == 'Unidentified') {
          this.lastKey = 'Meta'
        } else {
          var stack = []
          if (this.hasCtrl)
            stack.push(this.hasCtrl)
          if (this.hasShift)
            stack.push(this.hasShift)
          if (this.hasAlt)
            stack.push(this.hasAlt)
          stack.push(msg);
          this.lastKey = stack.join('+')
        }
        this.$root.lastKey = this.lastKey;
      }
    },
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
    debugMode: false,
    notificationsEnabled: true,
    needsUpdate: true,
    name: 'none',
    panelWidth: null,
    panelHeight: null,
    mouseX: null,
    mouseY: null,
    lastKey: null,
    lastAction: 'No action',
    isDragging: false,
    winW: null,
    winH: null,
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
        { id: "notificationsEnabled", label: "Show notifications", enabled: true, checkable: true, checked: true, },
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
    rootName: function() {
      const str = csInterface.getSystemPath(SystemPath.EXTENSION);
      return str.substring(str.lastIndexOf('/') + 1, str.length);
    },
    clone: function () {
      let self = this;
      let child = {
        name: self.rootName,
        mouseX: self.mouseX,
        mouseY: self.mouseY,
        panelHeight: document.documentElement.clientHeight,
        panelWidth: document.documentElement.clientWidth,
        lastKey: self.lastKey,
        lastAction: self.lastAction,
      }
      return JSON.stringify(child);
    },
    isSmall: function () { return (this.panelWidth < 120) ? true : false; },
    isMedium: function () { return ((this.panelWidth > 120) && (this.panelWidth < 200)) ? true : false; },
    isLarge: function () { return (this.panelWidth > 200) ? true : false; },
  },
  mounted() {
    var self = this;
    this.name = this.rootName;
    if (navigator.platform.indexOf('Win') > -1) { this.macOS = false; } else if (navigator.platform.indexOf('Mac') > -1) { this.macOS = true; }
    this.readStorage();
    this.setContextMenu();
    Event.$on('debugModeOn', this.startDebug);
    Event.$on('debugModeOff', this.stopDebug);
    Event.$on('updateStorage', self.updateStorage);
    this.getVersion();
    this.tryFetch();
    if (this.notificationsEnabled)
      Event.$emit('showNotification');
    else
      Event.$emit('hideNotification');
  },
  methods: {
    getVersion() {
      const path = csInterface.getSystemPath(SystemPath.EXTENSION);
      const xml = window.cep.fs.readFile(`${path}/CSXS/manifest.xml`);
      const verID = /(\w|\<|\s|\=|\"|\.)*ExtensionBundleVersion\=\"(\d|\.)*(?=\")/;
      let match = xml.data.match(verID);
      if (match.length) {
        const str = match[0].split(' ');
        this.buildNumber = str[(str.length - 1)].replace(/\w*\=\"/, '');
      } else {
        this.buildNumber = 'unknown';
      }
      Event.$emit('console.string', this.buildNumber);
    },
    tryFetch() {
      // if (this.buildNumber !== '1.0.0') {
        fetch('http://inventsable.cc/master.json')
          .then(function (response) {
            return response.json();
          })
          .then(function (myJson) {
            console.log(myJson);
            Event.$emit('checkHTMLData', myJson);
          });
        Event.$emit('console.full', this.buildNumber);
      // } else {
        // console.log('This is in dev context');
        // Event.$emit('nullUpdate');
      // }
    },
    checkHTMLData(result) {
      for (let [key, value] of Object.entries(result.master)) {
        if (key == this.rootName) {
          if (value.version !== this.buildNumber) {
            Event.$emit('promptUpdate', JSON.stringify(value));
            Event.$emit('console.full', JSON.stringify(value))
            this.needsUpdate = true;
          } else {
            this.needsUpdate = false;
          }
        }
      }
    },
    startDebug() {
      this.debugMode = true;
      if (this.isWake)
        this.dispatchEvent('debug.listen', JSON.stringify(this.clone));
    },
    stopDebug() { this.debugMode = false; },  
    dispatchEvent(name, data) {
      var event = new CSEvent(name, 'APPLICATION');
      event.data = data;
      csInterface.dispatchEvent(event);
    },
    readStorage() {
      var storage = window.localStorage;
      if (!storage.length) {
        console.log('There was no pre-existing session data');
        this.updateStorage();
      } else {
        console.log('Detected previous session data');
        this.context.menu = JSON.parse(storage.getItem('contextmenu'));
        this.showSource = JSON.parse(storage.getItem('showSource'));
        this.notificationsEnabled = JSON.parse(storage.getItem('notificationsEnabled'));
        this.rememberContextMenu(storage);
      }
      Event.$emit('rebuildEvents');
    },
    updateStorage() {
      var storage = window.localStorage, self = this;
      storage.setItem('contextmenu', JSON.stringify(self.context.menu));
      storage.setItem('showSource', JSON.stringify(self.showSource));
      // storage.setItem('notificationsEnabled', JSON.stringify(self.notificationsEnabled));
      this.setContextMenuMemory(storage);
      console.log(storage)
    },
    setContextMenuMemory(storage) {
      for (var i = 0; i < this.context.menu.length; i++) {
        var target = this.context.menu[i], name = target.id;
        if (target.checkable) {
          console.log(name);
          console.log(this[name])
          storage.setItem(name, this[name]);
        }
      }
    },
    rememberContextMenu(storage) {
      for (var i = 0; i < this.context.menu.length; i++) {
        var target = this.context.menu[i], name = target.id;
        if (target.checkable) {
          this[name] = JSON.parse(storage.getItem(name));
          this.context.menu[i].checked = this[name];
        }
      }
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
        cep.util.openURLInDefaultBrowser(this.homepage);
      } else if (id == 'test') {
        loadJSX(csInterface.hostEnvironment.appName + '/host.jsx');
      } else if (id == 'notificationsEnabled') {
        this.notificationsEnabled = !this.notificationsEnabled;
        if (this.notificationsEnabled)
          Event.$emit('showNotification');
        else
          Event.$emit('hideNotification');
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
