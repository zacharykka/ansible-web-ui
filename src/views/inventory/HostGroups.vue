<template>
  <div class="host-groups">
    <div class="header">
      <a-input-search
        v-model:value="searchText"
        placeholder="Search host groups"
        style="width: 300px"
        @search="onSearch"
      />
      <a-button type="primary" @click="showCreateModal">
        <template #icon><PlusOutlined /></template>
        New Host Group
      </a-button>
    </div>

    <a-table
      :dataSource="filteredHostGroups"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      rowKey="id"
      :scroll="{ x: 1000 }"
    >
      <!-- Tags Column -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'tags'">
          <a-space wrap size="small">
            <a-tag
              v-for="tag in record.tags"
              :key="tag"
              :color="getTagColor(tag)"
            >
              {{ tag }}
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
            <a-button type="link" @click="showHosts(record)">
              <template #icon><TeamOutlined /></template>
              Hosts
            </a-button>
            <a-button type="link" @click="editHostGroup(record)">
              <template #icon><EditOutlined /></template>
              Edit
            </a-button>
            <a-popconfirm
              title="Are you sure you want to delete this host group?"
              @confirm="deleteHostGroup(record)"
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
      :title="modalMode === 'create' ? 'Create Host Group' : 'Edit Host Group'"
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
        <a-form-item label="Tags" name="tags">
          <a-select
            v-model:value="formState.tags"
            mode="tags"
            style="width: 100%"
            placeholder="Add tags"
          />
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
      title="Group Variables"
      :footer="null"
      width="720px"
    >
      <a-typography>
        <pre><code>{{ selectedVariablesYaml }}</code></pre>
      </a-typography>
    </a-modal>

    <!-- Hosts View Modal -->
    <a-modal
      v-model:visible="hostsModalVisible"
      :title="`Hosts - ${selectedHostGroup?.name || ''}`"
      :footer="null"
      width="800px"
    >
      <a-table
        :dataSource="selectedHostGroup?.hosts || []"
        :columns="hostColumns"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'online' ? 'success' : 'error'">
              {{ record.status }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import type { TablePaginationConfig } from "ant-design-vue";
import {
  PlusOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import type { FormInstance } from "ant-design-vue";
import yaml from "js-yaml";

defineOptions({
  name: "HostGroups",
});

interface HostGroup {
  id: string;
  name: string;
  tags: string[];
  variables: Record<string, any>;
  hosts: Array<{
    id: string;
    name: string;
    ip: string;
    status: "online" | "offline";
  }>;
}

// Table data and loading state
const loading = ref(false);
const hostGroups = ref<HostGroup[]>([]);
const searchText = ref("");

// Variables modal state
const variablesModalVisible = ref(false);
const selectedVariablesYaml = ref("");

// Hosts modal state
const hostsModalVisible = ref(false);
const selectedHostGroup = ref<HostGroup | null>(null);
// Host table columns
const hostColumns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    align: "center",
  },
  {
    title: "IP Address",
    dataIndex: "ip",
    key: "ip",
    align: "center",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    align: "center",
  },
];

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
    title: "Tags",
    dataIndex: "tags",
    key: "tags",
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

// Modal
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formRef = ref<FormInstance>();
const yamlError = ref<string | null>(null);

const formState = ref({
  id: "",
  name: "",
  tags: [] as string[],
  variablesYaml: "",
});

const rules = {
  name: [{ required: true, message: "Please input host group name" }],
};

