<template>
  <div class="client" v-bind:class="{disconnected: !client.connected}">
    <div class="head">
      <div class="name">
        <span v-if="!editingName" @dblclick="startEdit">{{ name }}</span>
        <input v-if="editingName" @keyup.enter="endEdit" @blur="editingName = false"
               v-model="newName" ref="name"
               type="text" placeholder="Client name">
      </div>
      <div class="overflow-menu" @click="editClient">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <div class="client-volume">
      <VolumeSlider :volume="client.config.volume"
                    v-on:update:muted="toggleMuted"
                    v-on:update:percent="updateVolume"></VolumeSlider>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, {PropType} from "vue";
import {Client} from "./rpc";
import VolumeSlider from "./VolumeSlider.vue";

export default Vue.extend({
  name: 'Client',
  props: {
    client: Object as PropType<Client>,
    showDisconnected: Boolean,
  },
  data() {
    return {
      editingName: false,
      newName: this.client.config.name,
    };
  },
  components: {VolumeSlider},
  methods: {
    updateVolume(percent: number) {
      this.$emit('update:client-volume', {clientId: this.client.id, percent});
    },
    toggleMuted() {
      this.$emit('update:client-muted', {clientId: this.client.id, muted: !this.client.config.volume.muted});
    },
    startEdit() {
      this.newName = this.client.config.name;
      this.editingName = true;
      this.$nextTick(() => (<HTMLInputElement>this.$refs.name).focus());
    },
    endEdit() {
      this.$emit('update:client-name', {clientId: this.client.id, name: this.newName});
      this.editingName = false;
    },
    editClient() {
      this.$emit('edit-client-req');
    },
  },
  computed: {
    name(): string {
      return this.client.config.name || this.client.host.name || this.client.id;
    },
  },
})
</script>

<style lang="sass" scoped>
@import "./base"

.client
  display: flex
  flex-direction: column
  gap: $pad/2

  .head
    display: flex
    flex-direction: row
    justify-content: center

    .name
      $m: $pad/4
      $c: darken(white, 10)
      flex: 1

      span
        display: block
        cursor: text
        padding: $m 0

      input
        font: inherit
        color: inherit
        margin: 0
        padding: $m 0
        border: none
        width: 100%
        background: $c
        outline: none

  &.disconnected
    .head
      .name
        color: $muted

.overflow-menu
  $width: 28px
  position: relative
  display: flex
  flex-direction: column
  align-self: center
  align-items: center
  min-width: $width

  & > span
    display: block
    width: 4px
    height: 4px
    margin-bottom: 2px
    position: relative
    background: $text
    border-radius: 100%
    z-index: 1

  & > ul
    $size: 300px
    z-index: 2
    position: absolute
    width: $size
    margin: 0
    margin-left: -$size + $width
    list-style-type: none
    display: none
    background: white
    border-radius: 3px
    padding: 0
    box-shadow: $shadow

    & > li
      margin: 0
      padding: $pad/2 $pad
      cursor: pointer

      &:not(:last-child)
        border-bottom: 1px solid #aaa

  & > input
    display: block
    position: absolute
    top: 0
    bottom: 0
    width: 100%
    height: 100%
    cursor: pointer
    opacity: 0
    z-index: 2
    -webkit-touch-callout: none

    &:checked ~ ul
      display: initial
</style>
