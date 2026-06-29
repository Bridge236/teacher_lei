# teacher_lei - 23历史1班随机点名系统
基于"别点我"随机点名系统，名单数据直接写在 JS 文件中，无需后端/Supabase。

## 技术方案
- 纯静态前端（HTML + CSS + JS）
- 数据存储：localStorage（名单种子数据在 storage.js 中预置）
- 部署方式：GitHub Pages

## 页面结构
| 页面 | 文件 | 功能 |
|------|------|------|
| 登录页 | index.html | 硬编码账号密码验证 |
| 班级管理 | dashboard.html | 班级/学生增删改查、批量导入 |
| 点名页 | roll.html | 随机滚动点名、音效、彩带、彩蛋 |

## 预置名单
- 班级：23历史1班（39人）
- 账号：981020530@qq.com
- 密码：123456

## 部署
## 访问地址
https://bridge236.github.io/teacher_lei/

## 部署
推送到 GitHub 后，在 Settings → Pages 中启用 GitHub Pages（source: master branch, root folder）。
