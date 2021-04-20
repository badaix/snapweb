<template>
  <div v-if="data">
    <div class="clients">
      <div v-for="client in clients" class="client inner" v-bind:class="{muted: isMuted(client)}">
        <div class="head">
          <span class="name">
            {{ client.config.name || client.host.name }}
          </span>
          <div class="shortcuts">
            <button @click="set(client, 0)" :disabled="client.config.latency === 0" type="button" title="Reset to 0 ms">
              0
            </button>
            <button @click="toggleSolo(client)" v-bind:class="{active: isSolo(client)}" type="button"
                    title="Toggle solo">Solo
            </button>
            <button @click="toggleMuted(client)" v-bind:class="{active: isMuted(client)}" type="button"
                    title="Toggle mute">Mute
            </button>
          </div>
        </div>
        <div class="ctrl-latency">
          <button @click="adjust(client, -100)" type="button" title="Remove 100 ms (plays too early)">-100</button>
          <button @click="adjust(client, -50)" type="button" title="Remove 50 ms (plays too early)">-50</button>
          <button @click="adjust(client, -10)" type="button" title="Remove 10 ms (plays too early)">-10</button>
          <input :value="client.config.latency" type="number" min="-10000" max="10000"
                 @change="set(client, parseInt($event.target.value))">
          <button @click="adjust(client, 10)" type="button" title="Add 10 ms (plays too late)">+10</button>
          <button @click="adjust(client, 50)" type="button" title="Add 50 ms (plays too late)">+50</button>
          <button @click="adjust(client, 100)" type="button" title="Add 100 ms (plays too late)">+100</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, {PropType} from "vue";
import {Client, ClientVolume, Data, Volume} from "./rpc";

const kMutedPercent = 0;

export default Vue.extend({
  name: 'Latency',
  components: {},
  props: {
    data: Object as PropType<Data>,
    showDisconnected: Boolean,
  },
  data() {
    return {
      savedVolumes: {} as { [id: string]: Volume },
      solos: new Set<string>(),
    };
  },
  computed: {
    clients() {
      return this.data.groups
        .flatMap(g => g.clients)
        .filter(c => this.showDisconnected || c.connected);
    }
  },
  methods: {
    set(client: Client, latency: number) {
      this.$emit("update:client-latency", {
        clientId: client.id, latency,
      })
    },
    adjust(client: Client, offset: number) {
      this.$emit("update:client-latency", {
        clientId: client.id, latency: client.config.latency + offset,
      })
    },
    isSolo(client: Client) {
      return this.solos.has(client.id);
    },
    toggleSolo(client: Client) {
      const firstToSolo = this.solos.size === 0;
      const hasSolo = this.solos.has(client.id);
      if (hasSolo) this.solos.delete(client.id); else this.solos.add(client.id);
      const noMoreSolos = this.solos.size === 0;
      if (firstToSolo) {
        this.clients.forEach(c => this.savedVolumes[c.id] = c.config.volume);
      }
      const clientVolumes = this.clients.map(c => <ClientVolume>{
        clientId: c.id,
        volume: {
          muted: c.config.volume.muted,
          percent: (noMoreSolos || this.solos.has(c.id)) ? this.savedVolumes[c.id].percent : kMutedPercent,
        },
      });
      this.$emit("update:group-volume", {clientVolumes});
      if (noMoreSolos) {
        this.savedVolumes = {};
      }
    },
    isMuted(client: Client) {
      return client.config.volume.percent === kMutedPercent;
    },
    setMuted(client: Client, muted: boolean) {
      let percent: number
      if (muted) {
        this.savedVolumes[client.id] = client.config.volume;
        percent = kMutedPercent;
      } else {
        percent = this.savedVolumes[client.id].percent;
        delete this.savedVolumes[client.id];
      }
      this.$emit("update:client-volume", {clientId: client.id, percent});
    },
    toggleMuted(client: Client) {
      this.setMuted(client, !this.isMuted(client));
    },
  },
})
</script>
<style lang="sass" scoped>
@import "./base"

.clients
  padding: $pad 0
  display: flex
  flex-direction: column
  gap: $pad/2

  & > .client
    @include box
    display: flex
    flex-direction: column
    gap: $pad/2

    &.muted
      .name
        color: $muted

    > .head
      display: flex
      flex-direction: row
      align-items: center

      > .name
        flex: 1

    & > .ctrl-latency
      display: flex
      flex-direction: row
      justify-content: space-between
      gap: $pad / 2

    input
      padding: 0
      margin: 0
      width: 7ch
      text-align: center
      appearance: none
      border: none
      outline: none
      font: inherit
      color: $theme
      background: none

    button
      box-sizing: border-box
      border-radius: $radius
      font: inherit
      font-size: 1rem
      color: white
      border-width: 2.1px
      border-style: solid
      margin: 0
      padding: $pad / 4 $pad / 2
      cursor: pointer

      @mixin backBorder($c, $hover: true)
        background-color: $c
        border-color: darken($c, 10)

        @if $hover
          &:hover
            background-color: lighten($c, 10)

      @include backBorder($theme)

      &:disabled
        @include backBorder(lightgray, $hover: false)
        cursor: initial

      &.active
        @include backBorder(adjust-hue($theme, -60))
</style>
