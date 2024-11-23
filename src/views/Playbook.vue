<template>
  <!-- 
     To complete the implementation, you'll need to:
     1. Implement the actual API calls in the TODO sections
     2. Add task history integration when running playbooks
     3. Style the YAML content display in the view modal
     4. Add any specific business logic required for your use case
  -->
  <div class="playbook-container">
    <div class="header">
      <a-input-search
        v-model:value="searchText"
        placeholder="Search playbooks"
        style="width: 240px"
        @search="onSearch"
      />
      <a-button type="primary" @click="showCreateModal">
        <template #icon><PlusOutlined /></template>
        New Playbook
      </a-button>
    </div>

    <a-table
      :dataSource="filteredPlaybooks"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      rowKey="id"
      :scroll="{ x: 1000 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button type="primary" size="small" @click="showRunModal(record)">
              <template #icon><PlayCircleOutlined /></template>
              Run
            </a-button>
            <a-button type="link" size="small" @click="showPlaybook(record)">
              <template #icon><EyeOutlined /></template>
              Show
            </a-button>
            <a-button type="link" size="small" @click="editPlaybook(record)">
              <template #icon><EditOutlined /></template>
              Edit
            </a-button>
            <a-popconfirm
              title="Are you sure you want to delete this playbook?"
              @confirm="deletePlaybook(record)"
            >
              <a-button type="link" size="small" danger>
                <template #icon><DeleteOutlined /></template>
                Delete
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- Run Playbook Modal -->
    <a-modal
      v-model:visible="runModalVisible"
      title="Run Playbook"
      @ok="handleRunPlaybook"
      :confirmLoading="runModalLoading"
    >
      <a-form :model="runForm" layout="vertical">
        <a-form-item
          label="Host Group"
          name="hostGroup"
          :rules="[{ required: true, message: 'Please select a host group' }]"
        >
          <a-select
            v-model:value="runForm.hostGroup"
            placeholder="Select host group"
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
      </a-form>
    </a-modal>

    <!-- Create/Edit Playbook Modal -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalMode === 'create' ? 'New Playbook' : 'Edit Playbook'"
      @ok="handleModalOk"
      :confirmLoading="modalLoading"
      width="700px"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
        <a-form-item label="Name" name="name">
          <a-input
            v-model:value="formState.name"
            placeholder="Enter playbook name"
          />
        </a-form-item>
        <a-form-item label="Description" name="description">
          <a-textarea
            v-model:value="formState.description"
            placeholder="Enter playbook description"
            :rows="2"
          />
        </a-form-item>
        <a-form-item label="Content" name="content">
          <a-textarea
            v-model:value="formState.content"
            placeholder="Enter playbook content in YAML format"
            :rows="12"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- View Playbook Modal -->
    <a-modal
      v-model:visible="viewModalVisible"
      title="View Playbook"
      :footer="null"
      width="700px"
    >
      <a-descriptions bordered>
        <a-descriptions-item label="Name" :span="3">
          {{ selectedPlaybook?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="Description" :span="3">
          {{ selectedPlaybook?.description }}
        </a-descriptions-item>
      </a-descriptions>
      <a-divider />
      <a-typography>
        <pre><code>{{ selectedPlaybook?.content }}</code></pre>
      </a-typography>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { TablePaginationConfig } from "ant-design-vue";
import {
  PlusOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import type { FormInstance } from "ant-design-vue";

defineOptions({
  name: "Playbook",
});

interface Playbook {
  id: string;
  name: string;
  description: string;
  content: string;
}

interface HostGroup {
  id: string;
  name: string;
}

// Table data and loading state
const loading = ref(false);
const playbooks = ref<Playbook[]>([]);
const hostGroups = ref<HostGroup[]>([]);
const searchText = ref("");

// Modal states
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formRef = ref<FormInstance>();

const runModalVisible = ref(false);
const runModalLoading = ref(false);
const viewModalVisible = ref(false);

const selectedPlaybook = ref<Playbook | null>(null);

// Form states
const formState = ref({
  id: "",
  name: "",
  description: "",
  content: "",
});

const runForm = ref({
  hostGroup: "",
});

const rules = {
  name: [{ required: true, message: "Please input playbook name" }],
  content: [{ required: true, message: "Please input playbook content" }],
};

// Pagination
const pagination = ref<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
});

// Table columns
const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: true,
    width: 200,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    ellipsis: true,
    width: 240,
  },
  {
    title: "Actions",
    key: "actions",
    width: 280,
    align: "center",
  },
];