// Computed filtered data
const filteredHostGroups = computed(() => {
  if (!searchText.value) return hostGroups.value;
  return hostGroups.value.filter((group) =>
    group.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
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

const showVariablesModal = (record: HostGroup) => {
  selectedVariablesYaml.value = yaml.dump(record.variables);
  variablesModalVisible.value = true;
};

const fetchHostGroups = async () => {
  loading.value = true;
  try {
    // TODO: Implement API call to fetch host groups
    // const response = await api.getHostGroups();
    // hostGroups.value = response.data;
    // pagination.value.total = response.total;
    // Mock data for development
    const mockData: HostGroup[] = [
      {
        id: "1",
        name: "web_servers",
        tags: ["nginx", "production"],
        variables: {
          ansible_user: "webadmin",
          http_port: 80,
          https_port: 443,
          nginx_worker_processes: "auto",
          deploy_path: "/var/www/html",
        },
        hosts: [
          { id: "w1", name: "web01", ip: "192.168.1.101", status: "online" },
          { id: "w2", name: "web02", ip: "192.168.1.102", status: "online" },
          { id: "w3", name: "web03", ip: "192.168.1.103", status: "offline" },
        ],
      },
      {
        id: "2",
        name: "db_servers",
        tags: ["mysql", "production", "backup"],
        variables: {
          ansible_user: "dbadmin",
          mysql_port: 3306,
          backup_retention_days: 7,
          mysql_max_connections: 1000,
          innodb_buffer_pool_size: "4G",
        },
        hosts: [
          {
            id: "db1",
            name: "db-master",
            ip: "192.168.2.101",
            status: "online",
          },
          {
            id: "db2",
            name: "db-slave1",
            ip: "192.168.2.102",
            status: "online",
          },
          {
            id: "db3",
            name: "db-slave2",
            ip: "192.168.2.103",
            status: "online",
          },
        ],
      },
      {
        id: "3",
        name: "staging_servers",
        tags: ["staging", "testing"],
        variables: {
          ansible_user: "deploy",
          environment: "staging",
          debug_mode: true,
          log_level: "debug",
          max_memory: "2G",
        },
        hosts: [
          {
            id: "s1",
            name: "staging01",
            ip: "192.168.3.101",
            status: "online",
          },
          {
            id: "s2",
            name: "staging02",
            ip: "192.168.3.102",
            status: "offline",
          },
        ],
      },
      {
        id: "4",
        name: "monitoring_servers",
        tags: ["prometheus", "grafana", "monitoring"],
        variables: {
          ansible_user: "monitor",
          prometheus_retention: "15d",
          grafana_port: 3000,
          alert_email: "alerts@example.com",
          metrics_retention_days: 30,
        },
        hosts: [
          {
            id: "m1",
            name: "monitor01",
            ip: "192.168.4.101",
            status: "online",
          },
          {
            id: "m2",
            name: "monitor02",
            ip: "192.168.4.102",
            status: "online",
          },
        ],
      },
      {
        id: "5",
        name: "cache_servers",
        tags: ["redis", "cache"],
        variables: {
          ansible_user: "redis",
          redis_port: 6379,
          maxmemory: "8gb",
          maxmemory_policy: "allkeys-lru",
          redis_timeout: 300,
        },
        hosts: [
          { id: "c1", name: "cache01", ip: "192.168.5.101", status: "online" },
          { id: "c2", name: "cache02", ip: "192.168.5.102", status: "online" },
          { id: "c3", name: "cache03", ip: "192.168.5.103", status: "online" },
        ],
      },
    ];

    hostGroups.value = mockData;
    pagination.value.total = mockData.length;
  } catch (error) {
    console.error("Error fetching host groups:", error);
  } finally {
    loading.value = false;
  }
};

const onSearch = (value: string) => {
  searchText.value = value;
};

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value = pag;
  fetchHostGroups();
};

const showCreateModal = () => {
  modalMode.value = "create";
  formState.value = { id: "", name: "", tags: [], variablesYaml: "" };
  yamlError.value = null;
  modalVisible.value = true;
};

const editHostGroup = (record: HostGroup) => {
  modalMode.value = "edit";
  formState.value = {
    id: record.id,
    name: record.name,
    tags: record.tags,
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

    const hostGroup = {
      ...formState.value,
      variables,
    };

    if (modalMode.value === "create") {
      // TODO: Implement create API call
      // await api.createHostGroup(hostGroup);
    } else {
      // TODO: Implement update API call
      // await api.updateHostGroup(hostGroup);
    }

    modalVisible.value = false;
    fetchHostGroups();
  } catch (error) {
    console.error("Validation failed:", error);
  } finally {
    modalLoading.value = false;
  }
};

const deleteHostGroup = async (record: HostGroup) => {
  try {
    // TODO: Implement delete API call
    // await api.deleteHostGroup(record.id);
    fetchHostGroups();
  } catch (error) {
    console.error("Error deleting host group:", error);
  }
};

const showHosts = (record: HostGroup) => {
  // TODO: Implement navigation to hosts view
  // router.push(`/inventory/host-groups/${record.id}/hosts`);
  selectedHostGroup.value = record;
  hostsModalVisible.value = true;
};

// Add color generation function
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
  // Use the string's characters to generate a consistent color for the same tag
  const hashCode = tag.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return tagColors[Math.abs(hashCode) % tagColors.length];
};

// Initial fetch
fetchHostGroups();
</script>

<style scoped lang="scss">
.host-groups {
  padding: 24px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .yaml-error {
    color: #ff4d4f;
  }
}
</style>
