# ETHShanghai 2025 项目快速开始指南

## 🚀 如何创建你的参赛项目

### 方法一：使用模板快速开始（推荐）

1. **复制模板项目**
   ```bash
   # 克隆官方仓库
   git clone https://github.com/ethpanda-org/ETHShanghai-2025.git
   cd ETHShanghai-2025
   
   # 复制模板到你的项目
   cp -r projects/template-project projects/[你的团队名]-[项目名]
   cd projects/[你的团队名]-[项目名]
   ```

2. **重命名项目**
   ```bash
   # 更新项目名称（在 README.md 中）
   sed -i 's/\[项目名称\]/你的实际项目名/g' README.md
   ```

3. **开始开发**
   ```bash
   # 初始化 Git（如果需要）
   git init
   
   # 开始你的开发工作
   ```

### 方法二：从零开始创建

1. **创建项目目录**
   ```bash
   mkdir -p projects/[你的团队名]-[项目名]
   cd projects/[你的团队名]-[项目名]
   ```

2. **创建基础结构**
   ```bash
   mkdir -p {contracts,frontend,backend,deployments,scripts,docs}
   ```

3. **复制 README 模板**
   ```bash
   cp ../../README.md ./README.md
   ```

## 📁 项目结构说明

```
projects/[你的团队名]-[项目名]/
├── contracts/              # 智能合约代码
│   ├── src/               # 合约源码
│   ├── test/              # 测试文件
│   ├── script/            # 部署脚本
│   └── foundry.toml       # Foundry 配置
├── frontend/              # 前端应用
│   ├── src/               # 源代码
│   ├── public/            # 静态资源
│   ├── package.json       # 依赖配置
│   └── .env.local         # 环境变量
├── backend/               # 后端服务
│   ├── src/               # 源代码
│   ├── package.json       # 依赖配置
│   └── .env               # 环境变量
├── deployments/           # 部署记录
│   ├── contracts.json     # 合约地址
│   └── deployment.log     # 部署日志
├── scripts/               # 工具脚本
│   ├── deploy.js          # 部署脚本
│   └── test.js            # 测试脚本
├── docs/                  # 项目文档
│   ├── architecture.md    # 架构文档
│   ├── api.md            # API 文档
│   └── user-guide.md     # 用户指南
├── README.md              # 项目说明（必填）
└── .gitignore            # Git 忽略文件
```

## 🛠️ 开发环境设置

### 智能合约开发

**使用 Foundry（推荐）**
```bash
# 安装 Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 初始化 Foundry 项目
cd contracts
forge init --no-git
```

**使用 Hardhat**
```bash
# 安装 Hardhat
npm install --save-dev hardhat

# 初始化项目
npx hardhat init
```

### 前端开发

**使用 Next.js（推荐）**
```bash
# 创建 Next.js 项目
npx create-next-app@latest frontend --typescript --tailwind --app

# 安装 Web3 依赖
npm install ethers wagmi @rainbow-me/rainbowkit
```

**使用 React + Vite**
```bash
# 创建 Vite 项目
npm create vite@latest frontend -- --template react-ts

# 安装 Web3 依赖
npm install ethers wagmi
```

### 后端开发

**使用 Node.js + Express**
```bash
# 初始化项目
npm init -y
npm install express cors dotenv

# 安装 Web3 依赖
npm install ethers
```

**使用 Python + FastAPI**
```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# 安装依赖
pip install fastapi uvicorn python-dotenv
```

## 🔧 常用命令

### 智能合约
```bash
# 编译合约
forge build

# 运行测试
forge test

# 部署合约
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast

# 验证合约
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> --rpc-url $RPC_URL
```

### 前端
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start
```

## 📝 开发检查清单

### 代码质量
- [ ] 智能合约有完整的测试覆盖
- [ ] 前端代码有适当的错误处理
- [ ] 后端 API 有输入验证
- [ ] 所有敏感信息使用环境变量

### 文档
- [ ] README.md 填写完整
- [ ] 代码有适当的注释
- [ ] API 文档完整
- [ ] 部署说明清晰

### 部署
- [ ] 合约部署到测试网
- [ ] 前端部署到在线平台
- [ ] 后端服务正常运行
- [ ] 所有链接可访问

## 🎯 提交前最终检查

1. **功能测试**
   ```bash
   # 运行所有测试
   npm test
   forge test
   
   # 本地完整流程测试
   npm run dev  # 启动前端
   npm run dev  # 启动后端（另一个终端）
   ```

2. **文档检查**
   - [ ] README.md 所有必填项已填写
   - [ ] Demo 视频已录制并上传
   - [ ] 所有链接可访问
   - [ ] 联系方式已填写

3. **提交准备**
   ```bash
   # 添加所有文件
   git add .
   
   # 提交更改
   git commit -m "Complete project submission"
   
   # 推送到你的仓库
   git push origin main
   ```

## 🆘 常见问题

### Q: 如何获取测试网 ETH？
A: 使用 Sepolia 水龙头：https://sepoliafaucet.com/

### Q: 如何验证智能合约？
A: 使用 Foundry 或 Hardhat 插件进行验证

### Q: 前端如何连接测试网？
A: 在 MetaMask 中添加 Sepolia 网络，或使用 WalletConnect

### Q: 如何录制 Demo 视频？
A: 使用 OBS Studio、Loom 或简单的屏幕录制工具

## 📞 获取帮助

- GitHub Issues: 在官方仓库提交问题
- 官方微信群: 加入比赛交流群
- 邮件支持: 联系主办方技术支持

---

**祝你开发顺利，在 ETHShanghai 2025 中取得好成绩！** 🏆
