<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input
          v-model="queryParams.nickName"
          placeholder="请输入昵称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户性别" prop="gender">
        <el-input
          v-model="queryParams.gender"
          placeholder="请输入用户性别"
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
          v-hasPermi="['common:exUser:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['common:exUser:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['common:exUser:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['common:exUser:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="exUserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="openid" align="center" prop="openid" />
      <el-table-column label="unionid" align="center" prop="unionid" />
      <el-table-column label="手机号" align="center" prop="phone" />
      <el-table-column label="昵称" align="center" prop="nickName" />
      <el-table-column label="用户头像" align="center" prop="avatar" />
      <el-table-column label="用户性别" align="center" prop="gender">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.gender" />
        </template>
      </el-table-column>
      <el-table-column label="国家" align="center" prop="country" />
      <el-table-column label="省份" align="center" prop="province" />
      <el-table-column label="城市" align="center" prop="city" />
      <el-table-column label="所属应用" align="center" prop="appName" />
      <el-table-column label="授权功能模块" align="center" prop="funcNames" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['common:exUser:edit']">修改</el-button>
          <el-button link type="primary" icon="Key" @click="handleGrant(scope.row)" v-hasPermi="['common:exUser:grant']">授权</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['common:exUser:remove']">删除</el-button>
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

    <!-- 添加或修改应用用户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="exUserRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="openid" prop="openid">
          <el-input v-model="form.openid" placeholder="请输入openid" :disabled="true" />
        </el-form-item>
        <el-form-item label="unionid" prop="unionid">
          <el-input v-model="form.unionid" placeholder="请输入unionid" :disabled="true" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" :disabled="true" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入昵称" :disabled="true" />
        </el-form-item>
        <el-form-item label="用户头像" prop="avatar">
          <el-input v-model="form.avatar" placeholder="请输入用户头像" :disabled="true" />
        </el-form-item>
        <el-form-item label="用户性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择">
            <el-option
                v-for="dict in sys_user_sex"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="国家" prop="country">
          <el-input v-model="form.country" placeholder="请输入国家" />
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="form.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="form.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="所属应用" prop="appId">
          <el-select v-model="form.appId" placeholder="所属应用" :disabled="!!form.appId">
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
    <el-dialog :title="grantTitle" v-model="grantOpen" width="500px" append-to-body>
      <el-form ref="exUserGrantRef" :model="grantForm" label-width="120px">
        <el-form-item label="openid" prop="openid">
          <el-input v-model="grantForm.openid" placeholder="请输入openid" :disabled="!!grantForm.openid" />
        </el-form-item>
        <el-form-item label="所属应用" prop="appId">
          <el-select v-model="grantForm.appId" placeholder="所属应用" :disabled="!!grantForm.appId">
            <el-option
              v-for="appCfg in appCfgList"
              :key="appCfg.appId"
              :label="appCfg.name"
              :value="appCfg.appId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="授权功能模块" prop="funcIds">
          <el-checkbox v-model="mfTreeExpand" @change="handleCheckedTreeExpand($event)">展开/折叠</el-checkbox>
          <el-checkbox v-model="mfTreeNodeAll" @change="handleCheckedTreeNodeAll($event)">全选/全不选</el-checkbox>
          <el-checkbox v-model="grantForm.mfTreeCheckStrictly" @change="handleCheckedTreeConnect($event)">父子联动</el-checkbox>
          <el-tree
            class="tree-border"
            :data="moduleFunTree"
            show-checkbox
            ref="mfTreeRef"
            node-key="id"
            :check-strictly="!grantForm.mfTreeCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'name', children: 'children' }"
          ></el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitGrantForm">确 定</el-button>
          <el-button @click="cancelGrant">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ExUser">
import { listExUser, getExUser, getExUserGrant, delExUser, saveExUser, grantExUser } from "@/api/external/common/exUser";
import { listAppCfg } from "@/api/external/common/appCfg";

