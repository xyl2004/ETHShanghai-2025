# ETHShanghai 2025 – 参赛提交指南 (Participant Submission Guide)

> 本 README 由主办方提供，参赛队伍直接在此基础上填写并提交。

## 一、提交物清单 (Deliverables)

- GitHub 仓库（公开或临时私有）：包含完整代码与本 README
- Demo 视频（≤ 3 分钟，中文）：展示核心功能与流程
- 在线演示链接（如有）：前端 Demo 或后端 API 文档
- 合约部署信息（如有）：网络、地址、验证链接、最小复现脚本
- 可选材料：Pitch Deck（不计入评分权重）

提示：若因即将上线或商业原因无法完全开源，可提交核心代码 + 可执行 Demo 包，并在下文标注“可验证边界”。

## 二、推荐目录结构 (Suggested Structure)

```
ETHShanghai-2025/
├─ contracts/           # 智能合约与测试（如使用）
├─ frontend/            # 前端 DApp（如使用）
├─ backend/             # 后端服务 / Workers（如使用）
├─ deployments/         # 部署产物与地址记录
├─ scripts/             # 部署/数据/运维脚本
├─ docs/                # 架构/接口/设计文档
└─ README.md            # 本文件（填写后提交）
```

## 三、参赛队伍填写区 (Fill-in Template)

### 1) 项目概述 (Overview)

- 项目名称：
- 一句话介绍：
- 目标用户：
- 核心问题与动机（Pain Points）：
- 解决方案（Solution）：

### 2) 架构与实现 (Architecture & Implementation)

- 总览图（可贴图/链接）：
- 关键模块：前端 / 后端 / 合约 / 索引 / Oracles / AI 代理（按需）
- 依赖与技术栈：Node/TS、React/Next、Solidity/Foundry/Hardhat、Graph、DB、Infra 等

### 3) 合约与部署 (Contracts & Deployment)（如有）

- 网络：
- 核心合约与地址：
- 验证链接（Etherscan/BlockScout）：
- 最小复现脚本：运行命令与期望输出：

### 4) 运行与复现 (Run & Reproduce)

- 前置要求：Node 18+、包管理器（pnpm/yarn）、ENV Keys（RPC、API 等）
- 环境变量样例：

```bash
# frontend/.env.local
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_DEFAULT_CHAIN=

# backend/.env
RPC_URL=
PRIVATE_KEY=
PORT=3001
```

- 一键启动（本地示例）：

```bash
pnpm install --filter ./frontend --filter ./backend --filter ./contracts
pnpm -C contracts test
pnpm -C frontend dev
# 打开 http://localhost:3000
```

- 在线 Demo（如有）：
- 账号与测试说明（如需要）：

### 5) Demo 与关键用例 (Demo & Key Flows)

- 视频链接（≤3 分钟，中文）：
- 关键用例步骤（2-4 个要点）：
  - 用例 1：
  - 用例 2：

### 6) 可验证边界 (Verifiable Scope)

- 如未完全开源，请在此明确：
  - 哪些模块可复现/可验证：
  - 哪些模块暂不公开及原因：

### 7) 路线图与影响 (Roadmap & Impact)

- 赛后 1-3 周：
- 赛后 1-3 个月：
- 预期对以太坊生态的价值：

### 8) 团队与联系 (Team & Contacts)

- 团队名：
- 成员与分工：
- 联系方式（Email/TG/X）：
- 可演示时段（时区）：

## 四、关键日期与赛制 (Timeline & Rules)

- 最终提交截止：2025-10-20 24:00（北京时间）
- 赛道：AI × ETH、DeFi × Infra、公共物品 × 开源建设
- 评审权重：技术执行 35%、创新 30%、实用影响 15%、用户体验 10%、进展 10%
- 奖项概览：总奖池 $15,000，含赛道奖与 Chain for Good 专项奖；赛道一等奖团队将获峰会展示机会

合规与原创：允许使用 AI 辅助；禁止抄袭/拼接他人项目；不得涉及赌博、ICO 或违法违规内容；主办方保留最终解释权。

## 五、提交流程 (How to Submit)

1) Fork 官方 Repo 或在官方提交目录下创建你的项目目录
2) 完成代码与本 README 填写，确保本地可跑通
3) 推送到 GitHub，并在仓库首页显著位置附上 Demo 视频与在线链接
4) 按要求提 PR/登记提交（以官网/群内最新通知为准）

## 六、快速自检清单 (Submission Checklist)

- [ ] README 按模板填写完整（概述、架构、复现、Demo、边界）
- [ ] 本地可一键运行，关键用例可复现
- [ ] （如有）测试网合约地址与验证链接已提供
- [ ] Demo 视频（≤3 分钟，中文）链接可访问
- [ ] 如未完全开源，已在“可验证边界”清晰说明
- [ ] 联系方式与可演示时段已填写


