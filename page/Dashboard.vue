<template>
  <div>
    <div class="client-modal" v-if="!!editingClient" @click="endEditClient">
      <form @click.stop>
        <label for="newGroup">Group</label>
        <select id="newGroup" @change="setClientGroup">
          <option
            v-for="(group, i) in clientGroupOptions" :key="group.id" :value="group.id"
            :selected="editingClient.groupId === group.id">
            {{ group.name || `Group ${i + 1}` }}
          </option>
        </select>
        <button type="button" @click.prevent="deleteClient">Delete client</button>
      </form>
    </div>
    <div v-if="data">
      <div class="groups">
        <Group v-for="(group, i) in data.groups" :key="group.id"
               :group="group" :gindex="i" :streams="data.streams" :show-disconnected="showDisconnected"
               v-if="showDisconnected || (group.clients.filter(c=>c.connected).length > 0)"
               v-on="$listeners" v-on:edit-client="startEditClient"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, {PropType} from "vue";
import {Client, Data, Group as IGroup} from "./rpc";

import Group from "./Group.vue";

interface EditClient {
  groupId: string;
  client: Client;
}

export default Vue.extend({
  name: 'Dashboard',
  components: {Group},
  props: {
    data: Object as PropType<Data>,
    playing: Boolean,
    showDisconnected: Boolean,
  },
  data() {
    return {
      editingClient: null as EditClient | null,
    }
  },
  computed: {
    clientGroupOptions() {
      return [...this.data?.groups, <IGroup>{
        id: "",
        name: "New group",
        stream_id: "",
        muted: false,
        clients: [],
      }];
    },
  },
  methods: {
    startEditClient({groupId, client}: { groupId: string, client: Client }): void {
      this.editingClient = <EditClient>{groupId, client};
      console.log(this.editingClient)
    },
    endEditClient(): void {
      this.editingClient = null;
    },
    setClientGroup(e: any): void {
      const clientId = this.editingClient?.client.id;
      const groupId = e.target.value;
      if (groupId === "") {
        this.$emit("update:client-group-new", {clientId, groupId: this.editingClient?.groupId});
        this.endEditClient();
      } else {
        this.$emit("update:client-group", {clientId, groupId});
      }
    },
    deleteClient(): void {
      this.$emit("delete-client", {clientId: this.editingClient?.client.id});
      this.endEditClient();
    },
  },
})
</script>
<style lang="sass" scoped>
@import "./base"

.groups
  display: flex
  flex-direction: column
  gap: $pad
  padding: $pad 0

.client-modal
  position: fixed
  background-color: rgba(0, 0, 0, .45)
  width: 100%
  height: 100%
  top: 0
  left: 0
  z-index: 4

  > form
    background-color: white
    padding: $pad * 2
    margin: 15% auto
    width: 80%

    select, button
      font: inherit
      color: inherit
</style>
