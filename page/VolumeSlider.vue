<template>
  <div class="volume-wrap">
    <img :src="imgSource" @click="toggleMuted" class="mute">
    <input type="range" min="0" max="100"
           :value="volume.percent"
           @input="updateVolume"
           @touchstart="touchStart"
           @touchend="touchEnd"
           @pointerdown="touchStart"
           @pointerup="touchEnd"
           class="slider">
  </div>
</template>

<script lang="ts">
import Vue, {PropType} from "vue";
import {Volume} from "./rpc";

import ImgSpeaker from "./speaker_icon.png";
import ImgMute from "./mute_icon.png";

export default Vue.extend({
  name: 'VolumeSlider',
  props: {
    volume: {
      type: Object as PropType<Volume>,
    },
  },
  methods: {
    toggleMuted() {
      this.$emit('update:muted', !this.volume.muted);
    },
    touchStart(_e: TouchEvent) {
      this.$emit('update:start');
    },
    touchEnd(_e: TouchEvent) {
      this.$emit('update:end');
    },
    updateVolume(event: InputEvent) {
      const value = (<HTMLInputElement>event.target).valueAsNumber;
      const percent = Math.max(0, Math.min(100, value));
      this.$emit('update:percent', percent);
    },
  },
  computed: {
    imgSource() {
      return this.volume.muted ? ImgMute : ImgSpeaker;
    },
  },
})
</script>

<style lang="sass" scoped>
@import "./base"

.volume-wrap
  display: flex
  flex-direction: row
  align-items: center
  padding-right: 6px
  gap: $pad

  .mute
    $size: 24px
    justify-self: center
    width: $size
    height: $size

    //appearance: none
    //background-color: darken($bg, 5)
    //color: #111
    //border: none
    //border-radius: 100%
    //width: $size
    //height: $size

  .slider
    flex: 1
    $size: 12px

    -webkit-appearance: none
    background: #dbdbdb
    outline: none
    transition: opacity .2s
    -webkit-transition: .2s
    height: 2px

    &::-moz-range-track
      padding: 6px
      background-color: transparent
      border: none

    @mixin thumb
      height: $size
      width: $size
      cursor: pointer
      border-radius: 50%
      background: $accent
      border: none

    &::-webkit-slider-thumb
      @include thumb
      -webkit-appearance: none
      appearance: none

    &::-moz-range-thumb
      @include thumb
</style>
