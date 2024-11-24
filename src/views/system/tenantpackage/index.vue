<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="套餐名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入套餐名" style="width: 240px" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="套餐状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择租户套餐状态" style="width: 240px" clearable>
          <el-option v-for="dict in sys_tenant_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['system:tenantpackage:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:tenantpackage:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:tenantpackage:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:tenantpackage:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tenantpackageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column fixed label="序号" min-width="20%" align="center">
        <template #default="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + (scope.$index + 1) }} </span>
        </template>
      </el-table-column>
      <el-table-column label="套餐编号" align="center" prop="id" v-if="false" />
      <el-table-column label="套餐名" align="center" prop="name" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="租户套餐状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:tenantpackage:edit']">修改</el-button>
          <el-button type="text" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:tenantpackage:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="title" v-model="open" width="550px" append-to-body>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="套餐名" prop="name">
          <el-input v-model="form.name" placeholder="请输入套餐名" />
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event)">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event)">全选/全不选</el-checkbox>
          <el-tree class="tree-border" :data="menuOptions" show-checkbox ref="menuRef" node-key="id"
            :check-strictly="menuCheckStrictly" empty-text="加载中，请稍后" :props="defaultProps"></el-tree>
        </el-form-item>

        <el-form-item label="套餐状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_tenant_status" :key="dict.value"
              :value="parseInt(dict.value)">{{ dict.label }}</el-radio>
          </el-radio-group>
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

<script setup name="Tenantpackage">
import { listTenantpackage, getTenantpackage, delTenantpackage, addTenantpackage, updateTenantpackage } from "@/api/system/tenantpackage";
import { listSimpleMenus } from "@/api/system/menu";
import { parseTime, handleTree } from "@/utils/ruoyi";

const { proxy } = getCurrentInstance();
const { sys_tenant_status } = proxy.useDict("sys_tenant_status");

const defaultProps = ref({label: "name"});
// 菜单列表
const menuOptions = ref([]);
//展开参数
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const menuCheckStrictly = ref(true);
// 遮罩层
const loading = ref(true);
// 选中数组
const ids = ref([]);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 租户套餐表格数据
const tenantpackageList = ref([]);
// 弹出层标题
const title = ref("");
// 是否显示弹出层
const open = ref(false);

const data = reactive({
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    status: null
  },
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    name: [{ required: true, message: "套餐名不能为空", trigger: "blur" }],
    status: [{ required: true, message: "状态不能为空", trigger: "blur" }],
    menuIds: [{ required: true, message: "关联的菜单编号不能为空", trigger: "blur" }],
  }
});
const { queryParams, form, rules } = toRefs(data);

/** 查询租户套餐列表 */
function getList() {
  loading.value = true;
  listTenantpackage(queryParams.value).then(response => {
    tenantpackageList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 获得菜单 */
function getMenus() {
  listSimpleMenus().then(response => {
    // 处理 menuOptions 参数
    menuOptions.value = [];
    // 只需要配置
    menuOptions.value.push(...handleTree(response.data, "id"));
  });
}
// 取消按钮
function cancel() {
  open.value = false;
  reset();
}
// 表单重置
function reset() {
  if (proxy.$refs.menuRef !== undefined) {
    proxy.$refs.menuRef.setCheckedKeys([]);
  }
  menuExpand.value = false;
  menuNodeAll.value = false;
  menuCheckStrictly.value = true;
  form.value = {
    id: null,
    name: null,
    menuIds: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    status: 0
  };
  proxy.resetForm("formRef");
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加租户套餐";
  menuCheckStrictly.value = false;
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value;
  open.value = true;
  title.value = "修改租户套餐";
  // 获得菜单列表
  getTenantpackage(id).then(response => {
    form.value = response.data;
    // 设置菜单项
    // 设置为严格，避免设置父节点自动选中子节点，解决半选中问题
    menuCheckStrictly.value = true
    // 设置选中
    proxy.$refs.menuRef.setCheckedKeys(response.data.menuIds.split(','));
    // 设置为非严格，继续使用半选中
    menuCheckStrictly.value = false
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["formRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTenantpackage({
          ...form.value,
          menuIds: [...proxy.$refs.menuRef.getCheckedKeys(), ...proxy.$refs.menuRef.getHalfCheckedKeys()].toString()
        }).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTenantpackage({
          ...form.value,
          menuIds: [...proxy.$refs.menuRef.getCheckedKeys(), ...proxy.$refs.menuRef.getHalfCheckedKeys()].toString()
        }).then(response => {
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
  const title = row ? "当前" : "选中";
  proxy.$modal.confirm('是否确认删除' + title + '租户套餐数据项？').then(function () {
    return delTenantpackage(row.id || ids.value);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport() {
  download('system/tenantpackage/export', {
    ...queryParams.value
  }, `租户套餐_${parseTime(new Date().getTime(), '{y}-{m}-{d}')}.xlsx`)
}
// 树权限（展开/折叠）
function handleCheckedTreeExpand(value, type) {
  let treeList = menuOptions.value;
  for (let i = 0; i < treeList.length; i++) {
    proxy.$refs.menuRef.store.nodesMap[treeList[i].id].expanded = value;
  }
}
// 树权限（全选/全不选）
function handleCheckedTreeNodeAll(value) {
  proxy.$refs.menuRef.setCheckedNodes(value ? menuOptions.value : []);
}
// 树权限（父子联动）
function handleCheckedTreeConnect(value) {
  form.value.menuCheckStrictly = value;
}

getList();
getMenus();

</script>
