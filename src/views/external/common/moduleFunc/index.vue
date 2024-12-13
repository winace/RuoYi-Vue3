<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属应用" prop="appId">
        <el-select v-model="queryParams.appId" placeholder="所属应用"
          clearable style="width: 200px" @change="handleQuery">
          <el-option
            v-for="appCfg in appCfgList"
            :key="appCfg.appId"
            :label="appCfg.name"
            :value="appCfg.appId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['common:moduleFunc:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Sort"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="moduleFuncList"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="编码" prop="code" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="所属应用" align="center" prop="appName" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['common:moduleFunc:edit']">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['common:moduleFunc:add']">新增</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['common:moduleFunc:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改应用功能对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="moduleFuncRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="父id" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="moduleFuncOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            value-key="id"
            placeholder="请选择父id"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="显示排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" controls-position="right" :min="1" />
        </el-form-item>
        <el-form-item label="所属应用" prop="appId">
          <el-select v-model="form.appId" placeholder="所属应用">
            <el-option
              v-for="appCfg in appCfgList"
              :key="appCfg.appId"
              :label="appCfg.name"
              :value="appCfg.appId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ModuleFunc">
import { listModuleFunc, getModuleFunc, delModuleFunc, addModuleFunc, updateModuleFunc } from "@/api/external/common/moduleFunc";
import { listAppCfg } from "@/api/external/common/appCfg";

const { proxy } = getCurrentInstance();

const moduleFuncList = ref([]);
const moduleFuncOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);
const appCfgList = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    code: null,
    name: null,
    appId: null
  },
  rules: {
    code: [
      { required: true, message: "编码不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "名称不能为空", trigger: "blur" }
    ],
    appId: [
      { required: true, message: "所属应用不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询应用功能列表 */
function getList() {
  loading.value = true;
  listModuleFunc(queryParams.value).then(response => {
    moduleFuncList.value = proxy.handleTree(response.data, "id", "parentId");
    loading.value = false;
  });
}

/** 查询应用功能下拉树结构 */
function getTreeselect() {
  listModuleFunc().then(response => {
    moduleFuncOptions.value = [];
    const data = { id: 0, name: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.data, "id", "parentId");
    moduleFuncOptions.value.push(data);
  });
}
	
// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    code: null,
    name: null,
    parentId: null,
    orderNum: 1,
    appId: null,
    remark: null
  };
  proxy.resetForm("moduleFuncRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  getTreeselect();
  if (row != null && row.id) {
    form.value.parentId = row.id;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = "添加应用功能";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  getModuleFunc(row.id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改应用功能";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["moduleFuncRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateModuleFunc(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addModuleFunc(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除应用功能编号为"' + row.id + '"的数据项？').then(function() {
    return delModuleFunc(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
/** 查询i应用配置列表 */
function getAppCfgList() {
  listAppCfg().then((response)=>{
    appCfgList.value = response.data;
  })
}

getAppCfgList();
getList();
</script>
