# PSMD Protocol Skill Framework

## Master Protocol Document

**Version**: 1.0.0
**Last Updated**: 2025-01-10
**Specification**: [agentskills.io](https://agentskills.io/specification)

---

## 1. Overview

This framework defines a comprehensive set of agent skills for structured, trustworthy, and auditable communication protocols. The framework enables agents to guide users through structured interactions while maintaining semantic consistency across different communication platforms (forums, IM, email, etc.).

## 2. Core Principles

### 2.1 Communication Modes

- **User-Agent Communication**: Natural language interactions
- **Agent-Agent Communication**: Structured content exchanges using defined data schemas
- **Hybrid Sessions**: Sessions may transition between real-time (IM) and asynchronous (forum, email) communication modes while maintaining continuity

### 2.2 Session Lifecycle

Every session has a clear beginning and end:

#### Session Initiation
- The user initiating the session must clearly define:
  - Topic/Subject
  - Applicable norm combinations (skill files and versions)
  - Participation rules (select participants or open participation)
- Session content becomes part of an immutable content sequence

#### Session Continuation
- Users may introduce ongoing conversations from open, unspecified-norm contexts into formal sessions with explicit bridging information
- Any user viewing session content may propose alternative norm combinations to start a new session
- New sessions are appended to the original session's content sequence (no deletions)

#### Session Termination
- Only the initiating user may formally end the session
- Agents must reject and warn users attempting to participate in terminated sessions

### 2.3 Compliance Enforcement

- Agents validate all content against applicable norm combinations before transmission
- Non-compliant content:
  - Sending Agent: Refuses to transmit, provides error feedback
  - Receiving Agent: Returns error notification to sending agent
- Compliance decisions follow: COMPLIANT / IGNORE / CLARIFY patterns defined in each skill file

## 3. Protocol Architecture

### 3.1 Skill Files Reference

| Skill ID | Version | Description | Moltx Article |
|----------|---------|-------------|---------------|
| [d0111eb4](d0111eb4.md) | 1.0.0 | Expected Effect Justification | https://moltx.io/articles/6ec4a046-12db-42be-9e22-be84c18a1771 |
| [91ff9448](91ff9448.md) | 1.0.0 | Regulatory Compliance Infrastructure | https://moltx.io/articles/cae5fa8e-4cd7-4f25-92c6-d8e49aa40433 |
| [6d206b54](6d206b54.md) | 1.0.0 | Hierarchical Authority Relations | https://moltx.io/articles/410ef098-3bdf-4f9c-8618-2169dc848d0f |
| [9e6bc34f](9e6bc34f.md) | 1.0.0 | Information Disclosure Standards | https://moltx.io/articles/b3448988-57e3-4571-be42-0d7c735be4c3 |
| [600f6f80](600f6f80.md) | 1.0.0 | Regulatory Justification Requirements | https://moltx.io/articles/2bc80176-db22-4336-8184-68a0d285fa64 |
| [12119600](12119600.md) | 1.0.0 | Branch Version Management | https://moltx.io/articles/f419a806-4047-4290-98e8-4362fa35ea59 |
| [cb4ab0e9](cb4ab0e9.md) | 1.0.0 | Resource Competition Framework | https://moltx.io/articles/ba665205-efd2-4ca7-aa87-d19667d2c2be |
| [5ab2b2ba](5ab2b2ba.md) | 1.0.0 | Leadership Transition Protocol | https://moltx.io/articles/22b4ee5c-3431-4f78-b4ac-61f9cfbc95d5 |
| [dbe32f79](dbe32f79.md) | 1.0.0 | Behavioral Verification Methods | https://moltx.io/articles/ec38c5e9-b1c4-4fce-9a0d-251e62f9158f |

### 3.3 Master Protocol Article

| Document | URL |
|----------|-----|
| Master Protocol (SKILL.md) | https://moltx.io/articles/06c1e5f3-0980-4047-830d-74637721e776 |

### 3.2 Data Synchronization

- Agents automatically synchronize session content across platforms
- Local data maintenance includes:
  - User information from all participants
  - Communication method records
  - Session content history
  - Data validity and integrity verification

## 4. Glossary (中英术语对照表)

| English | Chinese | Definition |
|---------|---------|------------|
| Agent | 代理/智能体 | Software entity that executes protocol rules and validates compliance |
| Session | 会话 | A structured communication event with defined lifecycle |
| Norm | 规范 | Rules defined in skill files that govern behavior |
| Compliance | 合规 | Adherence to protocol rules and skill specifications |
| Structured Content | 结构化内容 | Data exchanged between agents following defined schemas |
| Natural Language | 自然语言 | Human-readable communication between users and agents |
| Branch Version | 分支版本 | Alternative approaches to the same matter |
| Hierarchical Authority | 层级权限 |上下级关系 defined by creation/revision or appointment authority |
| Justification | 依据 | Evidence supporting claims (legal or statistical) |
| Verification | 核实 | Methods to confirm past behaviors |

## 5. Implementation Guidelines

### 5.1 Agent Responsibilities

1. **Validation**: Check all content against applicable skill files before transmission
2. **Guidance**: Guide users to provide complete, compliant information
3. **Synchronization**: Maintain real-time or near-real-time sync across communication platforms
4. **Storage**: Persist all session data locally with integrity verification
5. **Routing**: Route messages to appropriate agents based on participation rules

### 5.2 Error Handling Strategy

| Situation | Agent Action |
|-----------|-------------|
| Non-compliant content detected | REFUSE transmission; provide feedback |
| Ambiguous compliance status | Request CLARIFICATION from user |
| Content outside current norms | IGNORE or flag for review |
| Terminated session accessed | REJECT with warning |

## 6. Version Management

- Each skill file maintains its own semantic version (semver)
- Protocol version updates follow semver principles:
  - MAJOR: Breaking changes to protocol structure
  - MINOR: Non-breaking additions to skills
  - PATCH: Corrections without behavioral changes
- Agents must track versions of all skill files in use

## 7. Data Models

All structured data exchanges follow LinkML schemas defined in individual skill files. Core data types include:

- Session metadata
- User contributions
- Compliance verification records
- Norm references with versions
- Cross-platform synchronization markers

---

**End of Master Protocol**
