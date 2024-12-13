<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="应用名称" prop="mnae">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入应用名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属平台" prop="platform">
        <el-select v-model="queryParams.platform" placeholder="所属平台"
          style="width: 240px"
          clearable
          @change="handleQuery">
          <el-option
            v-for="dict in external_platform"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="应用类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="应用类型"
          style="width: 240px"
          clearable
          @change="handleQuery">
          <el-option
            v-for="dict in external_app_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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
          v-hasPermi="['common:appCfg:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['common:appCfg:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['common:appCfg:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['common:appCfg:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="appCfgList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="应用appId" align="center" prop="appId" />
      <el-table-column label="应用名称" align="center" prop="name" />
      <el-table-column label="数据格式" align="center" prop="msgDataFormat" />
      <el-table-column label="所属平台" align="center" prop="platformLabel" />
      <el-table-column label="应用类型" align="center" prop="typeLabel" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['common:appCfg:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['common:appCfg:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改应用配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="appCfgRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="应用appId" prop="appId">
          <el-input v-model="form.appId" placeholder="请输入应用appId" :disabled="!!form.appId" />
        </el-form-item>
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入应用名称" />
        </el-form-item>
        <el-form-item label="应用密钥" prop="secret">
          <el-input v-model="form.secret" placeholder="请输入应用密钥" />
        </el-form-item>
        <el-form-item label="令牌" prop="token">
          <el-input v-model="form.token" placeholder="请输入令牌" />
        </el-form-item>
        <el-form-item label="消息加密密钥" prop="aesKey">
          <el-input v-model="form.aesKey" placeholder="请输入消息加密密钥" />
        </el-form-item>
        <el-form-item label="数据格式" prop="msgDataFormat">
          <el-select v-model="form.msgDataFormat" placeholder="数据格式">
            <el-option
              v-for="dict in msg_data_format"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属平台" prop="platform">
          <el-select v-model="form.platform" placeholder="所属平台">
            <el-option
              v-for="dict in external_platform"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="应用类型" prop="type">
          <el-select v-model="form.type" placeholder="应用类型">
            <el-option
              v-for="dict in external_app_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
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

<script setup name="AppCfg">
import { pageAppCfg, getAppCfg, delAppCfg, saveAppCfg } from "@/api/external/common/appCfg";

const { proxy } = getCurrentInstance();
const { msg_data_format, external_platform, external_app_type } = proxy.useDict("msg_data_format", "external_platform", "external_app_type");

const appCfgList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    platform: null,
    type: null
  },
  rules: {
    tenantId: [
      { required: true, message: "租户ID不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询应用配置列表 */
function getList() {
  loading.value = true;
  pageAppCfg(queryParams.value).then(response => {
    appCfgList.value = response.rows;
    total.value = response.total;
    loading.value = false;
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
    appId: null,
    name: null,
    secret: null,
    token: null,
    aesKey: null,
    msgDataFormat: 'JSON',
    platform: null,
    type: 'miniapp',
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null
  };
  proxy.resetForm("appCfgRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.appId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加应用配置";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _appId = row.appId || ids.value
  getAppCfg(_appId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改应用配置";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["appCfgRef"].validate(valid => {
    if (valid) {
      saveAppCfg(form.value).then(response => {
        proxy.$modal.msgSuccess("保存成功");
        open.value = false;
        getList();
      });
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _appIds = row.appId || ids.value;
  proxy.$modal.confirm('是否确认删除应用配置编号为"' + _appIds + '"的数据项？').then(function() {
    return delAppCfg(_appIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('common/appCfg/export', {
    ...queryParams.value
  }, `appCfg_${new Date().getTime()}.xlsx`)
}

getList();
</script>
