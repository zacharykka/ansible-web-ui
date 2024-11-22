<template>
  <div class="hosts">
    <div class="header">
      <div class="header-left">
        <h2>{{ headerSection }}</h2>
        <a-input-search
          v-model:value="searchText"
          placeholder="Search hosts"
          style="width: 300px; margin-left: 16px"
          @search="onSearch"
        />
        <a-button
          v-if="selectedGroupId"
          type="link"
          @click="clearGroupFilter"
          style="margin-left: 8px"
        >
          Clear Filter
        </a-button>
      </div>
      <a-button type="primary" @click="showCreateModal">
        <template #icon><PlusOutlined /></template>
        Add Host
      </a-button>
    </div>

    <a-table
      :dataSource="filteredHosts"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      rowKey="id"
      :scroll="{ x: 1000 }"
    >
      <!-- Host Groups Column -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'hostGroups'">
          <a-space wrap size="small">
            <a-tag
              v-for="group in record.hostGroups"
              :key="group.id"
              :color="getTagColor(group.name)"
              style="cursor: pointer"
              @click="navigateToHostGroup(group.id)"
            >
              {{ group.name }}
            </a-tag>
          </a-space>
        </template>
        <!-- Variables Column -->
        <template v-else-if="column.key === 'variables'">
          <a-button type="link" @click="showVariablesModal(record)">
            View Variables
          </a-button>
        </template>
        <!-- Actions Column -->
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" @click="editHost(record)">
              <template #icon><EditOutlined /></template>
              Edit
            </a-button>
            <a-popconfirm
              title="Are you sure you want to delete this host?"
              @confirm="deleteHost(record)"
              ok-text="Yes"
              cancel-text="No"
            >
              <a-button type="link" danger>
                <template #icon><DeleteOutlined /></template>
                Delete
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- Create/Edit Modal -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalMode === 'create' ? 'Add Host' : 'Edit Host'"
      @ok="handleModalOk"
      :confirmLoading="modalLoading"
      width="720px"
    >
      <a-form
        :model="formState"
        :rules="rules"
        ref="formRef"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
      >
        <a-form-item label="Name" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item label="IP Address" name="ip">
          <a-input v-model:value="formState.ip" />
        </a-form-item>
        <a-form-item label="Host Groups" name="hostGroupIds">
          <a-select
            v-model:value="formState.hostGroupIds"
            mode="multiple"
            style="width: 100%"
            placeholder="Select host groups"
          >
            <a-select-option
              v-for="group in hostGroups"
              :key="group.id"
              :value="group.id"
            >
              {{ group.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Variables" name="variables">
          <a-textarea
            v-model:value="formState.variablesYaml"
            :rows="10"
            placeholder="Enter variables in YAML format"
            :status="yamlError ? 'error' : ''"
          />
          <template #help>
            <span v-if="yamlError" class="yaml-error">{{ yamlError }}</span>
            <span v-else
              >Enter variables in YAML format (e.g., key: value)</span
            >
          </template>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Variables View Modal -->
    <a-modal
      v-model:visible="variablesModalVisible"
      title="Host Variables"
      :footer="null"
      width="720px"
    >
      <a-typography>
        <pre><code>{{ selectedVariablesYaml }}</code></pre>
      </a-typography>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import type { TablePaginationConfig } from "ant-design-vue";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import type { FormInstance } from "ant-design-vue";
import yaml from "js-yaml";
import { useRouter, useRoute } from "vue-router";

defineOptions({
  name: "Hosts",
});

interface HostGroup {
  id: string;
  name: string;
}

interface Host {
  id: string;
  name: string;
  ip: string;
  hostGroups: HostGroup[];
  variables: Record<string, any>;
}

const router = useRouter();
const route = useRoute();

// Table data and loading state
const loading = ref(false);
const hosts = ref<Host[]>([]);
const hostGroups = ref<HostGroup[]>([]);
const searchText = ref("");
const selectedGroupId = ref<string | null>(null);

// Modal state
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formRef = ref<FormInstance>();
const yamlError = ref<string | null>(null);

// Variables modal state
const variablesModalVisible = ref(false);
const selectedVariablesYaml = ref("");

const formState = ref({
  id: "",
  name: "",
  ip: "",
  hostGroupIds: [] as string[],
  variablesYaml: "",
});

const rules = {
  name: [{ required: true, message: "Please input host name" }],
  ip: [{ required: true, message: "Please input IP address" }],
  hostGroupIds: [
    { required: true, message: "Please select at least one host group" },
  ],
};

// Pagination
const pagination = ref<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: (total) => `Total ${total} items`,
});

// Table columns
const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: true,
    align: "center",
  },
  {
    title: "IP Address",
    dataIndex: "ip",
    key: "ip",
    align: "center",
  },
  {
    title: "Host Groups",
    key: "hostGroups",
    align: "center",
  },
  {
    title: "Variables",
    key: "variables",
    align: "center",
  },
  {
    title: "Actions",
    key: "actions",
    width: 200,
    align: "center",
  },
];

