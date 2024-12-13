import request from '@/utils/request'

// 查询应用功能列表
export function listModuleFunc(query) {
  return request({
    url: '/external/common/moduleFunc/list',
    method: 'get',
    params: query
  })
}

// 查询应用功能详细
export function getModuleFunc(id) {
  return request({
    url: '/external/common/moduleFunc/' + id,
    method: 'get'
  })
}

// 新增应用功能
export function addModuleFunc(data) {
  return request({
    url: '/external/common/moduleFunc',
    method: 'post',
    data: data
  })
}

// 修改应用功能
export function updateModuleFunc(data) {
  return request({
    url: '/external/common/moduleFunc',
    method: 'put',
    data: data
  })
}

// 删除应用功能
export function delModuleFunc(id) {
  return request({
    url: '/external/common/moduleFunc/' + id,
    method: 'delete'
  })
}
