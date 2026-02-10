**背景与目标**：需要设计一套基于 [agentskills.io](https://agentskills.io/specification) 规范的Agent技能描述文档，以实现Agent之间围绕特定规范引导用户进行**可信、结构化、可审计**的交流。最终产出是一个主协议文件和一系列技能文件，确保交流即使跨越论坛、IM、邮件等不同平台，也能保持语义一致且可被自动校验。

**你的角色**：你是一位资深的协议架构师、执行董事，同时拥有律师资格。

**核心任务**：
基于下方提供的9个PSMD原始文件（条款），创建一套完整的Agent技能描述文件。核心是定义各方Agent引导用户进行结构化交流的协议。

**具体产出要求**：
1.  **主协议文件**：`SKILL.md`。该文件需引用所有技能文件，并明确规定：
- 用户与agent之间用自然语言交流，agent与agent之间使用结构化内容交流。agent根据规范和数据结构引导用户思考和补充信息。
- 一次会话有明确的开始、结束。
  - 开始会话的用户应明确主题、会话过程遵守的规范组合（对应技能描述文件及版本等信息），可以选择其他方或开放参与。
    - 用户可以将其它开放、无约定规范场合进行的交流，中途引入正式会话。这种情形应有明确的衔接信息。
  - 任何阅读到会话信息的用户可以提出其他规范组合，结合原会话主题开始新的会话，新会话信息列入原会话的内容序列中，不可删减。
  - 开始会话的用户可以结束会话。如果用户试图参与已结束会话，agent应提示并拒绝发送。
  - 用户参与一个会话，由agent根据规范组合引导用户发言。未遵守规范的内容，发送方agent拒绝发送、接收方agent向发送方agent给出错误提示，。
- agent之间可以使用实时（比如IM）、非实时（比如论坛、email）等不同交流方式，一次会话可以在不同方式之间切换并保持衔接。
- agent之间可以自动同步会话内容。
- agent应在本地保存其他用户、各种交流方式、各会话内容等信息，并维护数据的有效性、完整性。
- 汇集每个单一规范对应的技能描述文件，及其有效版本。

2.  **技能文件**：单一规范的技能描述文件及各规范的原始文件：
d0111eb4.md 基于 https://xuemen.github.io/PSMD/view/term.d0111eb4.html 
91ff9448.md 基于 https://xuemen.github.io/PSMD/view/term.91ff9448.html
6d206b54.md 基于 https://xuemen.github.io/PSMD/view/term.6d206b54.html
9e6bc34f.md 基于 https://xuemen.github.io/PSMD/view/term.9e6bc34f.html
600f6f80.md 基于 https://xuemen.github.io/PSMD/view/term.600f6f80.html
12119600.md 基于 https://xuemen.github.io/PSMD/view/term.12119600.html
cb4ab0e9.md 基于 https://xuemen.github.io/PSMD/view/term.cb4ab0e9.html
5ab2b2ba.md 基于 https://xuemen.github.io/PSMD/view/term.5ab2b2ba.html
dbe32f79.md 基于 https://xuemen.github.io/PSMD/view/term.dbe32f79.html
- 技能描述文件可以沿用原始文件中的附件、条款序号，除此以外不应该含有任何“原始文件”及其作者的信息，不含PSMD字样。

3. 通用要求：
- 技能描述文件所定义的过程，均由agent判断是否合规，而不依赖编程。
  - 每个技能描述文件包含 Error Patterns (Auto-Detection) 章节
  - 提供自然语言描述的检测规则
  - 提供可直接使用的Prompt模板
  - 返回明确的决策：COMPLIANT / IGNORE / CLARIFY
- 技能描述文件对每种用到的数据结构提供LinkML模型定义，包括：
  - 完整的YAML schema定义
  - 所有枚举类型（enums）
  - 必填字段标记（required: true）
  - 条件字段（if_absent: null）
  - 正则表达式验证（pattern）
- 每个技能描述文件需包含：
  - 至少一个完整的JSON示例
  - 字段级别的验证规则说明
  - 与其他技能的依赖关系（如有）
  - 明确的错误处理行为（忽视/警告/拒绝）
- 技能描述文件应有版本号，版本格式遵循[semver语义化版本控制](https://semver.org/)。
- 所有技能描述文件使用英文撰写，但保留原始条款中的中文附件编号（如Attachment 21）。主协议文件SKILL.md需包含中英文术语对照表。

**重要约束**：
*   所有生成内容必须严格基于提供的原始文件条款，不得捏造条款内容或附件编号。
*   设计应追求实用性与简洁性，便于Agent实现和解析。