// Computed filtered data
const filteredHosts = computed(() => {
  let filtered = hosts.value;

  // Filter by selected group if any
  if (selectedGroupId.value) {
    filtered = filtered.filter((host) =>
      host.hostGroups.some((group) => group.id === selectedGroupId.value)
    );
  }

  // Then apply search filter
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase();
    filtered = filtered.filter(
      (host) =>
        host.name.toLowerCase().includes(searchLower) ||
        host.ip.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
});

// Computed header section
const headerSection = computed(() => {
  if (selectedGroupId.value) {
    const group = hostGroups.value.find((g) => g.id === selectedGroupId.value);
    return group ? `Hosts in group: ${group.name}` : "";
  }
  return "All Hosts";
});

// Methods
const validateYaml = (value: string): boolean => {
  if (!value.trim()) return true;
  try {
    yaml.load(value);
    yamlError.value = null;
    return true;
  } catch (e) {
    yamlError.value = (e as Error).message;
    return false;
  }
};

const showVariablesModal = (record: Host) => {
  selectedVariablesYaml.value = yaml.dump(record.variables);
  variablesModalVisible.value = true;
};

const fetchHostGroups = async () => {
  try {
    // TODO: Implement API call to fetch host groups
    // const response = await api.getHostGroups();
    // hostGroups.value = response.data;

    // Mock data for development
    hostGroups.value = [
      { id: "1", name: "web_servers" },
      { id: "2", name: "db_servers" },
      { id: "3", name: "staging_servers" },
      { id: "4", name: "monitoring_servers" },
      { id: "5", name: "cache_servers" },
    ];
  } catch (error) {
    console.error("Error fetching host groups:", error);
  }
};

const fetchHosts = async () => {
  loading.value = true;
  try {
    // TODO: Implement API call to fetch hosts
    // const response = await api.getHosts();
    // hosts.value = response.data;
    // pagination.value.total = response.total;

    // Mock data for development
    const mockData: Host[] = [
      {
        id: "1",
        name: "web01",
        ip: "192.168.1.101",
        hostGroups: [{ id: "1", name: "web_servers" }],
        variables: {
          ansible_user: "webadmin",
          http_port: 80,
        },
      },
      {
        id: "2",
        name: "db-master",
        ip: "192.168.2.101",
        hostGroups: [{ id: "2", name: "db_servers" }],
        variables: {
          ansible_user: "dbadmin",
          mysql_port: 3306,
        },
      },
      {
        id: "3",
        name: "staging01",
        ip: "192.168.3.101",
        hostGroups: [
          { id: "3", name: "staging_servers" },
          { id: "1", name: "web_servers" },
        ],
        variables: {
          ansible_user: "deploy",
          environment: "staging",
        },
      },
    ];

    hosts.value = mockData;
    pagination.value.total = mockData.length;
  } catch (error) {
    console.error("Error fetching hosts:", error);
  } finally {
    loading.value = false;
  }
};

const onSearch = (value: string) => {
  searchText.value = value;
};

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value = pag;
  fetchHosts();
};

const showCreateModal = () => {
  modalMode.value = "create";
  formState.value = {
    id: "",
    name: "",
    ip: "",
    hostGroupIds: [],
    variablesYaml: "",
  };
  yamlError.value = null;
  modalVisible.value = true;
};

const editHost = (record: Host) => {
  modalMode.value = "edit";
  formState.value = {
    id: record.id,
    name: record.name,
    ip: record.ip,
    hostGroupIds: record.hostGroups.map((g) => g.id),
    variablesYaml: yaml.dump(record.variables),
  };
  yamlError.value = null;
  modalVisible.value = true;
};

const handleModalOk = async () => {
  try {
    await formRef.value?.validate();
    if (!validateYaml(formState.value.variablesYaml)) {
      return;
    }

    modalLoading.value = true;
    const variables = formState.value.variablesYaml
      ? yaml.load(formState.value.variablesYaml)
      : {};

    const hostData = {
      ...formState.value,
      variables,
    };

    if (modalMode.value === "create") {
      // TODO: Implement create API call
      // await api.createHost(hostData);
    } else {
      // TODO: Implement update API call
      // await api.updateHost(hostData);
    }

    modalVisible.value = false;
    fetchHosts();
  } catch (error) {
    console.error("Validation failed:", error);
  } finally {
    modalLoading.value = false;
  }
};

const deleteHost = async (record: Host) => {
  try {
    // TODO: Implement delete API call
    // await api.deleteHost(record.id);
    fetchHosts();
  } catch (error) {
    console.error("Error deleting host:", error);
  }
};

const navigateToHostGroup = (groupId: string) => {
  selectedGroupId.value = groupId;
  router.push(`/inventory/hosts?group=${groupId}`);
};

const clearGroupFilter = () => {
  selectedGroupId.value = null;
  router.push("/inventory/hosts");
};

// Color generation for host group tags
const tagColors = [
  "pink",
  "red",
  "orange",
  "cyan",
  "blue",
  "purple",
  "green",
  "magenta",
  "volcano",
  "geekblue",
  "lime",
  "gold",
];

const getTagColor = (tag: string) => {
  const hashCode = tag.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return tagColors[Math.abs(hashCode) % tagColors.length];
};

// Initial fetch
fetchHostGroups();
fetchHosts();

// Watch for route changes
watch(
  () => route.query.group,
  (newGroupId) => {
    selectedGroupId.value = newGroupId?.toString() || null;
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.hosts {
  padding: 24px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-left {
      display: flex;
      align-items: center;

      h2 {
        margin: 0;
      }
    }
  }

  .yaml-error {
    color: #ff4d4f;
  }
}
</style>
