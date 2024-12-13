import request from '@/utils/request'

// 查询应用用户列表
export function listExUser(query) {
  return request({
    url: '/external/common/exUser/list',
    method: 'get',
    params: query
  })
}

// 查询应用用户详细
export function getExUser(openid) {
  return request({
    url: '/external/common/exUser/' + openid,
    method: 'get'
  })
}

// 查询应用用户授权信息
export function getExUserGrant(openid) {
  return request({
    url: '/external/common/exUser/grant/' + openid,
    method: 'get'
  })
}

// 应用用户保存
export function saveExUser(data) {
  return request({
    url: '/external/common/exUser',
    method: 'post',
    data: data
  })
}

// 应用用户授权
export function grantExUser(data) {
  return request({
    url: '/external/common/exUser',
    method: 'put',
    data: data
  })
}

// 删除应用用户
export function delExUser(openid) {
  return request({
    url: '/external/common/exUser/' + openid,
    method: 'delete'
  })
}
