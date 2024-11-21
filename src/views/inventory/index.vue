<template>
  <div class="h-full">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-gray-900">Inventory 管理</h1>
      <div class="space-x-4">
        <a-button type="primary" @click="showAddHostGroupModal">
          <template #icon><PlusOutlined /></template>
          添加主机组
        </a-button>
        <a-button type="primary" @click="showAddHostModal">
          <template #icon><PlusOutlined /></template>
          添加主机
        </a-button>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <!-- 主机组列表 -->
      <div class="col-span-3">
        <a-card :bordered="true">
          <template #title>
            <div class="flex items-center">
              <span class="font-medium">请选择主机组: </span>
              <a-select
                v-model:value="selectedHostGroup"
                show-search
                placeholder="请选择主机组"
                :options="hostGroups"
                style="width: 200px"
                :filter-option="filterOption"
              >
              </a-select>
            </div>
          </template>
        </a-card>
      </div>

      <!-- 主机列表 -->
      <div class="col-span-9">
        <a-card :bordered="false">
          <template #title>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center">
                <!-- <ComputerDesktopIcon class="w-4 h-4 mr-2 text-gray-500" /> -->
                <span>主机列表</span>
              </div>
              <a-input-search
                v-model:value="searchQuery"
                placeholder="搜索主机"
                style="width: 250px"
                @search="onSearch"
              >
                <template #prefix>
                  <MagnifyingGlassIcon class="w-3.5 h-3.5 text-gray-400" />
                </template>
              </a-input-search>
            </div>
          </template>
          <a-table
            :columns="columns"
            :data-source="hosts"
            :pagination="pagination"
            :row-key="(record) => record.id"
            :scroll="{ x: 800 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <div class="flex items-center space-x-2">
                  <a-button
                    type="link"
                    size="small"
                    @click="editHost(record)"
                    class="flex items-center"
                  >
                    <PencilIcon class="w-3.5 h-3.5 mr-1" />
                    编辑
                  </a-button>
                  <a-button
                    type="link"
                    size="small"
                    danger
                    @click="deleteHost(record)"
                    class="flex items-center"
                  >
                    <TrashIcon class="w-3.5 h-3.5 mr-1" />
                    删除
                  </a-button>
                </div>
              </template>
            </template>
          </a-table>
        </a-card>
      </div>
    </div>

    <!-- 添加主机组对话框 -->
    <a-modal
      v-model:visible="addHostGroupModalVisible"
      title="添加主机组"
      @ok="handleAddHostGroup"
    >
      <a-form :model="hostGroupForm" layout="vertical">
        <a-form-item label="主机组名称" name="name">
          <a-input v-model:value="hostGroupForm.name" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="hostGroupForm.description" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加主机对话框 -->
    <a-modal
      v-model:visible="addHostModalVisible"
      title="添加主机"
      @ok="handleAddHost"
    >
      <a-form :model="hostForm" layout="vertical">
        <a-form-item label="主机名称" name="name">
          <a-input v-model:value="hostForm.name" />
        </a-form-item>
        <a-form-item label="IP地址" name="ip">
          <a-input v-model:value="hostForm.ip" />
        </a-form-item>
        <a-form-item label="端口" name="port">
          <a-input-number v-model:value="hostForm.port" :min="1" :max="65535" />
        </a-form-item>
        <a-form-item label="所属主机组" name="groupId">
          <a-select v-model:value="hostForm.groupId">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import {
  ServerIcon,
  ComputerDesktopIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

// 表格列定义
const columns = [
  {
    title: "主机名",
    dataIndex: "name",
    key: "name",
    width: "20%",
  },
  {
    title: "IP地址",
    dataIndex: "ip",
    key: "ip",
    width: "25%",
  },
  {
    title: "端口",
    dataIndex: "port",
    key: "port",
    width: "15%",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: "15%",
  },
  {
    title: "操作",
    key: "action",
    width: "25%",
    fixed: "right",
  },
];

// 分页配置
const pagination = {
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
};

// 主机组数据
const hostGroups = ref([
  { value: 1, label: "Web服务器", hostCount: 3 },
  { value: 2, label: "数据库服务器", hostCount: 2 },
  { value: 3, label: "测试服务器", hostCount: 5 },
]);

// 主机数据
const hosts = ref([
  { id: 1, name: "web-01", ip: "192.168.1.101", port: 22, status: "在线" },
  { id: 2, name: "web-02", ip: "192.168.1.102", port: 22, status: "离线" },
]);

// 选中的主机组
const selectedHostGroup = ref();

// 搜索查询
const searchQuery = ref("");
const onSearch = (value: string) => {
  console.log("搜索:", value);
};
const filterOption = (input: string, option: any) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

// 添加主机组相关
const addHostGroupModalVisible = ref(false);
const hostGroupForm = reactive({
  name: "",
  description: "",
});

const showAddHostGroupModal = () => {
  addHostGroupModalVisible.value = true;
};

const handleAddHostGroup = () => {
  console.log("添加主机组:", hostGroupForm);
  addHostGroupModalVisible.value = false;
};

// 添加主机相关
const addHostModalVisible = ref(false);
const hostForm = reactive({
  name: "",
  ip: "",
  port: 22,
  groupId: undefined,
});

const showAddHostModal = () => {
  addHostModalVisible.value = true;
};

const handleAddHost = () => {
  console.log("添加主机:", hostForm);
  addHostModalVisible.value = false;
};

// 编辑和删除主机
const editHost = (record: any) => {
  console.log("编辑主机:", record);
};

const deleteHost = (record: any) => {
  console.log("删除主机:", record);
};

const selectHostGroup = (id: string) => {
  selectedHostGroup.value = [id];
};
</script>

<style scoped>
.host-group-card {
  height: calc(100vh - 180px);
  overflow-y: auto;
}

.host-group-card :deep(.ant-card-body) {
  padding: 0;
}

.host-group-list :deep(.ant-list-item) {
  padding: 0;
  border: none;
}

.host-group-item {
  margin: 4px 0;
  padding: 8px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.host-group-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.host-group-item.selected {
  background-color: #e6f4ff;
}

.host-group-item :deep(.ant-tag) {
  margin-right: 0;
  background-color: rgba(0, 0, 0, 0.04);
  border: none;
}

:deep(.ant-card) {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:deep(.ant-table-wrapper) {
  margin: -16px -24px;
}

:deep(.ant-table-cell) {
  padding: 8px 12px !important;
  white-space: nowrap;
}

:deep(.ant-btn-link) {
  padding: 0 4px;
  height: 24px;
  line-height: 24px;
}

:deep(.ant-btn-link span) {
  font-size: 13px;
}

:deep(.ant-table) {
  overflow-x: auto;
}
</style>
