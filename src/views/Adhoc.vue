<template>
  <div class="adhoc-container">
    <!-- select host group -->
    <a-form layout="vertical">
      <a-form-item label="Host Group" required>
        <a-select
          v-model:value="selectedHostGroup"
          placeholder="Select a host group"
          style="width: 100%"
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

      <!-- select module -->
      <a-form-item label="Module" required>
        <a-select
          v-model:value="selectedModule"
          placeholder="Select a module"
          style="width: 100%"
          show-search
        >
          <a-select-option
            v-for="module in modules"
            :key="module.name"
            :value="module.name"
          >
            {{ module.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- input command -->
      <a-form-item label="Command" required>
        <a-textarea
          v-model:value="command"
          :rows="4"
          placeholder="Enter your command"
          :disabled="!selectedModule"
        />
      </a-form-item>

      <!-- execute button -->
      <a-form-item>
        <a-button
          type="primary"
          :loading="executing"
          :disabled="!isFormValid"
          @click="executeCommand"
        >
          Execute
        </a-button>
      </a-form-item>
    </a-form>

    <!-- Results -->
    <div v-if="executionResults" class="results-container">
      <a-divider>Execution Results</a-divider>
      <a-alert
        :type="executionResults.success ? 'success' : 'error'"
        :message="executionResults.message"
        :description="executionResults.details"
        show-icon
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

defineOptions({
  name: "Adhoc",
});

interface HostGroup {
  id: string;
  name: string;
}

interface Module {
  name: string;
  description: string;
}

interface ExecutionResult {
  success: boolean;
  message: string;
  details: string;
}

// Mock data - replace with actual API calls
const hostGroups = ref<HostGroup[]>([
  { id: "1", name: "Web Servers" },
  { id: "2", name: "Database Servers" },
  { id: "3", name: "Load Balancers" },
]);

const modules = ref<Module[]>([
  { name: "shell", description: "Execute shell commands" },
  { name: "command", description: "Execute commands" },
  { name: "ping", description: "Try to connect to host" },
  { name: "file", description: "Manage files and file properties" },
  { name: "copy", description: "Copy files between hosts" },
  { name: "yum", description: "Manage packages with yum" },
  { name: "apt", description: "Manage packages with apt" },
  { name: "setup", description: "Get system information" },
  { name: "systemd", description: "Manage systemd services" },
  { name: "cron", description: "Manage cron jobs" },
]);

// Form state
const selectedHostGroup = ref<string>("");
const selectedModule = ref<string>("");
const command = ref<string>("");
const executing = ref<boolean>(false);
const executionResults = ref<ExecutionResult | null>(null);

// Computed properties
const isFormValid = computed(() => {
  return (
    selectedHostGroup.value && selectedModule.value && command.value.trim()
  );
});

// Methods
const executeCommand = async () => {
  if (!isFormValid.value) return;

  executing.value = true;
  try {
    // Mock API call - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    executionResults.value = {
      success: true,
      message: "Command executed successfully",
      details: `Executed ${selectedModule.value} on ${selectedHostGroup.value} with command: ${command.value}`,
    };
  } catch (error) {
    executionResults.value = {
      success: false,
      message: "Command execution failed",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  } finally {
    executing.value = false;
  }
};
</script>

<style scoped>
.adhoc-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.results-container {
  margin-top: 24px;
}
</style>