const { proxy } = getCurrentInstance();
const { sys_user_sex } = proxy.useDict("sys_user_sex");

const exUserList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const appCfgList = ref([]);
const moduleFunTree = ref([]);
const grantOpen = ref(false);
const grantTitle = ref("");
const mfTreeExpand = ref(false);
const mfTreeNodeAll = ref(false);
const mfTreeRef = ref(null);

const data = reactive({
  form: {},
  grantForm: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    phone: null,
    nickName: null,
    gender: null,
    appId: null
  },
  rules: {
    openid: [
      { required: true, message: "openid不能为空", trigger: "blur" }
    ],
    unionid: [
      { required: true, message: "unionid不能为空", trigger: "blur" }
    ],
    appId: [
      { required: true, message: "所属应用不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, grantForm, rules } = toRefs(data);

/** 查询应用用户列表 */
function getList() {
  loading.value = true;
  listExUser(queryParams.value).then(response => {
    exUserList.value = response.rows;
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
    openid: null,
    unionid: null,
    phone: null,
    nickName: null,
    avatar: null,
    gender: null,
    country: null,
    province: null,
    city: null,
    appId: null,
    funcIds: null,
    remark: null
  };
  proxy.resetForm("exUserRef");
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
  ids.value = selection.map(item => item.openid);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加应用用户";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _openid = row.openid || ids.value
  getExUser(_openid).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改应用用户";
  });
}

/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand(value) {
    let treeList = moduleFunTree.value;
    for (let i = 0; i < treeList.length; i++) {
      mfTreeRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
}

/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value) {
  mfTreeRef.value.setCheckedNodes(value ? moduleFunTree.value : []);
}

/** 树权限（父子联动） */
function handleCheckedTreeConnect(value) {
  grantForm.value.mfTreeCheckStrictly = value ? true : false;
}

/** 所有菜单节点数据 */
function getMfTreeAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = mfTreeRef.value.getCheckedKeys();
  // 半选中的菜单节点
  let halfCheckedKeys = mfTreeRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}

function resetGrantForm() {
  grantForm.value = {
    openid: null,
    appId: null,
    mfTreeCheckStrictly: true
  }
  proxy.resetForm("exUserGrantRef");
}

/** 授权按钮操作 */
function handleGrant(row) {
  resetGrantForm();
  const _openid = row.openid || ids.value
  getExUserGrant(_openid).then(response => {
    moduleFunTree.value = response.data.moduleFuncTree
    grantForm.value = {
      openid: response.data.openid,
      appId: response.data.appId,
      mfTreeCheckStrictly: true
    };
    grantOpen.value = true;
    grantTitle.value = "应用用户授权";
    response.data.funcIdList.forEach((v) => {
      nextTick(() => {
        mfTreeRef.value.setChecked(v, true, false);
      });
    });
  });
}

/** 授权提交按钮 */
function submitGrantForm() {
  proxy.$refs["exUserGrantRef"].validate(valid => {
    if (valid) {
      if (grantForm.value.openid != null) {
        grantForm.value.funcIds = getMfTreeAllCheckedKeys().join(",");
        grantExUser(grantForm.value).then(response => {
          proxy.$modal.msgSuccess("授权保存成功");
          grantOpen.value = false;
          getList();
        });
      }
    }
  });
}

// 取消按钮
function cancelGrant() {
  grantOpen.value = false;
  resetGrantForm();
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["exUserRef"].validate(valid => {
    if (valid) {
      if (form.value.openid != null) {
        if (form.value.phone.indexOf('*')>0) {
          form.value.phone = null
        }
        saveExUser(form.value).then(response => {
          proxy.$modal.msgSuccess("保存成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _openids = row.openid || ids.value;
  proxy.$modal.confirm('是否确认删除应用用户编号为"' + _openids + '"的数据项？').then(function() {
    return delExUser(_openids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('common/exUser/export', {
    ...queryParams.value
  }, `exUser_${new Date().getTime()}.xlsx`)
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
