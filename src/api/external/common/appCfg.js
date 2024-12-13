import request from '@/utils/request'

// 查询应用配置分页列表
export function pageAppCfg(query) {
  return request({
    url: '/external/common/appCfg/page',
    method: 'get',
    params: query
  })
}
// 查询应用配置列表
export function listAppCfg() {
  return request({
    url: '/external/common/appCfg/list',
    method: 'get'
  })
}
// 查询应用配置详细
export function getAppCfg(appId) {
  return request({
    url: '/external/common/appCfg/' + appId,
    method: 'get'
  })
}

// 新增/修改的保存应用配置
export function saveAppCfg(data) {
  return request({
    url: '/external/common/appCfg',
    method: 'post',
    data: data
  })
}

// 删除应用配置
export function delAppCfg(appId) {
  return request({
    url: '/external/common/appCfg/' + appId,
    method: 'delete'
  })
}
