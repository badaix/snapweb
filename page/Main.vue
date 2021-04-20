<template>
  <div id="app">
    <div class="navbar">
      <div class="centered">
        <span>
          Snapcast
        </span>
        <nav>
          <a @click.prevent="navigate('/')" href="/" v-bind:class="routeClass('/')">Dashboard</a>
          <a @click.prevent="navigate('/latency')" href="/latency" v-bind:class="routeClass('/latency')">Latency</a>
        </nav>
        <div class="disconnected-toggle">
          <input type="checkbox" title="Show offline clients"
                 id="showDisconnected"
                 v-model="showDisconnected">
          <label for="showDisconnected">Show offline</label>
        </div>
        <img v-if="playImage" :src="playImage" @click="playStop" class="playStop" alt="Play/Stop button">
      </div>
    </div>
    <div class="centered"
         :is="ViewComponent"
         v-bind="props"
         v-on:update:group-name="onUpdateGroupName"
         v-on:update:group-stream="onUpdateGroupStream"
         v-on:update:group-muted="onUpdateGroupMuted"
         v-on:update:group-volume="onUpdateGroupVolume"
         v-on:update:client-volume="onUpdateClientVolume"
         v-on:update:client-muted="onUpdateClientMuted"
         v-on:update:client-name="onUpdateClientName"
         v-on:update:client-latency="onUpdateClientLatency"
         v-on:update:client-group="onUpdateClientGroup"
         v-on:update:client-group-new="onUpdateClientGroupNew"
         v-on:delete-client="onDeleteClient"
    ></div>
  </div>
</template>

<script lang="ts">
import Vue, {Component} from "vue";

import Rpc, {ClientVolume} from "./rpc";
import {SnapStream} from "./snapstream";
import config from "./config";

import ImgPlay from "./play.png";
import ImgStop from "./stop.png";

import Dashboard from "./Dashboard.vue";
import Latency from "./Latency.vue";
import {getConfig, setConfigWatcher} from "./util";

const cfgShowDisconnected = "cfg.showDisconnected";

const routes: { [key: string]: Component } = {
  '/': Dashboard,
  '/latency': Latency,
};

export default Vue.extend({
  name: 'Main',
  data() {
    return {
      currentRoute: window.location.pathname,
      stream: null as SnapStream | null,
      rpc: new Rpc(),
      playing: false,
      showDisconnected: getConfig(cfgShowDisconnected, "false") === "true",
    };
  },
  components: {
    Dashboard,
    Latency,
  },
  created() {
    this.rpc.connect(config.baseUrl);
  },
  methods: {
    navigate(url: string): void {
      this.currentRoute = url;
      window.history.replaceState({}, "", url);
    },
    routeClass(url: string): { active: boolean } {
      return {active: this.currentRoute == url};
    },
    playStop(): void {
      if (this.playing) {
        this.playing = false;
        this.stream?.stop();
      } else {
        this.playing = true;
        this.stream = new SnapStream(config.baseUrl);
      }
    },
    onUpdateGroupName({groupId, name}: { groupId: string, name: string }) {
      this.rpc.setGroupName(groupId, name);
    },
    onUpdateGroupStream({groupId, streamId}: { groupId: string, streamId: string }) {
      this.rpc.setGroupStream(groupId, streamId);
    },
    onUpdateGroupMuted({groupId, muted}: { groupId: string, muted: boolean }) {
      this.rpc.setGroupMuted(groupId, muted);
    },
    onUpdateGroupVolume({clientVolumes}: { clientVolumes: ClientVolume[] }) {
      this.rpc.setClientVolumes(clientVolumes);
    },
    onUpdateClientVolume({clientId, percent}: { clientId: string, percent: number }) {
      this.rpc.setClientVolume(clientId, percent);
    },
    onUpdateClientMuted({clientId, muted}: { clientId: string, muted: boolean }) {
      this.rpc.setClientMuted(clientId, muted);
    },
    onUpdateClientName({clientId, name}: { clientId: string, name: string }) {
      this.rpc.setClientName(clientId, name);
    },
    onUpdateClientLatency({clientId, latency}: { clientId: string, latency: number }) {
      this.rpc.setClientLatency(clientId, latency);
    },
    onUpdateClientGroup({clientId, groupId}: { clientId: string, groupId: string }) {
      this.rpc.setClientGroup(clientId, groupId);
    },
    onUpdateClientGroupNew({clientId, groupId}: { clientId: string, groupId: string }) {
      this.rpc.moveClientToNewGroup(clientId, groupId);
    },
    onDeleteClient({clientId}: { clientId: string }) {
      this.rpc.deleteClient(clientId);
    }
  },
  watch: {
    showDisconnected: setConfigWatcher(cfgShowDisconnected),
    'rpc.data': {
      handler(_newData, _oldData) {
      },
      deep: true,
    }
  },
  computed: {
    ViewComponent(): Component {
      return routes[this.currentRoute] || Dashboard;
    },
    props(): Object {
      return {
        data: this.rpc.data,
        playing: this.playing,
        showDisconnected: this.showDisconnected,
      }
    },
    playImage(): any {
      if (!this.rpc.data) return null;
      return this.playing ? ImgStop : ImgPlay;
    },
  },
})
</script>

<style lang="sass">
@import "./base"

body
  font-family: 'Arial', sans-serif
  font-size: 20px
  color: $text
  background-color: $bg
  margin: 0
  padding: 0
</style>

<style lang="sass" scoped>
@import "./base"

.centered
  max-width: 600px
  margin: 0 auto

nav
  display: flex
  flex-direction: row

  a
    $col: white
    font: inherit
    color: inherit
    text-decoration: none
    border: 2.1px solid $col
    padding: $pad/3 $pad/2

    &:first-child
      border-end-end-radius: 0
      border-start-end-radius: 0

    &:last-child
      border-end-start-radius: 0
      border-start-start-radius: 0

    &.active
      color: $theme
      background-color: $col

.disconnected-toggle
  $s: 18px
  $m: 2px

  input[type=checkbox]
    position: absolute
    opacity: 0

    & + label
      position: relative
      cursor: pointer
      padding: 0 0 0 $s * 1.5
      line-height: $s
      font-size: 0.9rem
      vertical-align: middle

    & + label::before, & + label::after
      position: absolute
      display: block
      content: ''
      top: 0
      left: 0
      width: $s
      height: $s

    & + label::before
      content: ' '
      border: 2.1px solid white

    & + label::after
      display: none
      width: $s - ($m * 2)
      height: $s - ($m * 2)
      margin: $m * 2
      background-color: white

    &:checked + label::after
      display: block

.navbar
  position: sticky
  top: 0
  overflow: hidden
  background-color: $theme
  padding: $pad/2 $pad
  color: white
  z-index: 3

  span
    font-size: 1.1em

  > .centered
    display: flex
    flex-direction: row
    align-items: center
    justify-content: space-between

  .playStop
    $s: 40px
    width: $s
    height: $s
</style>