// Computed filtered data
const filteredPlaybooks = computed(() => {
  if (!searchText.value) {
    return playbooks.value;
  }
  const searchLower = searchText.value.toLowerCase();
  return playbooks.value.filter(
    (playbook) =>
      playbook.name.toLowerCase().includes(searchLower) ||
      playbook.description.toLowerCase().includes(searchLower)
  );
});

// Methods
const fetchPlaybooks = async () => {
  loading.value = true;
  try {
    // TODO: Implement API call to fetch playbooks
    // const response = await api.getPlaybooks();
    // playbooks.value = response.data;
    // pagination.value.total = response.total;

    // Mock data for development
    playbooks.value = [
      {
        id: "1",
        name: "Deploy Web Application",
        description: "Deploys the web application to production servers",
        content: "yaml content here...",
      },
      {
        id: "2",
        name: "Database Backup",
        description: "Performs database backup across all database servers",
        content: "yaml content here...",
      },
    ];
    pagination.value.total = playbooks.value.length;
  } catch (error) {
    console.error("Error fetching playbooks:", error);
  } finally {
    loading.value = false;
  }
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
    ];
  } catch (error) {
    console.error("Error fetching host groups:", error);
  }
};

const showCreateModal = () => {
  modalMode.value = "create";
  formState.value = {
    id: "",
    name: "",
    description: "",
    content: "",
  };
  modalVisible.value = true;
};

const editPlaybook = (playbook: Playbook) => {
  modalMode.value = "edit";
  formState.value = { ...playbook };
  modalVisible.value = true;
};

const showPlaybook = (playbook: Playbook) => {
  selectedPlaybook.value = playbook;
  viewModalVisible.value = true;
};

const showRunModal = (playbook: Playbook) => {
  selectedPlaybook.value = playbook;
  runForm.value.hostGroup = "";
  runModalVisible.value = true;
};

const handleModalOk = async () => {
  try {
    await formRef.value?.validate();
    modalLoading.value = true;

    if (modalMode.value === "create") {
      // TODO: Implement create API call
      // await api.createPlaybook(formState.value);
    } else {
      // TODO: Implement update API call
      // await api.updatePlaybook(formState.value);
    }

    modalVisible.value = false;
    fetchPlaybooks();
  } catch (error) {
    console.error("Validation failed:", error);
  } finally {
    modalLoading.value = false;
  }
};

const handleRunPlaybook = async () => {
  if (!runForm.value.hostGroup || !selectedPlaybook.value) return;

  runModalLoading.value = true;
  try {
    // TODO: Implement run playbook API call
    // await api.runPlaybook({
    //   playbookId: selectedPlaybook.value.id,
    //   hostGroupId: runForm.value.hostGroup,
    // });

    runModalVisible.value = false;
    // TODO: Add to task history
  } catch (error) {
    console.error("Error running playbook:", error);
  } finally {
    runModalLoading.value = false;
  }
};

const deletePlaybook = async (playbook: Playbook) => {
  try {
    // TODO: Implement delete API call
    // await api.deletePlaybook(playbook.id);
    fetchPlaybooks();
  } catch (error) {
    console.error("Error deleting playbook:", error);
  }
};

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  fetchPlaybooks();
};

const onSearch = () => {
  pagination.value.current = 1;
  fetchPlaybooks();
};

// Initial data fetch
fetchPlaybooks();
fetchHostGroups();
</script>

<style scoped lang="scss">
.playbook-container {
  padding: 24px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}
</style>
