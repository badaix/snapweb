<template>
  <div class="group">
    <div class="head">
      <div class="inner">
        <div class="title">
          <div class="name">
            <span v-if="!editingName" @dblclick="startEdit" v-text="name"></span>
            <input v-if="editingName" v-model="newName"
                   @keyup.enter="endEdit"
                   @keyup.esc="editingName = false"
                   @blur="editingName = false" ref="name"
                   type="text" placeholder="Group name">
          </div>
          <select @change="updateStream($event.target.value)">
            <option v-for="s in streams" :value="s.id" :selected="s.id === group.stream_id">
              {{ s.id }}: {{ s.status }}
            </option>
          </select>
        </div>
        <div class="group-volume" v-if="clients.length > 1">
          <VolumeSlider :volume="volume"
                        v-on:update:start="startEditGroupVolume"
                        v-on:update:end="endEditGroupVolume"
                        v-on:update:muted="setGroupMuted"
                        v-on:update:percent="updateGroupVolume"></VolumeSlider>
        </div>
      </div>
    </div>
    <div class="clients inner">
      <Client v-for="c in clients" :key="c.id" :client="c"
              v-on="$listeners"
              v-on:edit-client-req="() => $emit('edit-client', {groupId: group.id, client: c})"></Client>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, {PropType} from "vue";

import {avgClientVolumePercent} from "./util";
import {Client as IClient, ClientVolume, Group, Stream, Volume} from "./rpc";

import Client from "./Client.vue";
import VolumeSlider from "./VolumeSlider.vue";

interface EditingVolume {
  current: number;
  atStart: number;
  clients: { id: string, percent: number }[];
}

export default Vue.extend({
  name: 'Group',
  props: {
    group: Object as PropType<Group>,
    gindex: Number,
    showDisconnected: Boolean,
    streams: Array as PropType<Stream[]>,
  },
  data() {
    return {
      editingName: false,
      newName: this.group.name,
      editingVolume: null as EditingVolume | null,
    };
  },
  components: {Client, VolumeSlider},
  methods: {
    startEdit() {
      this.newName = this.group.name;
      this.editingName = true;
      this.$nextTick(() => (<HTMLInputElement>this.$refs.name).focus());
    },
    endEdit() {
      this.$emit('update:group-name', {groupId: this.group.id, name: this.newName});
      this.editingName = false;
    },
    updateStream(streamId: string) {
      this.$emit('update:group-stream', {groupId: this.group.id, streamId})
    },
    setGroupMuted(muted: boolean) {
      this.$emit('update:group-muted', {groupId: this.group.id, muted});
    },
    startEditGroupVolume() {
      this.editingVolume = <EditingVolume>{
        clients: this.clients.map(c => ({id: c.id, percent: c.config.volume.percent})),
        current: this.avgClientVolumePercent,
        atStart: this.avgClientVolumePercent,
      };
    },
    endEditGroupVolume() {
      this.editingVolume = null;
    },
    updateGroupVolume(percent: number) {
      if (!this.editingVolume) return;
      if (!this.editingVolume.clients.length) return;
      this.editingVolume.current = percent;
      const old = this.editingVolume.atStart,
        delta = percent - old,
        ratio = delta < 0 ? (old - percent) / old : (percent - old) / (100 - old);
      const clientVolumes = this.editingVolume.clients.map(c => <ClientVolume>{
        clientId: c.id,
        volume: {
          muted: false,
          percent: delta < 0 ?
            c.percent * (1 - ratio) :
            c.percent + ratio * (100 - c.percent),
        }
      });
      this.$emit('update:group-volume', {clientVolumes});
    },
  },
  computed: {
    name(): string {
      return !!this.group.name ? this.group.name : `Group ${this.gindex + 1}`;
    },
    clients(): IClient[] {
      return this.group.clients.filter(c => this.showDisconnected || c.connected);
    },
    avgClientVolumePercent(): number {
      return avgClientVolumePercent(this.clients);
    },
    currentPercent(): number {
      return !!this.editingVolume ?
        // Override value during interactive edition.
        this.editingVolume.current :
        this.avgClientVolumePercent;
    },
    volume() {
      return <Volume>{
        percent: this.currentPercent,
        muted: this.group.muted,
      };
    },
  },
});
</script>

<style lang="sass" scoped>
@import "./base"

.group
  @include box
  display: flex
  flex-direction: column

  .inner
    display: flex
    flex-direction: column
    gap: $pad/2

  .head
    background-color: $theme
    color: white

  .title
    display: flex
    flex-direction: row
    gap: $pad
    $m: $pad/4

    .name
      flex: 1

      span
        cursor: text
        display: block
        padding: $m 0

        &:hover
          background-color: lighten($theme, 10)

    input
      font: inherit
      color: inherit
      margin: 0
      padding: $m 0
      border: none
      width: 100%
      background: lighten($theme, 10)
      outline: none

      &::placeholder
        color: opacify(white, .5)

    select
      font: inherit
      color: inherit
      background-color: transparent
      border: none
      max-width: 35%

  .clients
    display: flex
    flex-direction: column
    gap: $pad/2
</style>
