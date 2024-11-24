<template>
  <div class="app-container">
    <div class="tenanttip"
      style="padding: 8px 16px;background-color: #ecf8ff;border-radius: 4px;border-left: 5px solid #ef8708;margin: 20px 0;">
      <p style="font-weight: 400;color: #1f2f3d;">特别提醒,租户管理员初始密码采用邮件通知方式发放,保证安全性,请填写正确的邮箱!</p>
    </div>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="租户名称" prop="tenantName">
        <el-input v-model="queryParams.tenantName" placeholder="请输入租户名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="管理员账号" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入管理员账号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="userPhone">
        <el-input v-model="queryParams.userPhone" placeholder="请输入手机号码" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="租赁结束时间">
        <el-date-picker v-model="daterangeTenantTime" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['system:tenant:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:tenant:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:tenant:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:tenant:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tenantList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="租户编码" align="center" prop="id" />
      <el-table-column label="租户名称" align="center" prop="tenantName" />
      <el-table-column label="管理员账号" align="center" prop="userName" />
      <el-table-column label="手机号码" align="center" prop="userPhone" />
      <el-table-column label="邮箱地址" align="center" prop="userEmail" />
      <el-table-column label="租户套餐" align="center" prop="packageIds" width="180">
        <template #default="scope">
          <el-tag v-for="name in getPackageName(scope.row.packageIds)">{{ name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="租赁结束时间" align="center" prop="tenantTime" width="120">
        <template #default="scope">
          <span>{{ parseTime(scope.row.tenantTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="租户状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="重置密码" placement="top">
              <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:tenant:resetPwd']"/>
          </el-tooltip>
          <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:tenant:edit']"/>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:tenant:remove']"/>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改租户管理对话框 -->
    <el-dialog :title="title" v-model="open" width="550px" append-to-body>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="租户名称" prop="tenantName">
          <el-input v-model="form.tenantName" placeholder="请输入租户名称" :disabled="this.updateOrAdd" />
        </el-form-item>
        <el-form-item label="管理员账号" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入管理员账号" :disabled="this.updateOrAdd" />
        </el-form-item>
        <el-form-item label="手机号码" prop="userPhone">
          <el-input v-model="form.userPhone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="邮箱地址" prop="userEmail">
          <el-input v-model="form.userEmail" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="租户套餐" prop="packageIds">
          <el-select v-model="form.packageIds" multiple placeholder="请选择租户套餐">
            <el-option v-for="item in packageList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="租赁结束时间" prop="tenantTime">
          <el-date-picker v-model="form.tenantTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择租赁结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="租户状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_tenant_status" :key="dict.value"
              :label="parseInt(dict.value)">{{ dict.label }}</el-radio>
          </el-radio-group>
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

<script setup name="Tenant">
import { listTenant, getTenant, delTenant, addTenant, updateTenant, resetTenantUserPwd } from "@/api/system/tenant";
import { getTenantPackageList } from "@/api/system/tenantpackage";
import { parseTime } from "@/utils/ruoyi";

const { proxy } = getCurrentInstance();
const { sys_tenant_status } = proxy.useDict("sys_tenant_status");

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
// 租户管理表格数据
const tenantList = ref([]);
// 弹出层标题
const title = ref("");
// 是否显示弹出层
const open = ref(false);
// 租户套餐列表
const packageList = ref([]);
// 备注时间范围
const daterangeTenantTime = ref([]);
// 是否更新 默认是插入 不禁用无法修改的字段
const updateOrAdd = ref(false);


const data = reactive({
  // 表单参数
  form: {},
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tenantName: null,
    userName: null,
    userPhone: null,
    tenantTime: null,
    status: null,
  },
  // 表单校验
  rules: {
    tenantName: [
      { required: true, message: "租户名称不能为空", trigger: "blur" }
    ],
    userName: [
      { required: true, message: "管理员账号不能为空", trigger: "blur" }
    ],
    userPhone: [
      { required: true, message: "手机号码不能为空", trigger: "blur" },
      {
        pattern: /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/,
        message: "请输入正确的手机号码",
        trigger: "blur"
      }
    ],
    userEmail: [
      { required: true, message: "邮箱地址不能为空", trigger: "blur" },
      {
        type: "email",
        message: "请输入正确的邮箱地址",
        trigger: ["blur", "change"]
      }
    ],
    packageIds: [
      { required: true, message: "租户套餐不能为空", trigger: "blur" }
    ],
    tenantTime: [
      { required: true, message: "租赁结束时间不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "租户状态不能为空", trigger: "blur" }
    ],
  }
});
const { queryParams, form, rules } = toRefs(data);

/** 查询租户管理列表 */
function getList() {
  loading.value = true;
  const params = proxy.addDateRange(queryParams.value, daterangeTenantTime.value, "TenantTime")
  listTenant(params).then(response => {
    loading.value = false;
    tenantList.value = response.rows;
    total.value = response.total;
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
    tenantName: undefined,
    userName: undefined,
    userPhone: undefined,
    userEmail: undefined,
    packageIds: [],
    tenantTime: undefined,
    status: 0,
    delFlag: undefined,
    createBy: undefined,
    createTime: undefined,
    updateBy: undefined,
    updateTime: undefined,
    remark: undefined
  };
  proxy.resetForm("formRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
function resetQuery() {
  daterangeTenantTime.value = [];
  proxy.resetForm("queryForm");
  handleQuery();
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  singleids.value = selection.length !== 1
  multipleids.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  updateOrAdd.value = false;
  title.value = "新增租户";
  //每次修改租户的时候都会添加租户套餐校验
  getTenantPackageList().then(response => {
    packageList.value = response.data;
  })
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  getTenantPackageList().then(response => {
    packageList.value = response.data;
  })
  updateOrAdd.value = true;
  const id = row.id || ids.value
  getTenant(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改租户";
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["formRef"].validate(valid => {
    if (valid) {
      if (form.value.id && updateOrAdd.value) {
        updateTenant(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTenant(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功,密码已发送至邮箱");
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
  proxy.$modal.confirm('是否确认删除' + title + '租户数据项？').then(function () {
    return delTenant(row.id || ids.value);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy.$modal.confirm('是否确认重置“' + row.tenantName + '”租户管理员密码？').then(function () {
    resetTenantUserPwd(row.id).then(response => {
      proxy.$modal.msgSuccess("修改成功，新密码已发送至邮箱");
    });
  }).catch(() => { });
};

/** 导出按钮操作 */
function handleExport() {
  download('system/tenant/export', {
    ...queryParams.value
  }, `租户管理_${parseTime(new Date().getTime(), '{y}-{m}-{d}')}.xlsx`)
}
function getPackageName(packageIds) {
  return packageList.value.filter(item=>packageIds.includes(item.id)).map(item=>item.name);
}

getList();
// 获得租户套餐列表
getTenantPackageList().then(response => {
  packageList.value= response.data;
});

</script>
